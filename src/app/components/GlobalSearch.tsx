import { useState, useRef, useEffect } from 'react';
import { Search, FileText, Mail, MessageSquare, X, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import type { UserData, JobApplication, ColdEmail, LinkedInOutreach, TargetCompany } from '../App';

interface GlobalSearchProps {
  userData: UserData;
  onNavigate: (section: string) => void;
  onHighlight: (section: string, id: string) => void;
}

interface SearchResult {
  id: string;
  type: 'application' | 'coldEmail' | 'linkedin' | 'target';
  title: string;
  subtitle: string;
  date: string;
}

export default function GlobalSearch({
  userData,
  onNavigate,
  onHighlight,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const q = query.toLowerCase();
    const matched: SearchResult[] = [];

    // Search applications (exclude quick-apply count-only entries)
    userData.applications.filter((app) => !app.isQuickApply).forEach((app) => {
      if (
        app.company.toLowerCase().includes(q) ||
        (app.role && app.role.toLowerCase().includes(q)) ||
        (app.source && app.source.toLowerCase().includes(q)) ||
        (app.emailTag && app.emailTag.toLowerCase().includes(q))
      ) {
        matched.push({ id: app.id, type: 'application', title: app.company, subtitle: app.role || 'Job Application', date: app.date });
      }
    });

    // Search cold emails
    userData.coldEmails.forEach((email) => {
      if (
        email.company.toLowerCase().includes(q) ||
        (email.email && email.email.toLowerCase().includes(q)) ||
        (email.role && email.role.toLowerCase().includes(q))
      ) {
        matched.push({ id: email.id, type: 'coldEmail', title: email.company, subtitle: email.email || email.role || 'Cold Email', date: email.date });
      }
    });

    // Search LinkedIn outreach
    userData.linkedInOutreach.forEach((outreach) => {
      if (
        (outreach.company && outreach.company.toLowerCase().includes(q)) ||
        (outreach.name && outreach.name.toLowerCase().includes(q)) ||
        (outreach.role && outreach.role.toLowerCase().includes(q))
      ) {
        matched.push({
          id: outreach.id,
          type: 'linkedin',
          title: outreach.name || outreach.company || 'LinkedIn Outreach',
          subtitle: outreach.company ? `${outreach.role || 'Contact'} at ${outreach.company}` : outreach.role || 'LinkedIn Outreach',
          date: outreach.date,
        });
      }
    });

    // Search target companies
    userData.targetCompanies.forEach((target) => {
      if (
        target.company.toLowerCase().includes(q) ||
        (target.role && target.role.toLowerCase().includes(q))
      ) {
        matched.push({ id: target.id, type: 'target', title: target.company, subtitle: target.role || 'Target Company', date: target.date });
      }
    });

    // Sort by date descending
    matched.sort((a, b) => b.date.localeCompare(a.date));
    setResults(matched.slice(0, 12));
    setIsOpen(matched.length > 0);
  }, [query, userData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sectionMap: Record<string, string> = {
    application: 'applications',
    coldEmail: 'emails',
    linkedin: 'linkedin',
    target: 'targets',
  };

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    const section = sectionMap[result.type];
    onNavigate(section);
    setTimeout(() => onHighlight(section, result.id), 150);
  };

  const typeConfig = {
    application: { icon: FileText, label: 'Application', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    coldEmail: { icon: Mail, label: 'Cold Email', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    linkedin: { icon: MessageSquare, label: 'LinkedIn', color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
    target: { icon: Building2, label: 'Target Co.', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          className="w-full pl-11 pr-10 py-3 bg-background/60 backdrop-blur-sm rounded-2xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm placeholder:text-muted-foreground/60"
          placeholder="Search by company, person, role..."
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-border/40">
            <p className="text-[11px] text-muted-foreground font-medium px-3 py-1">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto p-1.5">
            {results.map((result: SearchResult) => {
              const config = typeConfig[result.type];
              const Icon = config.icon;
              return (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted/50 transition-all group/result"
                >
                  <div className={`p-2 rounded-lg border ${config.color} shrink-0`}>
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover/result:text-primary transition-colors">
                      {result.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${config.color}`}>
                      {config.label}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {format(new Date(result.date), 'MMM dd')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border/60 rounded-2xl shadow-2xl p-6 text-center animate-fade-in">
          <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
