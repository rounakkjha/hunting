import { gmailService } from './gmail';
import type { EmailSettings, ScheduledEmail, ColdEmail } from '../App';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
}

export class EmailScheduler {
  private static instance: EmailScheduler;
  private intervalId: NodeJS.Timeout | null = null;
  
  static getInstance(): EmailScheduler {
    if (!EmailScheduler.instance) {
      EmailScheduler.instance = new EmailScheduler();
    }
    return EmailScheduler.instance;
  }

  // Start the scheduler
  start(emailSettings: EmailSettings, scheduledEmails: ScheduledEmail[], onUpdate: (emails: ScheduledEmail[]) => void) {
    this.stop(); // Clear any existing interval
    
    // Check every minute for scheduled emails
    this.intervalId = setInterval(() => {
      this.checkAndSendScheduledEmails(emailSettings, scheduledEmails, onUpdate);
    }, 60000); // 1 minute
  }

  // Stop the scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Schedule a follow-up email for a cold email
  scheduleFollowUp(
    coldEmail: ColdEmail,
    emailSettings: EmailSettings,
    existingScheduledEmails: ScheduledEmail[]
  ): ScheduledEmail[] {
    // Don't schedule if email is already a follow-up or has a response
    if (coldEmail.isFollowUp || coldEmail.gotResponse || coldEmail.followUpDone) {
      return existingScheduledEmails;
    }

    // Check if follow-up is already scheduled for this email
    const alreadyScheduled = existingScheduledEmails.some(
      scheduled => scheduled.coldEmailId === coldEmail.id && !scheduled.sent
    );

    if (alreadyScheduled) {
      return existingScheduledEmails;
    }

    // Calculate scheduled date
    const sentDate = new Date(coldEmail.date);
    const scheduledDate = new Date(sentDate);
    scheduledDate.setDate(scheduledDate.getDate() + emailSettings.followUpDelay);

    // Set the scheduled time
    const [hours, minutes] = emailSettings.scheduleTime.split(':').map(Number);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // Don't schedule if the date is in the past
    if (scheduledDate <= new Date()) {
      return existingScheduledEmails;
    }

    const newScheduledEmail: ScheduledEmail = {
      id: Date.now().toString(),
      coldEmailId: coldEmail.id,
      userId: 'current-user', // This would come from auth context
      scheduledFor: scheduledDate.toISOString(),
      template: this.generateFollowUpTemplate(coldEmail),
      sent: false,
      createdAt: new Date().toISOString(),
    };

    return [...existingScheduledEmails, newScheduledEmail];
  }

  // Check and send scheduled emails that are due
  private async checkAndSendScheduledEmails(
    emailSettings: EmailSettings,
    scheduledEmails: ScheduledEmail[],
    onUpdate: (emails: ScheduledEmail[]) => void
  ) {
    if (!emailSettings.isConnected || !emailSettings.autoSendEnabled) {
      return;
    }

    const now = new Date();
    const dueEmails = scheduledEmails.filter(email => 
      !email.sent && 
      new Date(email.scheduledFor) <= now
    );

    if (dueEmails.length === 0) {
      return;
    }

    for (const scheduledEmail of dueEmails) {
      try {
        await this.sendScheduledEmail(scheduledEmail, emailSettings);
        
        // Update the email as sent
        const updatedEmails = scheduledEmails.map(email =>
          email.id === scheduledEmail.id
            ? { ...email, sent: true, sentAt: new Date().toISOString() }
            : email
        );
        
        onUpdate(updatedEmails);
      } catch (error) {
        console.error(`Failed to send scheduled email ${scheduledEmail.id}:`, error);
        
        // Update with error
        const updatedEmails = scheduledEmails.map(email =>
          email.id === scheduledEmail.id
            ? { ...email, error: error instanceof Error ? error.message : 'Unknown error' }
            : email
        );
        
        onUpdate(updatedEmails);
      }
    }
  }

  // Send a scheduled email
  private async sendScheduledEmail(scheduledEmail: ScheduledEmail, emailSettings: EmailSettings) {
    // Parse the template to get recipient and content
    const template = this.parseTemplate(scheduledEmail.template);
    
    if (!template.to || !template.subject || !template.body) {
      throw new Error('Invalid email template');
    }

    // Check if access token needs refresh
    let accessToken = emailSettings.accessToken!;
    if (emailSettings.refreshToken && gmailService.isTokenExpired(Date.now())) {
      accessToken = await gmailService.refreshAccessToken(emailSettings.refreshToken);
    }

    // Send the email
    await gmailService.sendEmail(template.to, template.subject, template.body, accessToken);
  }

  // Generate follow-up email template
  private generateFollowUpTemplate(coldEmail: ColdEmail): string {
    const template = {
      to: coldEmail.email,
      subject: `Following up - ${coldEmail.role || 'opportunity'} at ${coldEmail.company}`,
      body: `Hi ${coldEmail.email?.split('@')[0] || 'there'},

I hope you're doing well.

I wanted to follow up on my previous email regarding the ${coldEmail.role || 'opportunity'} position at ${coldEmail.company}. I'm still very interested in this opportunity and believe my skills would be a great fit for your team.

Please let me know if you'd like to schedule a brief call to discuss this further.

Best regards`
    };

    return JSON.stringify(template);
  }

  // Parse email template
  private parseTemplate(templateString: string): { to: string; subject: string; body: string } {
    try {
      return JSON.parse(templateString);
    } catch (error) {
      throw new Error('Invalid template format');
    }
  }

  // Get default email templates
  getDefaultTemplates(): EmailTemplate[] {
    return [
      {
        id: 'follow-up-1',
        name: 'Standard Follow-up',
        subject: 'Following up - {{role}} at {{company}}',
        body: `Hi {{name}},

I hope you're doing well.

I wanted to follow up on my previous email regarding the {{role}} position at {{company}}. I'm still very interested in this opportunity and believe my skills would be a great fit for your team.

Please let me know if you'd like to schedule a brief call to discuss this further.

Best regards`,
        variables: ['name', 'role', 'company']
      },
      {
        id: 'follow-up-2',
        name: 'Brief Follow-up',
        subject: 'Re: {{role}} at {{company}}',
        body: `Hi {{name}},

Just wanted to quickly follow up on my application for the {{role}} position at {{company}}.

Is there any update on the hiring process? I'm excited about this opportunity.

Thanks!`,
        variables: ['name', 'role', 'company']
      },
      {
        id: 'follow-up-3',
        name: 'Value-focused Follow-up',
        subject: 'Quick question about {{role}} at {{company}}',
        body: `Hi {{name}},

I hope you've had a chance to review my application for the {{role}} position.

I wanted to highlight how my experience in [specific skill] could help {{company}} with [specific challenge]. Would love to discuss this further.

Best regards`,
        variables: ['name', 'role', 'company']
      }
    ];
  }

  // Get upcoming scheduled emails
  getUpcomingEmails(scheduledEmails: ScheduledEmail[], hours: number = 24): ScheduledEmail[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    
    return scheduledEmails
      .filter(email => !email.sent)
      .filter(email => {
        const scheduledDate = new Date(email.scheduledFor);
        return scheduledDate > now && scheduledDate <= cutoff;
      })
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  }

  // Get overdue emails
  getOverdueEmails(scheduledEmails: ScheduledEmail[]): ScheduledEmail[] {
    const now = new Date();
    
    return scheduledEmails
      .filter(email => !email.sent && !email.error)
      .filter(email => new Date(email.scheduledFor) < now)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  }

  // Get failed emails
  getFailedEmails(scheduledEmails: ScheduledEmail[]): ScheduledEmail[] {
    return scheduledEmails
      .filter(email => email.error && !email.sent)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

// Export singleton instance
export const emailScheduler = EmailScheduler.getInstance();