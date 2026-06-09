import {
  LayoutDashboard,
  FileText,
  Mail,
  MessageSquare,
  BookOpen,
  CheckSquare,
  BarChart3,
  Link2,
  Building2,
  Trash2,
  Crosshair,
  LogOut,
  Target,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Users,
  Briefcase,
  Key,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface MenuItem {
  id: string;
  icon: any;
  label: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
  onChangePassword?: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  currentUser?: { role: string; username?: string } | null;
}

export default function Sidebar({ activeSection, setActiveSection, onLogout, onChangePassword, collapsed, onToggleCollapse, mobileOpen, onMobileClose, currentUser }: SidebarProps) {
  const handleNavClick = (section: string) => {
    setActiveSection(section);
    onMobileClose?.();
  };

  const isSuperAdmin = currentUser?.role === 'superadmin';

  const menuGroups: MenuGroup[] = [
    {
      title: '',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      ],
    },
    {
      title: 'Outreach',
      items: [
        { id: 'applications', icon: FileText, label: 'Applications' },
        { id: 'emails', icon: Mail, label: 'Cold Emails' },
        { id: 'linkedin', icon: MessageSquare, label: 'LinkedIn' },
        { id: 'interviews', icon: Briefcase, label: 'Interviews' },
        { id: 'targets', icon: Building2, label: 'Target Companies' },
      ],
    },
    {
      title: 'Planning',
      items: [
        { id: 'todos', icon: CheckSquare, label: 'To-Dos' },
        { id: 'strategy', icon: Crosshair, label: 'Strategy' },
        { id: 'content', icon: BookOpen, label: 'Content' },
        { id: 'links', icon: Link2, label: 'Quick Links' },
      ],
    },
    {
      title: 'More',
      items: [
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        ...(isSuperAdmin ? [{ id: 'users', icon: Users, label: 'User Management' }] : []),
        { id: 'trash', icon: Trash2, label: 'Trash' },
      ],
    },
  ];

  const allItems = menuGroups.flatMap((g) => g.items);

  if (collapsed) {
    return (
      <aside className="hidden md:flex w-16 h-screen bg-card border-r border-border/50 flex-col sticky top-0 items-center py-4 gap-2 animate-slide-in-left z-50">
        <button
          onClick={onToggleCollapse}
          className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all mb-4"
          title="Expand sidebar"
        >
          <PanelLeftOpen className="w-5 h-5" strokeWidth={2} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 mb-6">
          <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <nav className="flex-1 flex flex-col items-center gap-2 py-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.title || 'top'} className="flex flex-col items-center gap-2">
              {groupIndex > 0 && (
                <div className="w-6 h-px bg-border/40 my-1" />
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <div key={item.id} className="relative group/tooltip">
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    {/* Tooltip */}
                    <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-card text-foreground text-xs font-medium rounded-lg border border-border/60 shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100]">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-3 py-4 border-t border-border/50">
          <ThemeToggle />
        </div>
      </aside>
    );
  }

  const sidebarContent = (
    <aside className={`w-72 h-screen bg-card border-r border-border/50 flex flex-col ${
      mobileOpen ? 'animate-slide-in-left' : 'animate-slide-in-left'
    }`}>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold">HuntLog</h1>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Job Hunt Tracker
              </p>
            </div>
          </div>
          {/* Desktop: collapse button | Mobile: close button */}
          <button
            onClick={mobileOpen ? onMobileClose : onToggleCollapse}
            className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
            title={mobileOpen ? 'Close menu' : 'Collapse sidebar'}
          >
            {mobileOpen ? <X className="w-4 h-4" strokeWidth={2.5} /> : <PanelLeftClose className="w-4 h-4" strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.title || 'top'} className={group.title ? 'mt-3' : ''}>
            {group.title && (
              <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" strokeWidth={2.5} />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-3 bg-background/60 rounded-xl border border-border/50">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl opacity-75 group-hover:opacity-100 blur transition duration-300" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold shadow-lg">
              {currentUser?.username?.slice(0, 2).toUpperCase() || 'UJ'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{currentUser?.username || 'User'}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser?.role || 'user'}</p>
          </div>
          <ThemeToggle />
          <button
            onClick={onChangePassword}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
            title="Change Password"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  // Mobile: overlay
  if (mobileOpen) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
        <div className="relative w-72 h-full">
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Desktop: static sidebar
  return (
    <div className="hidden md:block sticky top-0 h-screen">
      {sidebarContent}
    </div>
  );
}
