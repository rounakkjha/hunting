import { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { ToastProvider } from './components/Toast';
import { loadFromBackend, saveToBackend } from './utils/api';
import { loginUser, checkUserExists } from './utils/auth';
import { emailScheduler, type EmailTemplate } from './utils/emailScheduler';

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'email' | 'number';
  required: boolean;
  options?: string[];
}

export interface JobApplication {
  id: string;
  date: string;
  company: string;
  source?: string;
  role?: string;
  location?: string;
  jobUrl?: string;
  jobId?: string;
  emailTag?: string;
  customFields?: Record<string, any>;
  resumeData?: string;
  resumeName?: string;
  referrerName?: string;
  referrerRole?: string;
  isGreatLakesAlumni?: boolean;
  isQuickApply?: boolean;
  isActive?: boolean;
  isRejected?: boolean;
}

export interface ColdEmail {
  id: string;
  date: string;
  company: string;
  email?: string;
  role?: string;
  contactName?: string;
  isFollowUp?: boolean;
  gotResponse?: boolean;
  followUpDone?: boolean;
  customFields?: Record<string, any>;
  resumeData?: string;
  resumeName?: string;
}

export interface LinkedInOutreach {
  id: string;
  date: string;
  name?: string;
  role?: string;
  company?: string;
  linkedinUrl?: string;
  isAlumni?: boolean;
  gotResponse?: boolean;
  customFields?: Record<string, any>;
}

export type InterviewRoundStatus = 'pending' | 'selected' | 'rejected' | 'scheduled';

export interface InterviewRound {
  id: string;
  roundName: string; // e.g., "HR Telephonic", "Technical Round 1", "Technical Round 2", "Managerial", "Final"
  date?: string;
  status: InterviewRoundStatus;
  notes?: string;
}

export type InterviewStatus = 'active' | 'rejected' | 'offered' | 'accepted' | 'declined';

export interface Interview {
  id: string;
  company: string;
  role: string;
  status: InterviewStatus;
  currentRound?: string;
  rounds: InterviewRound[];
  sources: {
    applicationId?: string;
    coldEmailIds?: string[];
    linkedinOutreachIds?: string[];
  };
  offerDetails?: {
    salary?: string;
    offerDate?: string;
    deadline?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
}

export interface EmailSettings {
  id: string;
  provider: 'gmail';
  email: string;
  fromName: string;
  accessToken?: string;
  refreshToken?: string;
  isConnected: boolean;
  autoSendEnabled: boolean;
  followUpDelay: number; // days
  scheduleTime: string; // "09:00"
  lastSync?: string;
  
  // Advanced scheduling preferences
  timezone: string;
  sendOnWeekends: boolean;
  workingHoursOnly: boolean;
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string; // "17:00"
  
  // Follow-up sequence settings
  maxFollowUps: number;
  followUpTemplateIds: string[];
  defaultTemplateId: string;
  
  // Smart sending preferences
  avoidHolidays: boolean;
  delayBetweenEmails: number; // minutes
  randomizeTiming: boolean; // +/- 30 minutes
  
  // Analytics and tracking
  trackOpens: boolean;
  trackClicks: boolean;
  
  // Notification preferences
  emailNotifications: boolean;
  notificationEmail: string;
}

export interface ScheduledEmail {
  id: string;
  coldEmailId: string;
  userId: string;
  scheduledFor: string;
  template: string;
  sent: boolean;
  sentAt?: string;
  error?: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  date: string;
  title: string;
  type: 'Cold Email' | 'LinkedIn Message' | 'Other';
  content: string;
}

export type TodoPriority = 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  date: string;
  text: string;
  completed: boolean;
  completedDate?: string;
  priority?: TodoPriority;
  carryForward?: boolean;
}

export interface StrategyItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface SavedLink {
  id: string;
  name: string;
  url: string;
  date: string;
}

export interface CompanyContact {
  id: string;
  name: string;
  email?: string;
  role?: string;
  linkedinUrl?: string;
}

export type ReferralStatus = 'asked' | 'awaiting' | 'done';

export interface TargetCompany {
  id: string;
  date: string;
  updatedAt?: string;
  company: string;
  role?: string;
  jobUrl?: string;
  referralStatus?: ReferralStatus;
  referralApplicationCreated?: boolean;
  contacts: CompanyContact[];
  notes?: string;
  targeted?: boolean;
}

export type TrashItemType = 'application' | 'coldEmail' | 'linkedin' | 'content' | 'todo' | 'savedLink' | 'targetCompany' | 'interview';

export interface TrashItem {
  id: string;
  type: TrashItemType;
  label: string;
  deletedAt: string;
  data: any;
}

export interface UserData {
  applications: JobApplication[];
  coldEmails: ColdEmail[];
  linkedInOutreach: LinkedInOutreach[];
  contentLibrary: ContentItem[];
  todos: Todo[];
  savedLinks: SavedLink[];
  targetCompanies: TargetCompany[];
  strategy: StrategyItem[];
  interviews: Interview[];
  trash: TrashItem[];
  ignoredTargetSuggestions: string[];
  knownCompanies: string[];
  customFields: {
    applications: CustomField[];
    coldEmails: CustomField[];
    linkedInOutreach: CustomField[];
  };
  emailSettings?: EmailSettings;
  emailTemplates: EmailTemplate[];
  scheduledEmails: ScheduledEmail[];
}

const EMPTY_DATA: UserData = {
  applications: [],
  coldEmails: [],
  linkedInOutreach: [],
  contentLibrary: [],
  todos: [],
  savedLinks: [],
  targetCompanies: [],
  strategy: [],
  interviews: [],
  trash: [],
  ignoredTargetSuggestions: [],
  knownCompanies: [],
  customFields: {
    applications: [],
    coldEmails: [],
    linkedInOutreach: [],
  },
  emailTemplates: emailScheduler.getDefaultTemplates(),
  scheduledEmails: [],
};

function normalizeData(raw: any): UserData {
  if (!raw) return EMPTY_DATA;
  if (!raw.customFields) {
    raw.customFields = { applications: [], coldEmails: [], linkedInOutreach: [] };
  }
  
  // Add default values for new EmailSettings fields
  if (raw.emailSettings) {
    raw.emailSettings = {
      ...raw.emailSettings,
      timezone: raw.emailSettings.timezone || 'America/New_York',
      sendOnWeekends: raw.emailSettings.sendOnWeekends || false,
      workingHoursOnly: raw.emailSettings.workingHoursOnly || true,
      workingHoursStart: raw.emailSettings.workingHoursStart || '09:00',
      workingHoursEnd: raw.emailSettings.workingHoursEnd || '17:00',
      maxFollowUps: raw.emailSettings.maxFollowUps || 3,
      followUpTemplateIds: raw.emailSettings.followUpTemplateIds || ['follow-up-1'],
      defaultTemplateId: raw.emailSettings.defaultTemplateId || 'follow-up-1',
      avoidHolidays: raw.emailSettings.avoidHolidays || true,
      delayBetweenEmails: raw.emailSettings.delayBetweenEmails || 30,
      randomizeTiming: raw.emailSettings.randomizeTiming || true,
      trackOpens: raw.emailSettings.trackOpens || false,
      trackClicks: raw.emailSettings.trackClicks || false,
      emailNotifications: raw.emailSettings.emailNotifications || true,
      notificationEmail: raw.emailSettings.notificationEmail || raw.emailSettings.email,
    };
  }
  
  if (!raw.scheduledEmails) {
    raw.scheduledEmails = [];
  }
  if (!raw.emailTemplates || raw.emailTemplates.length === 0) {
    raw.emailTemplates = emailScheduler.getDefaultTemplates();
  }
  raw.applications = raw.applications?.map((a: any) => ({ ...a, customFields: a.customFields || {} })) || [];
  raw.coldEmails = raw.coldEmails?.map((e: any) => ({ ...e, customFields: e.customFields || {} })) || [];
  raw.linkedInOutreach = raw.linkedInOutreach?.map((o: any) => ({ ...o, customFields: o.customFields || {} })) || [];
  raw.contentLibrary = raw.contentLibrary || [];
  raw.todos = raw.todos || [];
  raw.savedLinks = raw.savedLinks || [];
  raw.targetCompanies = (raw.targetCompanies || []).map((c: any) => ({
    ...c,
    updatedAt: c.updatedAt || c.date,
  }));
  raw.strategy = raw.strategy || [];
  raw.interviews = (raw.interviews || []).map((i: any) => {
    const rounds = i.rounds || [];
    // Self-heal: derive createdAt from earliest round date so chart placement is accurate
    const roundDates = rounds.map((r: any) => r.date).filter(Boolean).sort();
    const createdAt = roundDates[0] || i.createdAt || new Date().toISOString().slice(0, 10);
    return { ...i, createdAt, rounds, sources: i.sources || {} };
  });
  raw.ignoredTargetSuggestions = raw.ignoredTargetSuggestions || [];
  raw.knownCompanies = raw.knownCompanies || [];
  raw.trash = (raw.trash || []).filter((t: any) => {
    const deletedAt = new Date(t.deletedAt).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - deletedAt < sevenDays;
  });
  return raw as UserData;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>(EMPTY_DATA);
  const [isTrial, setIsTrial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore authentication state from localStorage or sessionStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('huntlog-auth-user');
    const trialUser = sessionStorage.getItem('huntlog-trial-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('[App] Failed to parse stored user:', e);
        localStorage.removeItem('huntlog-auth-user');
      }
    } else if (trialUser) {
      try {
        const user = JSON.parse(trialUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsTrial(true);
      } catch (e) {
        sessionStorage.removeItem('huntlog-trial-user');
      }
    }
  }, []);

  const handleCheckUser = async (username: string): Promise<boolean> => {
    return await checkUserExists(username);
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const user = await loginUser(username, password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('huntlog-auth-user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const handleTrialStart = () => {
    const trialUser: User = {
      id: 'trial_' + Date.now(),
      username: 'Trial User',
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(trialUser);
    setIsAuthenticated(true);
    setIsTrial(true);
    setUserData(EMPTY_DATA);
    setIsLoading(false);
    sessionStorage.setItem('huntlog-trial-user', JSON.stringify(trialUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserData(EMPTY_DATA);
    setIsTrial(false);
    setIsLoading(true);
    localStorage.removeItem('huntlog-auth-user');
    sessionStorage.removeItem('huntlog-trial-user');
  };


  // Load data when authenticated — prefer backend, fall back to localStorage (skip for trial)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    if (isTrial) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    (async () => {
      console.log('[App] Loading data for user:', currentUser.username);
      const backendData = await loadFromBackend(currentUser);
      if (backendData) {
        console.log('[App] Loaded from backend:', { applications: backendData.applications?.length || 0 });
        setUserData(normalizeData(backendData));
      } else {
        let stored = localStorage.getItem(`huntlog-data-${currentUser.id}`);
        
        // Migration: if no data for new user, check old rounakjha5 data
        if (!stored && currentUser.id === 'user_rounak') {
          const oldData = localStorage.getItem('huntlog-data-rounakjha5');
          if (oldData) {
            console.log('[App] Migrating data from rounakjha5 to user_rounak');
            localStorage.setItem(`huntlog-data-${currentUser.id}`, oldData);
            stored = oldData;
          }
        }
        
        console.log('[App] Backend empty, checking localStorage:', stored ? 'found data' : 'no data');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('[App] Loaded from localStorage:', { applications: parsed.applications?.length || 0 });
          setUserData(normalizeData(parsed));
        }
      }
      setIsLoading(false);
      console.log('[App] Data load complete');
    })();

    return () => {
      setIsLoading(true);
    };
  }, [isAuthenticated, currentUser]);

  // Persist to localStorage immediately + backend with a short debounce (skip for trial)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    if (isTrial) return; // Trial mode: no persistence
    if (isLoading) {
      console.log('[App] Data not loaded yet, skipping save');
      return;
    }

    console.log('[App] Saving data to localStorage and backend...', { applications: userData.applications.length });
    localStorage.setItem(`huntlog-data-${currentUser.id}`, JSON.stringify(userData));

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToBackend(currentUser, userData);
      console.log('[App] Saved to backend');
    }, 400);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [userData, isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <Login onLogin={handleLogin} onCheckUser={handleCheckUser} onTrial={handleTrialStart} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Dashboard userData={userData} setUserData={setUserData} onLogout={handleLogout} currentUser={currentUser} isTrial={isTrial} isLoading={isLoading} />
    </ToastProvider>
  );
}
