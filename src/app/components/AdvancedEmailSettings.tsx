import { useState, useEffect } from 'react';
import { Clock, Calendar, Settings, Bell, Mail, Shield, BarChart3, Save, X, Info } from 'lucide-react';
import type { EmailSettings } from '../App';

interface AdvancedEmailSettingsProps {
  emailSettings: EmailSettings;
  onUpdateSettings: (settings: EmailSettings) => void;
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const HOLIDAYS = [
  '2024-01-01', '2024-07-04', '2024-12-25', // US holidays
  '2024-12-24', '2024-12-31', // Additional common holidays
];

export default function AdvancedEmailSettings({ emailSettings, onUpdateSettings }: AdvancedEmailSettingsProps) {
  const [formData, setFormData] = useState({
    timezone: emailSettings.timezone || 'America/New_York',
    sendOnWeekends: emailSettings.sendOnWeekends || false,
    workingHoursOnly: emailSettings.workingHoursOnly || true,
    workingHoursStart: emailSettings.workingHoursStart || '09:00',
    workingHoursEnd: emailSettings.workingHoursEnd || '17:00',
    maxFollowUps: emailSettings.maxFollowUps || 3,
    followUpTemplateIds: emailSettings.followUpTemplateIds || ['follow-up-1'],
    avoidHolidays: emailSettings.avoidHolidays || true,
    delayBetweenEmails: emailSettings.delayBetweenEmails || 30,
    randomizeTiming: emailSettings.randomizeTiming || true,
    trackOpens: emailSettings.trackOpens || false,
    trackClicks: emailSettings.trackClicks || false,
    emailNotifications: emailSettings.emailNotifications || true,
    notificationEmail: emailSettings.notificationEmail || emailSettings.email,
  });

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    setFormData({
      timezone: emailSettings.timezone || 'America/New_York',
      sendOnWeekends: emailSettings.sendOnWeekends || false,
      workingHoursOnly: emailSettings.workingHoursOnly || true,
      workingHoursStart: emailSettings.workingHoursStart || '09:00',
      workingHoursEnd: emailSettings.workingHoursEnd || '17:00',
      maxFollowUps: emailSettings.maxFollowUps || 3,
      followUpTemplateIds: emailSettings.followUpTemplateIds || ['follow-up-1'],
      avoidHolidays: emailSettings.avoidHolidays || true,
      delayBetweenEmails: emailSettings.delayBetweenEmails || 30,
      randomizeTiming: emailSettings.randomizeTiming || true,
      trackOpens: emailSettings.trackOpens || false,
      trackClicks: emailSettings.trackClicks || false,
      emailNotifications: emailSettings.emailNotifications || true,
      notificationEmail: emailSettings.notificationEmail || emailSettings.email,
    });
  }, [emailSettings]);

  const handleSave = () => {
    const updatedSettings = {
      ...emailSettings,
      ...formData,
    };
    onUpdateSettings(updatedSettings);
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  const isHoliday = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return HOLIDAYS.includes(dateStr);
  };

  const getNextScheduledTime = (): Date => {
    const now = new Date();
    let scheduledTime = new Date(now);
    
    // Add delay between emails
    scheduledTime.setMinutes(scheduledTime.getMinutes() + formData.delayBetweenEmails);
    
    // Apply working hours restriction
    if (formData.workingHoursOnly) {
      const [startHour, startMin] = formData.workingHoursStart.split(':').map(Number);
      const [endHour, endMin] = formData.workingHoursEnd.split(':').map(Number);
      
      // If outside working hours, schedule for next working day
      if (scheduledTime.getHours() < startHour || scheduledTime.getHours() > endHour) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
        scheduledTime.setHours(startHour, startMin, 0, 0);
      }
    }
    
    // Avoid weekends
    if (!formData.sendOnWeekends) {
      const day = scheduledTime.getDay();
      if (day === 0) { // Sunday
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      } else if (day === 6) { // Saturday
        scheduledTime.setDate(scheduledTime.getDate() + 2);
      }
    }
    
    // Avoid holidays
    if (formData.avoidHolidays && isHoliday(scheduledTime)) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    // Randomize timing if enabled
    if (formData.randomizeTiming) {
      const randomMinutes = Math.floor(Math.random() * 60) - 30; // +/- 30 minutes
      scheduledTime.setMinutes(scheduledTime.getMinutes() + randomMinutes);
    }
    
    return scheduledTime;
  };

  return (
    <div className="space-y-6">
      {/* Save Confirmation */}
      {showSaveConfirm && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <Save className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-700">Settings saved successfully!</span>
        </div>
      )}

      {/* Scheduling Preferences */}
      <div className="border border-border rounded-xl p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Scheduling Preferences
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendOnWeekends"
              checked={formData.sendOnWeekends}
              onChange={(e) => setFormData({ ...formData, sendOnWeekends: e.target.checked })}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            />
            <label htmlFor="sendOnWeekends" className="text-sm font-medium">
              Send on weekends
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="workingHoursOnly"
              checked={formData.workingHoursOnly}
              onChange={(e) => setFormData({ ...formData, workingHoursOnly: e.target.checked })}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            />
            <label htmlFor="workingHoursOnly" className="text-sm font-medium">
              Working hours only
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="avoidHolidays"
              checked={formData.avoidHolidays}
              onChange={(e) => setFormData({ ...formData, avoidHolidays: e.target.checked })}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            />
            <label htmlFor="avoidHolidays" className="text-sm font-medium">
              Avoid holidays
            </label>
          </div>
          
          {formData.workingHoursOnly && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Working Hours Start</label>
                <input
                  type="time"
                  value={formData.workingHoursStart}
                  onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Working Hours End</label>
                <input
                  type="time"
                  value={formData.workingHoursEnd}
                  onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Follow-up Sequence */}
      <div className="border border-border rounded-xl p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Follow-up Sequence
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Maximum Follow-ups</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.maxFollowUps}
              onChange={(e) => setFormData({ ...formData, maxFollowUps: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum number of follow-ups to send per cold email
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Delay Between Emails (minutes)</label>
            <input
              type="number"
              min="1"
              max="1440"
              value={formData.delayBetweenEmails}
              onChange={(e) => setFormData({ ...formData, delayBetweenEmails: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum time between sending different emails
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="randomizeTiming"
              checked={formData.randomizeTiming}
              onChange={(e) => setFormData({ ...formData, randomizeTiming: e.target.checked })}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            />
            <label htmlFor="randomizeTiming" className="text-sm font-medium">
              Randomize timing (±30 minutes)
            </label>
          </div>
        </div>
      </div>

      {/* Analytics & Tracking */}
      <div className="border border-border rounded-xl p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics & Tracking
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="trackOpens"
              checked={formData.trackOpens}
              onChange={(e) => setFormData({ ...formData, trackOpens: e.target.checked })}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            />
            <label htmlFor="trackOpens" className="text-sm font-medium">
              Track email opens
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="trackClicks"
              checked={formData.trackClicks}
              onChange={(e) => setFormData({ ...formData, trackClicks: e.target.checked })}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            />
            <label htmlFor="trackClicks" className="text-sm font-medium">
              Track link clicks
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="border border-border rounded-xl p-6">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
            />
            <label htmlFor="emailNotifications" className="text-sm font-medium">
              Email notifications for follow-up activity
            </label>
          </div>
          
          {formData.emailNotifications && (
            <div>
              <label className="block text-sm font-medium mb-2">Notification Email</label>
              <input
                type="email"
                value={formData.notificationEmail}
                onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                placeholder="notifications@example.com"
              />
            </div>
          )}
        </div>
      </div>

      {/* Next Send Prediction */}
      <div className="border border-border rounded-xl p-6 bg-muted/30">
        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Next Email Prediction
        </h4>
        
        <div className="text-sm">
          <p className="mb-2">
            Based on your current settings, the next email would be scheduled for:
          </p>
          <p className="font-medium text-primary">
            {getNextScheduledTime().toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This takes into account your timezone, working hours, weekend preferences, and delay settings.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
        >
          <Save className="w-4 h-4" />
          Save Advanced Settings
        </button>
      </div>
    </div>
  );
}