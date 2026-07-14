import { gmailService } from './gmail';
import { emailScheduler } from './emailScheduler';
import type { EmailSettings, ScheduledEmail, ColdEmail } from '../App';

export interface ResumeAttachment {
  name: string;
  data: string; // base64 data URL
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  sentAt: string;
}

export interface EmailAnalytics {
  id: string;
  scheduledEmailId: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bounced: boolean;
  bounceReason?: string;
}

export class EmailSender {
  private static instance: EmailSender;
  private sendingInProgress = new Set<string>();
  
  static getInstance(): EmailSender {
    if (!EmailSender.instance) {
      EmailSender.instance = new EmailSender();
    }
    return EmailSender.instance;
  }

  // Send a scheduled email with full tracking and error handling
  async sendScheduledEmail(
    scheduledEmail: ScheduledEmail,
    emailSettings: EmailSettings,
    coldEmail: ColdEmail,
    resumeOverride?: ResumeAttachment // optional: used when coldEmail has no resume but user set a default
  ): Promise<EmailSendResult> {
    // Prevent duplicate sends
    if (this.sendingInProgress.has(scheduledEmail.id)) {
      return {
        success: false,
        error: 'Email already being sent',
        sentAt: new Date().toISOString(),
      };
    }

    this.sendingInProgress.add(scheduledEmail.id);

    try {
      // Parse the email template
      const emailContent = this.parseAndPersonalizeTemplate(scheduledEmail.template, coldEmail);
      
      if (!emailContent.to || !emailContent.subject || !emailContent.body) {
        throw new Error('Invalid email template content');
      }

      // Check if we need to refresh the access token
      let accessToken = emailSettings.accessToken!;
      if (emailSettings.refreshToken && gmailService.isTokenExpired(emailSettings.expiresAt ?? 0)) {
        const refreshed = await gmailService.refreshAccessToken(emailSettings.refreshToken);
        accessToken = refreshed.accessToken;
        // Caller should persist the updated expiresAt — we can't mutate emailSettings here,
        // but we carry the new token for this send operation.
      }

      // Add tracking pixels if enabled
      const finalBody = this.addTrackingPixels(
        emailContent.body,
        scheduledEmail.id,
        emailSettings
      );

      // Determine resume attachment: prefer the one on the cold email entry, fall back to the override
      const attachment: { name: string; data: string } | undefined =
        (coldEmail.resumeData && coldEmail.resumeName)
          ? { name: coldEmail.resumeName, data: coldEmail.resumeData }
          : resumeOverride;

      // Send the email via Gmail API
      const messageId = await gmailService.sendEmail(
        emailContent.to,
        emailContent.subject,
        finalBody,
        accessToken,
        attachment
      );

      const result: EmailSendResult = {
        success: true,
        messageId,
        sentAt: new Date().toISOString(),
      };

      // Log the send event
      this.logEmailEvent(scheduledEmail.id, 'sent', { messageId });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log the error
      this.logEmailEvent(scheduledEmail.id, 'error', { error: errorMessage });

      return {
        success: false,
        error: errorMessage,
        sentAt: new Date().toISOString(),
      };

    } finally {
      this.sendingInProgress.delete(scheduledEmail.id);
    }
  }

  // Parse and personalize email template with recipient data
  private parseAndPersonalizeTemplate(templateString: string, coldEmail: ColdEmail): {
    to: string;
    subject: string;
    body: string;
  } {
    try {
      const template = JSON.parse(templateString);
      
      // Use contact name if available, otherwise extract from email
      const recipientName = coldEmail.contactName || coldEmail.email?.split('@')[0] || 'there';
      
      // Replace variables
      let subject = template.subject;
      let body = template.body;
      
      const replacements: Record<string, string> = {
        name: recipientName,
        company: coldEmail.company,
        role: coldEmail.role || 'opportunity',
        days: Math.floor((Date.now() - new Date(coldEmail.date).getTime()) / (1000 * 60 * 60 * 24)).toString(),
        senderName: (coldEmail as any).fromName || 'Job Seeker',
      };

      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });

      return {
        to: coldEmail.email,
        subject,
        body,
      };

    } catch (error) {
      throw new Error('Failed to parse email template');
    }
  }

  // Add tracking pixels and analytics to email body
  private addTrackingPixels(
    body: string,
    scheduledEmailId: string,
    emailSettings: EmailSettings
  ): string {
    let finalBody = body;

    // Add open tracking pixel if enabled
    if (emailSettings.trackOpens) {
      const trackingPixel = `<img src="${window.location.origin}/api/email/open?id=${scheduledEmailId}" width="1" height="1" style="display:none;" alt="">`;
      finalBody = finalBody + '\n\n' + trackingPixel;
    }

    // Add click tracking to links if enabled
    if (emailSettings.trackClicks) {
      // Convert all links to tracked links
      const linkRegex = /href="([^"]+)"/g;
      finalBody = finalBody.replace(linkRegex, (match, url) => {
        return `href="${window.location.origin}/api/email/click?id=${scheduledEmailId}&url=${encodeURIComponent(url)}"`;
      });
    }

    return finalBody;
  }

  // Log email events for analytics
  private logEmailEvent(scheduledEmailId: string, event: string, data: any = {}) {
    const logEntry = {
      scheduledEmailId,
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Store in localStorage for now (in production, this would go to a database)
    const existingLogs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 1000 logs to prevent storage issues
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('emailLogs', JSON.stringify(existingLogs));
    console.log('Email event logged:', logEntry);
  }

  // Get email analytics for a scheduled email
  getEmailAnalytics(scheduledEmailId: string): EmailAnalytics | null {
    const logs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    const emailLogs = logs.filter((log: any) => log.scheduledEmailId === scheduledEmailId);
    
    if (emailLogs.length === 0) return null;

    const analytics: EmailAnalytics = {
      id: scheduledEmailId,
      scheduledEmailId,
      sentAt: '',
      bounced: false,
    };

    emailLogs.forEach((log: any) => {
      switch (log.event) {
        case 'sent':
          analytics.sentAt = log.timestamp;
          break;
        case 'delivered':
          analytics.deliveredAt = log.timestamp;
          break;
        case 'opened':
          analytics.openedAt = log.timestamp;
          break;
        case 'clicked':
          analytics.clickedAt = log.timestamp;
          break;
        case 'bounced':
          analytics.bounced = true;
          analytics.bounceReason = log.data.reason;
          break;
      }
    });

    return analytics;
  }

  // Get all email logs
  getAllEmailLogs(): any[] {
    return JSON.parse(localStorage.getItem('emailLogs') || '[]');
  }

  // Send test email to verify configuration
  async sendTestEmail(emailSettings: EmailSettings): Promise<EmailSendResult> {
    if (!emailSettings.isConnected) {
      return {
        success: false,
        error: 'Email account not connected',
        sentAt: new Date().toISOString(),
      };
    }

    try {
      let accessToken = emailSettings.accessToken!;
      if (emailSettings.refreshToken && gmailService.isTokenExpired(emailSettings.expiresAt ?? 0)) {
        const refreshed = await gmailService.refreshAccessToken(emailSettings.refreshToken);
        accessToken = refreshed.accessToken;
      }

      const testSubject = 'Job Search Tracker - Test Email';
      const testBody = `Hi ${emailSettings.fromName},

This is a test email from your Job Search Tracker email automation system.

If you're receiving this email, your Gmail integration is working correctly!

Best regards,
Job Search Tracker Team`;

      const messageId = await gmailService.sendEmail(
        emailSettings.email,
        testSubject,
        testBody,
        accessToken
      );

      return {
        success: true,
        messageId,
        sentAt: new Date().toISOString(),
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date().toISOString(),
      };
    }
  }

  // Retry failed emails
  async retryFailedEmail(
    scheduledEmail: ScheduledEmail,
    emailSettings: EmailSettings,
    coldEmails: ColdEmail[]
  ): Promise<EmailSendResult> {
    const coldEmail = coldEmails.find(email => email.id === scheduledEmail.coldEmailId);
    if (!coldEmail) {
      return {
        success: false,
        error: 'Original cold email not found',
        sentAt: new Date().toISOString(),
      };
    }

    // Clear the error and retry
    const cleanScheduledEmail = { ...scheduledEmail, error: undefined };
    return this.sendScheduledEmail(cleanScheduledEmail, emailSettings, coldEmail);
  }

  // Get email statistics
  getEmailStats(): {
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  } {
    const logs = JSON.parse(localStorage.getItem('emailLogs') || '[]');
    
    const sent = logs.filter((log: any) => log.event === 'sent').length;
    const opened = logs.filter((log: any) => log.event === 'opened').length;
    const clicked = logs.filter((log: any) => log.event === 'clicked').length;
    const bounced = logs.filter((log: any) => log.event === 'bounced').length;

    return {
      totalSent: sent,
      totalOpened: opened,
      totalClicked: clicked,
      totalBounced: bounced,
      openRate: sent > 0 ? (opened / sent) * 100 : 0,
      clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
      bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
    };
  }
}

// Export singleton instance
export const emailSender = EmailSender.getInstance();