import { useState, useEffect, useRef } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { loadFromBackend, saveToBackend } from './utils/api';

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
  customFields?: Record<string, any>;
}

export interface ColdEmail {
  id: string;
  date: string;
  company: string;
  email?: string;
  role?: string;
  isFollowUp?: boolean;
  customFields?: Record<string, any>;
}

export interface LinkedInOutreach {
  id: string;
  date: string;
  name?: string;
  role?: string;
  company?: string;
  customFields?: Record<string, any>;
}

export interface ContentItem {
  id: string;
  date: string;
  title: string;
  type: 'Cold Email' | 'LinkedIn Message' | 'Other';
  content: string;
}

export interface Todo {
  id: string;
  date: string;
  text: string;
  completed: boolean;
  completedDate?: string;
}

export interface UserData {
  applications: JobApplication[];
  coldEmails: ColdEmail[];
  linkedInOutreach: LinkedInOutreach[];
  contentLibrary: ContentItem[];
  todos: Todo[];
  customFields: {
    applications: CustomField[];
    coldEmails: CustomField[];
    linkedInOutreach: CustomField[];
  };
}

const EMPTY_DATA: UserData = {
  applications: [],
  coldEmails: [],
  linkedInOutreach: [],
  contentLibrary: [],
  todos: [],
  customFields: {
    applications: [],
    coldEmails: [],
    linkedInOutreach: [],
  },
};

function normalizeData(raw: any): UserData {
  if (!raw) return EMPTY_DATA;
  if (!raw.customFields) {
    raw.customFields = { applications: [], coldEmails: [], linkedInOutreach: [] };
  }
  raw.applications = raw.applications?.map((a: any) => ({ ...a, customFields: a.customFields || {} })) || [];
  raw.coldEmails = raw.coldEmails?.map((e: any) => ({ ...e, customFields: e.customFields || {} })) || [];
  raw.linkedInOutreach = raw.linkedInOutreach?.map((o: any) => ({ ...o, customFields: o.customFields || {} })) || [];
  raw.contentLibrary = raw.contentLibrary || [];
  raw.todos = raw.todos || [];
  return raw as UserData;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [userData, setUserData] = useState<UserData>(EMPTY_DATA);
  const dataLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-auth from localStorage on page load
  useEffect(() => {
    const authStatus = localStorage.getItem('huntlog-auth');
    const savedUser = localStorage.getItem('huntlog-user');
    if (authStatus === 'true' && savedUser) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated — prefer backend, fall back to localStorage
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    (async () => {
      const backendData = await loadFromBackend(currentUser);
      if (backendData) {
        setUserData(normalizeData(backendData));
      } else {
        const stored = localStorage.getItem(`huntlog-data-${currentUser}`);
        if (stored) {
          setUserData(normalizeData(JSON.parse(stored)));
        }
      }
      dataLoaded.current = true;
    })();

    return () => {
      dataLoaded.current = false;
    };
  }, [isAuthenticated, currentUser]);

  // Persist to localStorage immediately + backend with a short debounce
  useEffect(() => {
    if (!isAuthenticated || !dataLoaded.current || !currentUser) return;

    localStorage.setItem(`huntlog-data-${currentUser}`, JSON.stringify(userData));

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToBackend(currentUser, userData);
    }, 400);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [userData, isAuthenticated, currentUser]);

  const handleLogin = (username: string, password: string) => {
    if (username === 'rounakjha5' && password === '1744') {
      setCurrentUser(username);
      setIsAuthenticated(true);
      localStorage.setItem('huntlog-auth', 'true');
      localStorage.setItem('huntlog-user', username);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setUserData(EMPTY_DATA);
    dataLoaded.current = false;
    localStorage.removeItem('huntlog-auth');
    localStorage.removeItem('huntlog-user');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard userData={userData} setUserData={setUserData} onLogout={handleLogout} />;
}
