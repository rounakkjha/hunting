import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { addDays, isAfter, isToday, format } from 'date-fns';
import {
  Mail, Settings, Clock, CheckCircle, AlertCircle,
  Plus, Loader2, Trash2, X, Star,
  Send, Calendar, User, Ban, Info,
  CheckSquare, Square,
} from 'lucide-react';
import { gmailService } from '../utils/gmail';
import { emailScheduler, type EmailTemplate } from '../utils/emailScheduler';
import { emailSender } from '../utils/emailSender';
import EmailTemplates from './EmailTemplates';
import type { EmailSettings, ScheduledEmail, ColdEmail } from '../App';

interface EmailSettingsProps {
  emailSettings?: EmailSettings;
  scheduledEmails?: ScheduledEmail[];
  coldEmails?: ColdEmail[];
  onUpdateSettings: (settings: EmailSettings) => void;
  onDeleteScheduledEmail: (id: string) => void;
  onSendFollowUp?: (coldEmail: ColdEmail, template: EmailTemplate) => Promise<boolean>;
  onMarkFollowUpDone?: (coldEmailId: string) => void;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'follow-up-1',
    name: 'Standard Follow-up',
    subject: 'Following up - {{role}} at {{company}}',
    body: `Hi {{name}},

I hope you're doing well.

I wanted to follow up on my previous email regarding the {{role}} position at {{company}}. I'm very interested in this opportunity and believe my skills would be a great fit for your team.

Would you be available for a brief chat this week?

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

Just a quick follow-up on my email about the {{role}} position at {{company}}.

Is this still available? I'd love to connect.

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

I've been following {{company}}'s work and I'm excited about how my background could contribute to your team's goals.

Would you be open to a quick conversation?

Best,
{{senderName}}`,
    variables: ['name', 'company', 'role', 'senderName'],
    createdAt: new Date().toISOString(),
  },
];

export default function EmailSettingsComponent({
  emailSettings,
  scheduledEmails = [],
  coldEmails = [],
  onUpdateSettings,
  onDeleteScheduledEmail,
  onSendFollowUp,
  onMarkFollowUpDone,
}: EmailSettingsProps) {
  // Step: 'idle' | 'setup' | 'connecting' — controls the setup modal
  const [step, setStep] = useState<'idle' | 'setup' | 'connecting'>('idle');
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'due' | 'scheduled' | 'templates' | 'settings'>('due');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);

  // Per-row template overrides: coldEmailId -> templateId
  const [templateOverrides, setTemplateOverrides] = useState<Record<string, string>>({});
  // Multi-select for bulk send
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Sending state
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  // Info popover
  const [showInfo, setShowInfo] = useState(false);

  // Setup form — filled BEFORE OAuth
  const [setupForm, setSetupForm] = useState({
    fromName: '',
    followUpDelay: 3,
    scheduleTime: '09:00',
    autoSendEnabled: true,
    defaultTemplateId: 'follow-up-1',
  });

  // Sync templates selected state from saved settings
  useEffect(() => {
    if (emailSettings?.defaultTemplateId) {
      setSelectedTemplateId(emailSettings.defaultTemplateId);
    }
    if (emailSettings) {
      setSetupForm({
        fromName: emailSettings.fromName || '',
        followUpDelay: emailSettings.followUpDelay || 3,
        scheduleTime: emailSettings.scheduleTime || '09:00',
        autoSendEnabled: emailSettings.autoSendEnabled ?? true,
        defaultTemplateId: emailSettings.defaultTemplateId || 'follow-up-1',
      });
    }
  }, [emailSettings]);

  // ── Connect flow ────────────────────────────────────────────────────────────
  const handleStartSetup = () => setStep('setup');

  const handleConnect = async () => {
    if (!setupForm.fromName.trim()) return;
    setStep('connecting');
    try {
      const result = await gmailService.authenticate();
      if (result.success) {
        const newSettings: EmailSettings = {
          id: emailSettings?.id || Date.now().toString(),
          provider: 'gmail',
          email: result.email!,
          fromName: setupForm.fromName.trim(),
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          isConnected: true,
          autoSendEnabled: setupForm.autoSendEnabled,
          followUpDelay: setupForm.followUpDelay,
          scheduleTime: setupForm.scheduleTime,
          defaultTemplateId: setupForm.defaultTemplateId,
          lastSync: new Date().toISOString(),
          // Advanced defaults
          timezone: emailSettings?.timezone || 'America/New_York',
          sendOnWeekends: emailSettings?.sendOnWeekends ?? false,
          workingHoursOnly: emailSettings?.workingHoursOnly ?? true,
          workingHoursStart: emailSettings?.workingHoursStart || '09:00',
          workingHoursEnd: emailSettings?.workingHoursEnd || '17:00',
          maxFollowUps: emailSettings?.maxFollowUps || 3,
          followUpTemplateIds: emailSettings?.followUpTemplateIds || ['follow-up-1'],
          avoidHolidays: emailSettings?.avoidHolidays ?? true,
          delayBetweenEmails: emailSettings?.delayBetweenEmails || 30,
          randomizeTiming: emailSettings?.randomizeTiming ?? true,
          trackOpens: emailSettings?.trackOpens ?? false,
          trackClicks: emailSettings?.trackClicks ?? false,
          emailNotifications: emailSettings?.emailNotifications ?? true,
          notificationEmail: emailSettings?.notificationEmail || result.email!,
        };
        onUpdateSettings(newSettings);
        setStep('idle');
        setActiveTab('scheduled');
      } else {
        alert('Failed to connect Gmail: ' + result.error);
        setStep('setup');
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setStep('setup');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Gmail? Scheduled emails will not be sent until you reconnect.')) return;
    setIsDisconnecting(true);
    try {
      if (emailSettings?.refreshToken) {
        await gmailService.revokeToken(emailSettings.refreshToken);
      }
      onUpdateSettings({ ...emailSettings!, isConnected: false, accessToken: undefined, refreshToken: undefined });
    } finally {
      setIsDisconnecting(false);
    }
  };

  // ── Settings save ────────────────────────────────────────────────────────────
  const handleSaveSettings = () => {
    if (!emailSettings) return;
    onUpdateSettings({
      ...emailSettings,
      fromName: setupForm.fromName,
      followUpDelay: setupForm.followUpDelay,
      scheduleTime: setupForm.scheduleTime,
      autoSendEnabled: setupForm.autoSendEnabled,
      defaultTemplateId: setupForm.defaultTemplateId,
    });
  };

  // ── Templates ────────────────────────────────────────────────────────────────
  const handleTemplateCreate = (template: Omit<EmailTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: EmailTemplate = { ...template, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setTemplates([...templates, newTemplate]);
  };

  const handleTemplateUpdate = (updated: EmailTemplate) => {
    setTemplates(templates.map(t => t.id === updated.id ? updated : t));
  };

  const handleTemplateDelete = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    if (selectedTemplateId === templateId) setSelectedTemplateId(templates[0]?.id || '');
  };

  const handleSetDefault = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setSetupForm(f => ({ ...f, defaultTemplateId: templateId }));
    if (emailSettings) {
      onUpdateSettings({ ...emailSettings, defaultTemplateId: templateId });
    }
  };

  // ── Test email ────────────────────────────────────────────────────────────────
  const handleSendTestEmail = async () => {
    if (!emailSettings) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const result = await emailSender.sendTestEmail(emailSettings);
      setTestResult({ success: result.success, message: result.success ? 'Test email sent! Check your inbox.' : (result.error || 'Failed') });
    } catch (e) {
      setTestResult({ success: false, message: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setSendingTest(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  // ── Scheduled emails helpers ──────────────────────────────────────────────────
  const pendingScheduled = scheduledEmails.filter(e => !e.sent && !e.error);
  const sentScheduled = scheduledEmails.filter(e => e.sent);
  const failedScheduled = scheduledEmails.filter(e => e.error && !e.sent);

  const getColdEmail = (id: string) => coldEmails.find(e => e.id === id);

  const formatDate = (d: string) => new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  // ── Due follow-ups (derived from cold emails) ──────────────────────────────
  const followUpDelay = emailSettings?.followUpDelay || 3;

  const dueFollowUps = useMemo(() => {
    return coldEmails.filter(email => {
      if (email.isFollowUp) return false;
      if (email.followUpDone) return false;
      if (email.gotResponse) return false;
      if (!email.email) return false; // need an email address to send
      const dueDate = addDays(new Date(email.date), followUpDelay);
      return isToday(dueDate) || isAfter(new Date(), dueDate);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [coldEmails, followUpDelay]);

  const getFollowUpStatus = (email: ColdEmail) => {
    const dueDate = addDays(new Date(email.date), followUpDelay);
    if (isToday(dueDate)) return { label: 'Due Today', color: 'amber' as const };
    return { label: `Overdue by ${Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))}d`, color: 'red' as const };
  };

  const getTemplateForEmail = (coldEmailId: string) => {
    const overrideId = templateOverrides[coldEmailId];
    const tpl = templates.find(t => t.id === (overrideId || emailSettings?.defaultTemplateId || 'follow-up-1'));
    return tpl || templates[0];
  };

  // Toggle select
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === dueFollowUps.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(dueFollowUps.map(e => e.id)));
    }
  };

  // Send individual
  const handleSendOne = async (coldEmail: ColdEmail) => {
    if (!onSendFollowUp || sendingIds.has(coldEmail.id)) return;
    const tpl = getTemplateForEmail(coldEmail.id);
    setSendingIds(prev => new Set(prev).add(coldEmail.id));
    try {
      await onSendFollowUp(coldEmail, tpl);
      // Remove from selected if it was selected
      setSelectedIds(prev => { const n = new Set(prev); n.delete(coldEmail.id); return n; });
    } finally {
      setSendingIds(prev => { const n = new Set(prev); n.delete(coldEmail.id); return n; });
    }
  };

  // Send bulk
  const handleSendBulk = async () => {
    if (!onSendFollowUp || selectedIds.size === 0 || bulkSending) return;
    setBulkSending(true);
    const toSend = dueFollowUps.filter(e => selectedIds.has(e.id));
    for (const email of toSend) {
      const tpl = getTemplateForEmail(email.id);
      setSendingIds(prev => new Set(prev).add(email.id));
      try {
        await onSendFollowUp(email, tpl);
      } finally {
        setSendingIds(prev => { const n = new Set(prev); n.delete(email.id); return n; });
      }
    }
    setSelectedIds(new Set());
    setBulkSending(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-3xl font-bold">Email Automation</h2>
          <div className="relative">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              title="How email automation works"
            >
              <Info className="w-4 h-4" />
            </button>
            {showInfo && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowInfo(false)} />
                <div className="absolute left-0 top-full mt-2 z-50 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl p-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground">How it works</h4>
                    <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-muted rounded-md transition-all">
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <ol className="space-y-2.5 text-muted-foreground text-[13px] leading-relaxed">
                    <li className="flex gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                      <span><strong className="text-foreground">Add cold emails</strong> with the recipient's name, email, company, and role in the Cold Emails tab.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                      <span><strong className="text-foreground">Follow-ups appear here</strong> automatically once the delay period (e.g. 3 days) has passed without a response.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">3</span>
                      <span><strong className="text-foreground">Pick a template</strong> for each follow-up or use the default. You can change it per email before sending.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">4</span>
                      <span><strong className="text-foreground">Send individually or in bulk</strong> — select multiple emails and send them all at once, or send one at a time.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">5</span>
                      <span><strong className="text-foreground">Status syncs</strong> — once sent, the cold email is marked as followed up in both tabs.</span>
                    </li>
                  </ol>
                  <p className="text-xs text-muted-foreground/70 border-t border-border pt-2.5">
                    A red badge on the sidebar shows how many follow-ups are due.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        {!emailSettings?.isConnected && (
          <button
            onClick={handleStartSetup}
            className="flex items-center gap-2 p-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span className="hidden sm:inline">Connect Email</span>
          </button>
        )}
      </div>

      {/* ── Connection status — compact when connected, prominent when not ── */}
      {emailSettings?.isConnected ? (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-green-200 bg-green-50/60 dark:border-green-800 dark:bg-green-950/30">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-sm text-foreground truncate">{emailSettings.email}</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              · {emailSettings.fromName} · {emailSettings.followUpDelay}d follow-up delay
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSendTestEmail}
              disabled={sendingTest}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-background border border-border rounded-md hover:bg-muted transition-all"
            >
              {sendingTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Test
            </button>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-500 bg-background border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
            >
              {isDisconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Gmail not connected</p>
              <p className="text-xs text-muted-foreground mt-0.5">Connect your Gmail to enable automatic follow-ups</p>
            </div>
          </div>
        </div>
      )}

      {/* Test result banner */}
      {testResult && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
          testResult.success ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
        }`}>
          {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {testResult.message}
        </div>
      )}

      {/* ── Setup modal (rendered via portal to escape scroll context) ── */}
      {(step === 'setup' || step === 'connecting') && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Connect Gmail</h2>
                  <p className="text-xs text-muted-foreground">Configure before connecting</p>
                </div>
              </div>
              <button onClick={() => setStep('idle')} className="p-2 hover:bg-muted rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">

              {/* From name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={setupForm.fromName}
                  onChange={e => setSetupForm(f => ({ ...f, fromName: e.target.value }))}
                  placeholder="e.g. Rounak Jha"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">Appears as "From" name in your emails</p>
              </div>

              {/* Follow-up delay + schedule time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Follow-up after
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={setupForm.followUpDelay}
                      onChange={e => setSetupForm(f => ({ ...f, followUpDelay: parseInt(e.target.value) || 3 }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">days</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    Send time
                  </label>
                  <input
                    type="time"
                    value={setupForm.scheduleTime}
                    onChange={e => setSetupForm(f => ({ ...f, scheduleTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              {/* Default template */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Default follow-up template
                </label>
                <select
                  value={setupForm.defaultTemplateId}
                  onChange={e => setSetupForm(f => ({ ...f, defaultTemplateId: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Used for all follow-ups — override per cold email anytime</p>
              </div>

            
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 border-t border-border flex gap-3">
              <button
                onClick={() => setStep('idle')}
                className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!setupForm.fromName.trim() || step === 'connecting'}
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 'connecting' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                ) : (
                  <><Mail className="w-4 h-4" /> Connect with Gmail</>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Tabs (only when connected) ── */}
      {emailSettings?.isConnected && (
        <>
          <div className="flex gap-1 p-1 bg-muted/60 rounded-xl overflow-x-auto">
            {([ 
              { id: 'due' as const, label: 'Due Follow-ups', icon: AlertCircle, count: dueFollowUps.length },
              { id: 'scheduled' as const, label: 'History', icon: Calendar, count: pendingScheduled.length },
              { id: 'templates' as const, label: 'Templates', icon: Mail },
              { id: 'settings' as const, label: 'Settings', icon: Settings },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {'count' in tab && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full leading-none">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div className="bg-card border border-border rounded-xl p-6">

            {/* DUE FOLLOW-UPS */}
            {activeTab === 'due' && (
              <div className="space-y-4">
                {/* Header with bulk actions */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-lg">Due Follow-ups</h3>
                    <p className="text-sm text-muted-foreground">
                      {dueFollowUps.length} follow-up{dueFollowUps.length !== 1 ? 's' : ''} due from your cold emails
                    </p>
                  </div>
                  {dueFollowUps.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-background border border-border rounded-lg hover:bg-muted transition-all"
                      >
                        {selectedIds.size === dueFollowUps.length
                          ? <><CheckSquare className="w-3.5 h-3.5" /> Deselect All</>
                          : <><Square className="w-3.5 h-3.5" /> Select All</>}
                      </button>
                      {selectedIds.size > 0 && (
                        <button
                          onClick={handleSendBulk}
                          disabled={bulkSending}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-60 font-medium"
                        >
                          {bulkSending
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending {selectedIds.size}...</>
                            : <><Send className="w-3.5 h-3.5" /> Send {selectedIds.size} Follow-up{selectedIds.size > 1 ? 's' : ''}</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {dueFollowUps.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm mt-1">No follow-ups are due right now. Check back later.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dueFollowUps.map(email => {
                      const status = getFollowUpStatus(email);
                      const currentTemplate = getTemplateForEmail(email.id);
                      const isSending = sendingIds.has(email.id);
                      const isSelected = selectedIds.has(email.id);
                      const daysSinceSent = Math.floor((Date.now() - new Date(email.date).getTime()) / (1000 * 60 * 60 * 24));

                      return (
                        <div
                          key={email.id}
                          className={`p-4 border rounded-xl transition-all ${
                            isSelected
                              ? 'border-primary/40 bg-primary/5'
                              : 'border-border bg-background hover:border-primary/20'
                          }`}
                        >
                          {/* Row 1: checkbox + info + status badge + send button */}
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleSelect(email.id)}
                              className="mt-0.5 shrink-0"
                            >
                              {isSelected
                                ? <CheckSquare className="w-4.5 h-4.5 text-primary" />
                                : <Square className="w-4.5 h-4.5 text-muted-foreground hover:text-primary transition-colors" />}
                            </button>

                            {/* Info block */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-foreground">{email.company}</span>
                                {email.role && (
                                  <span className="text-xs text-muted-foreground">— {email.role}</span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                                  status.color === 'red'
                                    ? 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-800'
                                    : 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800'
                                }`}>
                                  <AlertCircle className="w-3 h-3" />
                                  {status.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {email.contactName && (
                                  <span className="text-xs font-medium text-foreground/80">{email.contactName}</span>
                                )}
                                <span className="text-xs text-muted-foreground">{email.email}</span>
                                <span className="text-[11px] text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground">Sent {daysSinceSent}d ago ({format(new Date(email.date), 'MMM dd')})</span>
                              </div>

                              {/* Row 2: template selector */}
                              <div className="flex items-center gap-2 mt-2.5">
                                <label className="text-xs font-medium text-muted-foreground shrink-0">Template:</label>
                                <select
                                  value={currentTemplate.id}
                                  onChange={e => setTemplateOverrides(prev => ({ ...prev, [email.id]: e.target.value }))}
                                  className="flex-1 max-w-xs px-2.5 py-1 text-xs bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/30 outline-none"
                                >
                                  {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Send button */}
                            <div className="shrink-0 flex items-center gap-2">
                              <button
                                onClick={() => handleSendOne(email)}
                                disabled={isSending || bulkSending}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all disabled:opacity-60 ${
                                  status.color === 'red'
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-amber-500 hover:bg-amber-600'
                                }`}
                              >
                                {isSending
                                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending...</>
                                  : <><Send className="w-3 h-3" /> Send</>}
                              </button>
                              {onMarkFollowUpDone && (
                                <button
                                  onClick={() => onMarkFollowUpDone(email.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted transition-all"
                                  title="Skip — mark as done without sending"
                                >
                                  <Ban className="w-3 h-3" /> Skip
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* HISTORY (previously SCHEDULED) */}
            {activeTab === 'scheduled' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Follow-up History</h3>
                    <p className="text-sm text-muted-foreground">
                      {pendingScheduled.length} pending · {sentScheduled.length} sent · {failedScheduled.length} failed
                    </p>
                  </div>
                </div>

                {scheduledEmails.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No scheduled emails</p>
                    <p className="text-sm mt-1">Follow-ups will appear here when you add cold emails</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Pending */}
                    {pendingScheduled.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Pending</p>
                        {pendingScheduled.map(email => {
                          const cold = getColdEmail(email.coldEmailId);
                          return (
                            <div key={email.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-xl hover:border-primary/30 transition-all">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {cold ? `${cold.company}${cold.role ? ` — ${cold.role}` : ''}` : `Email ID: ${email.coldEmailId.slice(-6)}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Scheduled: {formatDate(email.scheduledFor)}
                                    {cold?.email && ` · To: ${cold.email}`}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => onDeleteScheduledEmail(email.id)}
                                className="ml-3 flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shrink-0"
                                title="Cancel this follow-up (does not change cold email status)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Sent */}
                    {sentScheduled.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Sent</p>
                        {sentScheduled.map(email => {
                          const cold = getColdEmail(email.coldEmailId);
                          return (
                            <div key={email.id} className="flex items-center gap-3 p-3 bg-background border border-border/60 rounded-xl">
                              <CheckCircle className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm text-foreground/80 truncate">
                                  {cold ? `${cold.company}${cold.role ? ` — ${cold.role}` : ''}` : `Email ${email.coldEmailId.slice(-6)}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {email.sentAt ? formatDate(email.sentAt) : '—'}
                                  {cold?.email && ` · ${cold.email}`}
                                </p>
                              </div>
                              <span className="text-[10px] text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-md shrink-0">Sent</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Failed */}
                    {failedScheduled.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Failed</p>
                        {failedScheduled.map(email => {
                          const cold = getColdEmail(email.coldEmailId);
                          return (
                            <div key={email.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg shrink-0">
                                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {cold ? `${cold.company}${cold.role ? ` — ${cold.role}` : ''}` : `Email ${email.coldEmailId.slice(-6)}`}
                                  </p>
                                  <p className="text-xs text-red-500 truncate">{email.error}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => onDeleteScheduledEmail(email.id)}
                                className="ml-3 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all shrink-0"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATES */}
            {activeTab === 'templates' && (
              <EmailTemplates
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={handleSetDefault}
                onTemplateCreate={handleTemplateCreate}
                onTemplateUpdate={handleTemplateUpdate}
                onTemplateDelete={handleTemplateDelete}
              />
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-5">
                <h3 className="font-bold text-lg">Basic Settings</h3>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <User className="w-4 h-4 text-primary" /> From Name
                  </label>
                  <input
                    type="text"
                    value={setupForm.fromName}
                    onChange={e => setSetupForm(f => ({ ...f, fromName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <Clock className="w-4 h-4 text-primary" /> Follow-up delay (days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={setupForm.followUpDelay}
                      onChange={e => setSetupForm(f => ({ ...f, followUpDelay: parseInt(e.target.value) || 3 }))}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <Calendar className="w-4 h-4 text-primary" /> Send time
                    </label>
                    <input
                      type="time"
                      value={setupForm.scheduleTime}
                      onChange={e => setSetupForm(f => ({ ...f, scheduleTime: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Star className="w-4 h-4 text-primary" /> Default template
                  </label>
                  <select
                    value={setupForm.defaultTemplateId}
                    onChange={e => setSetupForm(f => ({ ...f, defaultTemplateId: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm"
                  >
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium text-sm"
                >
                  Save Settings
                </button>
              </div>
            )}

            
          </div>
        </>
      )}
    </div>
  );
}
