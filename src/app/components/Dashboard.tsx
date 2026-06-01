import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  FileText,
  Mail,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import type { UserData, JobApplication, ColdEmail, LinkedInOutreach, CustomField } from '../App';
import Sidebar from './Sidebar';
import TimeGreeting from './TimeGreeting';
import AdvancedStats from './AdvancedStats';
import StatsOverview from './StatsOverview';
import QuickAddModal from './QuickAddModal';
import ContentLibrary from './ContentLibrary';
import TodoList from './TodoList';
import ApplicationsList from './ApplicationsList';
import ColdEmailsList from './ColdEmailsList';
import LinkedInOutreachList from './LinkedInOutreachList';
import DetailViewModal from './DetailViewModal';

interface DashboardProps {
  userData: UserData;
  setUserData: (data: UserData | ((prev: UserData) => UserData)) => void;
  onLogout: () => void;
}

type ModalType = 'application' | 'coldEmail' | 'linkedin' | 'content' | null;
type DetailViewType = { type: 'application'; entry: JobApplication } | { type: 'coldEmail'; entry: ColdEmail } | { type: 'linkedin'; entry: LinkedInOutreach } | null;

export default function Dashboard({ userData, setUserData, onLogout }: DashboardProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [detailView, setDetailView] = useState<DetailViewType>(null);

  const handleUpdateEntry = (id: string, updates: any) => {
    if (!detailView) return;

    setUserData((prev) => {
      switch (detailView.type) {
        case 'application':
          return {
            ...prev,
            applications: prev.applications.map((a) => (a.id === id ? { ...a, ...updates } : a)),
          };
        case 'coldEmail':
          return {
            ...prev,
            coldEmails: prev.coldEmails.map((e) => (e.id === id ? { ...e, ...updates } : e)),
          };
        case 'linkedin':
          return {
            ...prev,
            linkedInOutreach: prev.linkedInOutreach.map((o) => (o.id === id ? { ...o, ...updates } : o)),
          };
        default:
          return prev;
      }
    });
  };

  const handleAddCustomField = (field: CustomField, applyToAll: boolean) => {
    if (!detailView) return;

    const fieldKey = detailView.type === 'application' ? 'applications' : detailView.type === 'coldEmail' ? 'coldEmails' : 'linkedInOutreach';

    setUserData((prev) => {
      const newCustomFields = {
        ...prev.customFields,
        [fieldKey]: [...prev.customFields[fieldKey], field],
      };

      if (!applyToAll) {
        return { ...prev, customFields: newCustomFields };
      }

      const updatedEntries = prev[fieldKey].map((entry: any) => ({
        ...entry,
        customFields: { ...entry.customFields },
      }));

      return {
        ...prev,
        customFields: newCustomFields,
        [fieldKey]: updatedEntries,
      };
    });
  };

  const quickActions = [
    { type: 'application' as const, icon: FileText, label: 'Job Applied', color: 'from-blue-500 to-blue-600' },
    { type: 'coldEmail' as const, icon: Mail, label: 'Cold Email', color: 'from-cyan-500 to-cyan-600' },
    { type: 'linkedin' as const, icon: MessageSquare, label: 'LinkedIn Outreach', color: 'from-purple-500 to-purple-600' },
    { type: 'content' as const, icon: BookOpen, label: 'Add Content', color: 'from-green-500 to-green-600' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <TimeGreeting />
            <StatsOverview userData={userData} />
            <AdvancedStats userData={userData} />

            {/* Quick Actions */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition duration-500" />
              <div className="relative bg-card border border-border/50 rounded-3xl shadow-xl backdrop-blur-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl ring-1 ring-primary/20">
                    <Plus className="w-5 h-5 text-primary" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Quick Actions</h2>
                    <p className="text-sm text-muted-foreground mt-1">Add new entries with one click</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.type}
                      onClick={() => setActiveModal(action.type)}
                      className="group/btn relative p-6 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover/btn:scale-110 group-hover/btn:rotate-3 transition-all duration-300`}>
                          <action.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-sm font-semibold group-hover/btn:text-primary transition-colors duration-300">{action.label}</h3>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Job Applications</h2>
              <button
                onClick={() => setActiveModal('application')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Add Application
              </button>
            </div>
            <ApplicationsList
              applications={userData.applications}
              onDelete={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  applications: prev.applications.filter((a) => a.id !== id),
                }))
              }
              onViewDetails={(app) => setDetailView({ type: 'application', entry: app })}
            />
          </div>
        );

      case 'emails':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Cold Emails</h2>
              <button
                onClick={() => setActiveModal('coldEmail')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Add Cold Email
              </button>
            </div>
            <ColdEmailsList
              coldEmails={userData.coldEmails}
              onDelete={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  coldEmails: prev.coldEmails.filter((e) => e.id !== id),
                }))
              }
              onViewDetails={(email) => setDetailView({ type: 'coldEmail', entry: email })}
            />
          </div>
        );

      case 'linkedin':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">LinkedIn Outreach</h2>
              <button
                onClick={() => setActiveModal('linkedin')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Add Outreach
              </button>
            </div>
            <LinkedInOutreachList
              outreach={userData.linkedInOutreach}
              onDelete={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  linkedInOutreach: prev.linkedInOutreach.filter((o) => o.id !== id),
                }))
              }
              onViewDetails={(item) => setDetailView({ type: 'linkedin', entry: item })}
            />
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Content Library</h2>
              <button
                onClick={() => setActiveModal('content')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Add Content
              </button>
            </div>
            <ContentLibrary
              content={userData.contentLibrary}
              onDelete={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  contentLibrary: prev.contentLibrary.filter((c) => c.id !== id),
                }))
              }
            />
          </div>
        );

      case 'todos':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">To-Do List</h2>
            <TodoList
              todos={userData.todos}
              onAdd={(text) =>
                setUserData((prev) => ({
                  ...prev,
                  todos: [
                    {
                      id: Date.now().toString(),
                      date: format(new Date(), 'yyyy-MM-dd'),
                      text,
                      completed: false,
                    },
                    ...prev.todos,
                  ],
                }))
              }
              onToggle={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  todos: prev.todos.map((t) =>
                    t.id === id
                      ? {
                          ...t,
                          completed: !t.completed,
                          completedDate: !t.completed ? format(new Date(), 'yyyy-MM-dd') : undefined,
                        }
                      : t
                  ),
                }))
              }
              onDelete={(id) =>
                setUserData((prev) => ({
                  ...prev,
                  todos: prev.todos.filter((t) => t.id !== id),
                }))
              }
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Analytics</h2>
            <AdvancedStats userData={userData} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background-secondary overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-10">
          {renderContent()}
        </div>
      </main>

      {activeModal && (
        <QuickAddModal
          type={activeModal}
          customFields={
            activeModal === 'application'
              ? userData.customFields.applications
              : activeModal === 'coldEmail'
              ? userData.customFields.coldEmails
              : activeModal === 'linkedin'
              ? userData.customFields.linkedInOutreach
              : []
          }
          onClose={() => setActiveModal(null)}
          onAdd={(data) => {
            const { customFields, ...baseData } = data;
            const processedData = { ...baseData };

            if (activeModal === 'coldEmail' && processedData.isFollowUp) {
              processedData.isFollowUp = processedData.isFollowUp === 'true';
            }

            const newEntry = {
              ...processedData,
              id: Date.now().toString(),
              date: format(new Date(), 'yyyy-MM-dd'),
              customFields: customFields || {},
            };

            setUserData((prev) => {
              switch (activeModal) {
                case 'application':
                  return { ...prev, applications: [newEntry as any, ...prev.applications] };
                case 'coldEmail':
                  return { ...prev, coldEmails: [newEntry as any, ...prev.coldEmails] };
                case 'linkedin':
                  return { ...prev, linkedInOutreach: [newEntry as any, ...prev.linkedInOutreach] };
                case 'content':
                  return { ...prev, contentLibrary: [newEntry as any, ...prev.contentLibrary] };
                default:
                  return prev;
              }
            });

            setActiveModal(null);
          }}
        />
      )}

      {detailView && (
        <DetailViewModal
          type={detailView.type}
          entry={detailView.entry}
          customFields={
            detailView.type === 'application'
              ? userData.customFields.applications
              : detailView.type === 'coldEmail'
              ? userData.customFields.coldEmails
              : userData.customFields.linkedInOutreach
          }
          onClose={() => setDetailView(null)}
          onUpdate={handleUpdateEntry}
          onAddCustomField={handleAddCustomField}
        />
      )}
    </div>
  );
}
