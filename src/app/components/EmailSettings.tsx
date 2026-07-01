import { useState, useEffect } from 'react';
import { Mail, Settings, Clock, CheckCircle, AlertCircle, RefreshCw, Trash2, Plus, Calendar, Bell, Loader2 } from 'lucide-react';
import type { EmailSettings, ScheduledEmail } from '../App';
import { gmailService, type GmailAuthResult } from '../utils/gmail';

interface EmailSettingsProps {
  emailSettings?: EmailSettings;
  scheduledEmails?: ScheduledEmail[];
  onUpdateSettings: (settings: EmailSettings) => void;
  onDeleteScheduledEmail: (id: string) => void;
}

export default function EmailSettings({ 
  emailSettings, 
  scheduledEmails, 
  onUpdateSettings, 
  onDeleteScheduledEmail 
}: EmailSettingsProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fromName: '',
    followUpDelay: 3,
    scheduleTime: '09:00',
    autoSendEnabled: true,
  });

  useEffect(() => {
    if (emailSettings) {
      setFormData({
        email: emailSettings.email,
        fromName: emailSettings.fromName,
        followUpDelay: emailSettings.followUpDelay,
        scheduleTime: emailSettings.scheduleTime,
        autoSendEnabled: emailSettings.autoSendEnabled,
      });
    }
  }, [emailSettings]);

  

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    try {
      // Store form data for after OAuth callback
      const connectSettings = {
        email: formData.email,
        fromName: formData.fromName,
        autoSendEnabled: formData.autoSendEnabled,
        followUpDelay: formData.followUpDelay,
        scheduleTime: formData.scheduleTime,
      };
      
      // Initiate OAuth flow with popup
      const authResult = await gmailService.initiateOAuth();
      
      // Create email settings with OAuth tokens
      const newSettings: EmailSettings = {
        id: Date.now().toString(),
        provider: 'gmail',
        email: authResult.email,
        fromName: connectSettings.fromName,
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        isConnected: true,
        autoSendEnabled: connectSettings.autoSendEnabled,
        followUpDelay: connectSettings.followUpDelay,
        scheduleTime: connectSettings.scheduleTime,
        lastSync: new Date().toISOString(),
      };
      
      onUpdateSettings(newSettings);
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to connect Gmail:', error);
      alert('Failed to connect Gmail: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (emailSettings && confirm('Are you sure you want to disconnect your email account?')) {
      const disconnectedSettings = { ...emailSettings, isConnected: false, accessToken: undefined, refreshToken: undefined };
      onUpdateSettings(disconnectedSettings);
    }
  };

  const handleUpdateSettings = () => {
    if (emailSettings) {
      const updatedSettings = {
        ...emailSettings,
        email: formData.email,
        fromName: formData.fromName,
        followUpDelay: formData.followUpDelay,
        scheduleTime: formData.scheduleTime,
        autoSendEnabled: formData.autoSendEnabled,
      };
      onUpdateSettings(updatedSettings);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const pendingEmails = (scheduledEmails || []).filter(e => !e.sent);
  const sentEmails = (scheduledEmails || []).filter(e => e.sent);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Email Automation</h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Configure automatic follow-up emails for your cold outreach
          </p>
        </div>
        {!emailSettings?.isConnected && (
          <div className="shrink-0">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap text-sm"
            >
              <Plus className="w-4 h-4" />
              Connect Email
            </button>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className={`rounded-2xl border p-4 sm:p-6 ${
        emailSettings?.isConnected 
          ? 'border-green-500/20 bg-green-500/5' 
          : 'border-amber-500/20 bg-amber-500/5'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={`p-3 rounded-xl ${
            emailSettings?.isConnected 
              ? 'bg-green-500/10 text-green-500' 
              : 'bg-amber-500/10 text-amber-500'
          }`}>
            {emailSettings?.isConnected ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg">
              {emailSettings?.isConnected ? 'Email Connected' : 'Email Not Connected'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground break-words">
              {emailSettings?.isConnected 
                ? `Connected to ${emailSettings.email}` 
                : 'Connect your Gmail account to enable automatic follow-ups'
              }
            </p>
            {emailSettings?.lastSync && (
              <p className="text-xs text-muted-foreground mt-1">
                Last sync: {formatDate(emailSettings.lastSync)}
              </p>
            )}
          </div>
          {emailSettings?.isConnected && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleDisconnect}
                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                title="Disconnect"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {emailSettings?.isConnected ? 'Email Settings' : 'Connect Gmail'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                  placeholder="your.email@gmail.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={formData.fromName}
                  onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Follow-up Delay (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.followUpDelay}
                  onChange={(e) => setFormData({ ...formData, followUpDelay: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Schedule Time</label>
                <input
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSend"
                  checked={formData.autoSendEnabled}
                  onChange={(e) => setFormData({ ...formData, autoSendEnabled: e.target.checked })}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
                <label htmlFor="autoSend" className="text-sm font-medium">
                  Enable automatic follow-up sending
                </label>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              {emailSettings?.isConnected ? (
                <>
                  <button
                    onClick={handleUpdateSettings}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConnectGmail}
                    disabled={isConnecting || !formData.email || !formData.fromName}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Gmail'
                    )}
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Emails */}
      {emailSettings?.isConnected && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Emails
          </h3>
          
          {pendingEmails.length === 0 && sentEmails.length === 0 ? (
            <div className="text-center py-12 border border-border/50 rounded-2xl">
              <Mail className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No emails scheduled yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Follow-up emails will be scheduled automatically when you send cold emails
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEmails.length > 0 && (
                <div>
                  <h4 className="font-medium text-amber-500 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending ({pendingEmails.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingEmails.map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Follow-up Email</p>
                          <p className="text-xs text-muted-foreground">
                            Scheduled for: {formatDate(email.scheduledFor)}
                          </p>
                        </div>
                        <button
                          onClick={() => onDeleteScheduledEmail(email.id)}
                          className="p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                          title="Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {sentEmails.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-500 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Sent ({sentEmails.length})
                  </h4>
                  <div className="space-y-2">
                    {sentEmails.slice(0, 5).map((email) => (
                      <div key={email.id} className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Follow-up Email</p>
                          <p className="text-xs text-muted-foreground">
                            Sent: {email.sentAt && formatDate(email.sentAt)}
                          </p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                    {sentEmails.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{sentEmails.length - 5} more sent emails
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}