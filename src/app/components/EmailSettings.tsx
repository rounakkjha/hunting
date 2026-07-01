import { useState, useEffect } from 'react';
import { Mail, Settings, Clock, CheckCircle, AlertCircle, RefreshCw, Plus, Calendar, Bell, Loader2, BarChart3 } from 'lucide-react';
import { gmailService, type GmailAuthResult } from '../utils/gmail';
import { emailScheduler, type EmailTemplate } from '../utils/emailScheduler';
import { emailSender } from '../utils/emailSender';
import EmailTemplates from './EmailTemplates';
import AdvancedEmailSettings from './AdvancedEmailSettings';
import EmailAnalytics from './EmailAnalytics';
import type { EmailSettings, ScheduledEmail } from '../App';

interface EmailSettingsProps {
  emailSettings?: EmailSettings;
  scheduledEmails?: ScheduledEmail[];
  onUpdateSettings: (settings: EmailSettings) => void;
  onDeleteScheduledEmail: (id: string) => void;
}

export default function EmailSettings({ 
  emailSettings, 
  scheduledEmails = [], 
  onUpdateSettings, 
  onDeleteScheduledEmail 
}: EmailSettingsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'templates' | 'advanced' | 'analytics'>('settings');
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 'follow-up-1',
      name: 'Standard Follow-up',
      subject: 'Following up - {{role}} at {{company}}',
      body: `Hi {{name}},

I hope you're doing well.

I wanted to follow up on my previous email regarding the {{role}} position at {{company}}. I'm very interested in this opportunity and believe my skills in [mention specific skills] would be a great fit for your team.

Would you be available for a brief chat this week to discuss how I can contribute to {{company}}?

Best regards,
{{senderName}}`,
      variables: ['name', 'company', 'role', 'senderName'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'follow-up-2',
      name: 'Brief Follow-up',
      subject: 'Quick follow-up - {{role}}',
      body: `Hi {{name}},

Just wanted to quickly follow up on my email about the {{role}} position at {{company}}.

Is this still available? I'd love to learn more.

Thanks,
{{senderName}}`,
      variables: ['name', 'company', 'role', 'senderName'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'follow-up-3',
      name: 'Value-focused Follow-up',
      subject: 'Adding value to {{company}}',
      body: `Hi {{name}},

Following up on the {{role}} opportunity at {{company}}.

I've been following {{company}}'s work in [specific area] and I'm impressed by [specific achievement]. With my experience in [relevant skill], I believe I could help [specific value proposition].

Would you be open to discussing how I can contribute to your team?

Best,
{{senderName}}`,
      variables: ['name', 'company', 'role', 'senderName'],
      createdAt: new Date().toISOString(),
    },
  ]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [formData, setFormData] = useState({
    email: '',
    fromName: '',
    autoSendEnabled: false,
    followUpDelay: 3,
    scheduleTime: '09:00',
  });

  useEffect(() => {
    if (emailSettings) {
      setFormData({
        email: emailSettings.email || '',
        fromName: emailSettings.fromName || '',
        autoSendEnabled: emailSettings.autoSendEnabled || false,
        followUpDelay: emailSettings.followUpDelay || 3,
        scheduleTime: emailSettings.scheduleTime || '09:00',
      });
    }
  }, [emailSettings]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await gmailService.authenticate();
      if (result.success) {
        const newSettings: EmailSettings = {
          id: Date.now().toString(),
          provider: 'gmail',
          email: result.email!,
          fromName: formData.fromName || result.email!.split('@')[0],
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          isConnected: true,
          autoSendEnabled: formData.autoSendEnabled,
          followUpDelay: formData.followUpDelay,
          scheduleTime: formData.scheduleTime,
          lastSync: new Date().toISOString(),
        };
        onUpdateSettings(newSettings);
        setShowSettings(false);
      } else {
        alert('Failed to connect Gmail: ' + result.error);
      }
    } catch (error) {
      alert('Error connecting Gmail: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      if (emailSettings?.refreshToken) {
        await gmailService.revokeToken(emailSettings.refreshToken);
      }
      onUpdateSettings({
        ...emailSettings!,
        isConnected: false,
        accessToken: undefined,
        refreshToken: undefined,
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSaveSettings = () => {
    if (!emailSettings) return;
    
    const updatedSettings = {
      ...emailSettings,
      ...formData,
    };
    onUpdateSettings(updatedSettings);
    setShowSettings(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleTemplateCreate = (template: Omit<EmailTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleTemplateUpdate = (templateId: string, updates: Partial<EmailTemplate>) => {
    setTemplates(templates.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    ));
  };

  const handleTemplateDelete = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(templates[0]?.id || '');
    }
  };

  const handleSendTestEmail = async () => {
    if (!emailSettings) return;
    
    try {
      const result = await emailSender.sendTestEmail(emailSettings);
      if (result.success) {
        alert('Test email sent successfully! Please check your inbox.');
      } else {
        alert('Failed to send test email: ' + result.error);
      }
    } catch (error) {
      alert('Error sending test email: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Email Automation</h1>
        <p className="text-muted-foreground">Configure automatic follow-up emails for your cold outreach</p>
      </div>

      {/* Connection Status Card */}
      <div className={`rounded-lg border p-4 mb-6 ${
        emailSettings?.isConnected 
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
          : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              emailSettings?.isConnected 
                ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' 
                : 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
            }`}>
              {emailSettings?.isConnected ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {emailSettings?.isConnected ? 'Email Connected' : 'Email Not Connected'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {emailSettings?.isConnected 
                  ? `Connected to ${emailSettings.email}` 
                  : 'Connect your Gmail account to enable automatic follow-ups'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {emailSettings?.isConnected ? (
              <>
                <button
                  onClick={handleSendTestEmail}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Send Test Email"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50"
                  title="Disconnect"
                >
                  {isDisconnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Connect Email
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {emailSettings?.isConnected && (
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'templates'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'advanced'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            Advanced
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'analytics'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </div>
      )}

      {/* Tab Content */}
      {emailSettings?.isConnected && (
        <div className="bg-card rounded-lg border p-6">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Email Settings</h2>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">From Name</label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={(e) => onUpdateSettings({ ...emailSettings, fromName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Follow-up Delay (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={emailSettings.followUpDelay}
                    onChange={(e) => onUpdateSettings({ ...emailSettings, followUpDelay: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Schedule Time</label>
                  <input
                    type="time"
                    value={emailSettings.scheduleTime}
                    onChange={(e) => onUpdateSettings({ ...emailSettings, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSend"
                    checked={emailSettings.autoSendEnabled}
                    onChange={(e) => onUpdateSettings({ ...emailSettings, autoSendEnabled: e.target.checked })}
                    className="w-4 h-4 text-primary border rounded focus:ring-primary"
                  />
                  <label htmlFor="autoSend" className="text-sm font-medium">
                    Enable automatic follow-up sending
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <EmailTemplates
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={setSelectedTemplateId}
              onTemplateCreate={handleTemplateCreate}
              onTemplateUpdate={handleTemplateUpdate}
              onTemplateDelete={handleTemplateDelete}
            />
          )}

          {activeTab === 'advanced' && (
            <AdvancedEmailSettings
              emailSettings={emailSettings}
              onUpdateSettings={onUpdateSettings}
            />
          )}

          {activeTab === 'analytics' && (
            <EmailAnalytics
              scheduledEmails={scheduledEmails}
              onRetryEmail={(emailId) => {
                console.log('Retry email:', emailId);
              }}
            />
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg border p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {emailSettings?.isConnected ? 'Email Settings' : 'Connect Gmail Account'}
            </h3>
            
            {!emailSettings?.isConnected ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    value={formData.fromName}
                    onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting || !formData.fromName}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'Connect Gmail'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Connected to {emailSettings.email}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 border rounded-md hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}