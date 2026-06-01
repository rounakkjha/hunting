import {
  LayoutDashboard,
  FileText,
  Mail,
  MessageSquare,
  BookOpen,
  CheckSquare,
  BarChart3,
  Settings,
  LogOut,
  Target,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeSection, setActiveSection, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'applications', icon: FileText, label: 'Applications' },
    { id: 'emails', icon: Mail, label: 'Cold Emails' },
    { id: 'linkedin', icon: MessageSquare, label: 'LinkedIn' },
    { id: 'content', icon: BookOpen, label: 'Content' },
    { id: 'todos', icon: CheckSquare, label: 'To-Dos' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <aside className="w-72 h-screen bg-card border-r border-border/50 flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold">HuntLog</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Job Hunt Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/60 transition-all duration-300"
          >
            <Settings className="w-5 h-5" strokeWidth={2.5} />
            <span className="font-medium">Settings</span>
          </button>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 p-4 bg-background/60 rounded-xl border border-border/50">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl opacity-75 group-hover:opacity-100 blur transition duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shadow-lg">
              RJ
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">Rounak Jha</p>
            <p className="text-xs text-muted-foreground">rounakjha5</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
