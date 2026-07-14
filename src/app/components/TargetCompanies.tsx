import { useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Plus,
  Trash2,
  UserPlus,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Users,
  Mail,
  Download,
  Pencil,
  Linkedin,
  X,
  ExternalLink,
  CheckCircle2,
  Archive,
  Search,
  AlertCircle,
} from 'lucide-react';
import type { TargetCompany, CompanyContact, ReferralStatus } from '../App';
import CompanyAutocomplete from './CompanyAutocomplete';
import { Skeleton } from './ui/skeleton';

interface TargetCompaniesProps {
  companies: TargetCompany[];
  onAdd: (company: string, role?: string, date?: string, jobUrl?: string, referralStatus?: ReferralStatus) => void;
  onDelete: (id: string) => void;
  onAddContact: (companyId: string, contact: Omit<CompanyContact, 'id'>) => void;
  onDeleteContact: (companyId: string, contactId: string) => void;
  onUpdateContact: (companyId: string, contactId: string, updates: Partial<CompanyContact>) => void;
  onUpdateCompany: (companyId: string, updates: Partial<TargetCompany>) => void;
  onUpdateNotes: (companyId: string, notes: string) => void;
  isLoading?: boolean;
}

const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  asked: 'Asked for referral',
  awaiting: 'Awaiting referral',
  done: 'Referral done',
};

const REFERRAL_STATUS_COLORS: Record<ReferralStatus, string> = {
  asked: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  awaiting: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  done: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

export default function TargetCompanies({
  companies,
  onAdd,
  onDelete,
  onAddContact,
  onDeleteContact,
  onUpdateContact,
  onUpdateCompany,
  onUpdateNotes,
  isLoading,
}: TargetCompaniesProps) {
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newJobUrl, setNewJobUrl] = useState('');
  const [newReferralStatus, setNewReferralStatus] = useState<ReferralStatus | ''>('');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contactForms, setContactForms] = useState<Record<string, { name: string; email: string; role: string; linkedinUrl: string }>>({})
  const [editingContact, setEditingContact] = useState<{ companyId: string; contactId: string; name: string; email: string; role: string; linkedinUrl: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanyRole, setEditCompanyRole] = useState('');
  const [editJobUrl, setEditJobUrl] = useState('');
  const [editReferralStatus, setEditReferralStatus] = useState<ReferralStatus | ''>('');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [referralFilter, setReferralFilter] = useState<ReferralStatus | 'no_filter' | 'all_referral' | 'no_referral'>('no_filter');
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingCompany, setPendingCompany] = useState<{ company: string; role?: string; date: string; jobUrl?: string; referralStatus?: ReferralStatus } | null>(null);

  if (isLoading) return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );

  const filteredCompanies = companies.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      c.company?.toLowerCase().includes(query) ||
      c.role?.toLowerCase().includes(query)
    );
    const matchesReferral =
      referralFilter === 'no_filter' ||
      (referralFilter === 'all_referral' && !!c.referralStatus) ||
      (referralFilter === 'no_referral' && !c.referralStatus) ||
      c.referralStatus === referralFilter;
    return matchesSearch && matchesReferral;
  });

  const activeCompanies = filteredCompanies.filter((c) => !c.targeted);
  const archivedCompanies = filteredCompanies.filter((c) => c.targeted);

  const toggleSelectCompany = (companyId: string) => {
    setSelectedCompanies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const displayCompanies = showArchived ? archivedCompanies : activeCompanies;
    if (selectedCompanies.size === displayCompanies.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(displayCompanies.map((c) => c.id)));
    }
  };

  const handleExport = () => {
    const companiesToExport = selectedCompanies.size > 0
      ? companies.filter((c) => selectedCompanies.has(c.id))
      : companies;

    const rows: string[][] = [['Company', 'Contact Name', 'Email', 'Role', 'LinkedIn']];
    companiesToExport.forEach((c) => {
      if (c.contacts.length === 0) {
        rows.push([c.company, '', '', '', '']);
      } else {
        c.contacts.forEach((ct) => {
          rows.push([c.company, ct.name, ct.email || '', ct.role || '', ct.linkedinUrl || '']);
        });
      }
    });
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `target_companies_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim() || !newJobUrl.trim()) return;

    // Check for duplicate
    const isDuplicate = companies.some(c => 
      c.company?.toLowerCase() === newCompany.trim().toLowerCase()
    );

    if (isDuplicate) {
      setPendingCompany({
        company: newCompany.trim(),
        role: newRole.trim(),
        date: newDate,
        jobUrl: newJobUrl.trim(),
        referralStatus: newReferralStatus || undefined,
      });
      setShowDuplicateWarning(true);
      return;
    }

    onAdd(newCompany.trim(), newRole.trim(), newDate, newJobUrl.trim(), newReferralStatus || undefined);
    setNewCompany('');
    setNewRole('');
    setNewJobUrl('');
    setNewReferralStatus('');
    setNewDate(format(new Date(), 'yyyy-MM-dd'));
    setShowAddForm(false);
  };

  const handleAddContact = (companyId: string) => {
    const form = contactForms[companyId];
    if (!form?.name?.trim()) return;
    onAddContact(companyId, {
      name: form.name.trim(),
      email: form.email?.trim() || undefined,
      role: form.role?.trim() || undefined,
      linkedinUrl: form.linkedinUrl?.trim() || undefined,
    });
    setContactForms((prev: Record<string, { name: string; email: string; role: string; linkedinUrl: string }>) => ({ ...prev, [companyId]: { name: '', email: '', role: '', linkedinUrl: '' } }));
  };

  const startEditContact = (companyId: string, contact: CompanyContact) => {
    setEditingContact({
      companyId,
      contactId: contact.id,
      name: contact.name,
      email: contact.email || '',
      role: contact.role || '',
      linkedinUrl: contact.linkedinUrl || '',
    });
  };

  const saveEditContact = () => {
    if (!editingContact || !editingContact.name.trim()) return;
    onUpdateContact(editingContact.companyId, editingContact.contactId, {
      name: editingContact.name.trim(),
      email: editingContact.email.trim() || undefined,
      role: editingContact.role.trim() || undefined,
      linkedinUrl: editingContact.linkedinUrl.trim() || undefined,
    });
    setEditingContact(null);
  };

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getContactForm = (companyId: string) =>
    contactForms[companyId] || { name: '', email: '', role: '', linkedinUrl: '' };

  const updateContactForm = (companyId: string, field: string, value: string) => {
    setContactForms((prev: Record<string, { name: string; email: string; role: string; linkedinUrl: string }>) => ({
      ...prev,
      [companyId]: { ...getContactForm(companyId), [field]: value },
    }));
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-3xl opacity-0 group-hover:opacity-100 blur transition duration-500 hidden sm:block" />
      <div className="relative bg-card border border-border/50 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="border-b border-border/50 bg-gradient-to-r from-indigo-500/5 to-transparent px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-2xl ring-1 ring-indigo-500/20">
                <Building2 className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Target Companies</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredCompanies.length} of {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} ·{' '}
                  {filteredCompanies.reduce((sum, c) => sum + c.contacts.length, 0)} contacts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={referralFilter}
                onChange={(e) => setReferralFilter(e.target.value as ReferralStatus | 'no_filter' | 'all_referral' | 'no_referral')}
                className="pl-3 pr-10 py-2 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm cursor-pointer"
              >
                <option value="no_filter">No Filter</option>
                <option value="all_referral">All Referral</option>
                <option value="no_referral">Except Referral</option>
                <option value="asked">Asked</option>
                <option value="awaiting">Awaiting</option>
                <option value="done">Done</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies..."
                  className="w-48 sm:w-64 pl-10 pr-10 py-2 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filteredCompanies.length > 0 && (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 px-4 py-2 bg-muted/50 text-foreground hover:bg-muted rounded-xl text-sm border border-border/60 hover:border-border transition-all"
                  title="Select/Deselect all"
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  {selectedCompanies.size > 0 ? `Selected (${selectedCompanies.size})` : 'Select All'}
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-muted/50 text-foreground hover:bg-muted rounded-xl text-sm border border-border/60 hover:border-border transition-all"
                  title="Download as Excel/CSV"
                >
                  <Download className="w-4 h-4" strokeWidth={2.5} />
                  Export {selectedCompanies.size > 0 ? `(${selectedCompanies.size})` : ''}
                </button>
              </>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Company
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {showAddForm && (
            <form
              onSubmit={handleAddCompany}
              className="mb-4 p-4 bg-background/50 rounded-2xl border border-border/60 space-y-3 animate-fade-in"
            >
              <label className="block text-sm font-medium text-foreground/80 mb-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
              />
              <label className="block text-sm font-medium text-foreground/80 mb-1">Company Name</label>
              <CompanyAutocomplete
                value={newCompany}
                onChange={setNewCompany}
                placeholder="e.g., Google"
                required
              />
              <label className="block text-sm font-medium text-foreground/80 mb-1">Role</label>
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                placeholder="e.g., Product Manager"
                required
              />
              <label className="block text-sm font-medium text-foreground/80 mb-1">Job Link</label>
              <input
                type="url"
                value={newJobUrl}
                onChange={(e) => setNewJobUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                placeholder="https://..."
                required
              />
              <label className="block text-sm font-medium text-foreground/80 mb-1">Referral Status</label>
              <select
                value={newReferralStatus}
                onChange={(e) => setNewReferralStatus(e.target.value as ReferralStatus | '')}
                className="w-full px-4 py-2.5 bg-background/60 rounded-xl border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
              >
                <option value="">No status</option>
                <option value="asked">Asked for referral</option>
                <option value="awaiting">Awaiting referral</option>
                <option value="done">Referral done</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm hover:shadow-lg transition-all"
                >
                  Add Company
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 bg-muted/50 text-muted-foreground rounded-xl text-sm hover:bg-muted transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {companies.length === 0 && !showAddForm ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 flex items-center justify-center ring-1 ring-indigo-500/20">
                <Building2 className="w-10 h-10 text-indigo-500/50" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No target companies yet</h4>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add companies you want to reach out to and track their employee contacts
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCompanies.map((company) => {
                const isExpanded = expandedId === company.id;
                const form = getContactForm(company.id);

                return (
                  <div
                    key={company.id}
                    className="bg-background/50 rounded-2xl border border-border/60 overflow-hidden transition-all group/card"
                  >
                    {/* Company Header */}
                    {editingCompanyId === company.id ? (
                      <div className="p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editCompanyName}
                            onChange={(e) => setEditCompanyName(e.target.value)}
                            className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm font-medium"
                            placeholder="Company Name"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editCompanyRole}
                            onChange={(e) => setEditCompanyRole(e.target.value)}
                            className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                            placeholder="Role (optional)"
                          />
                          <input
                            type="url"
                            value={editJobUrl}
                            onChange={(e) => setEditJobUrl(e.target.value)}
                            className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                            placeholder="Job Link (optional)"
                          />
                          <select
                            value={editReferralStatus}
                            onChange={(e) => setEditReferralStatus(e.target.value as ReferralStatus | '')}
                            className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                          >
                            <option value="">No referral status</option>
                            <option value="asked">Asked for referral</option>
                            <option value="awaiting">Awaiting referral</option>
                            <option value="done">Referral done</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (editCompanyName.trim()) {
                                onUpdateCompany(company.id, {
                                  company: editCompanyName.trim(),
                                  role: editCompanyRole.trim() || undefined,
                                  jobUrl: editJobUrl.trim() || undefined,
                                  referralStatus: editReferralStatus || undefined,
                                });
                              }
                              setEditingCompanyId(null);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-xs hover:shadow-lg transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCompanyId(null)}
                            className="px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-lg text-xs hover:bg-muted transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-all"
                      onClick={() => toggleExpand(company.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCompanies.has(company.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectCompany(company.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-4 h-4 rounded border-border/60 text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer shrink-0 transition-opacity ${
                          selectedCompanies.has(company.id) ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'
                        }`}
                      />
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Building2 className="w-4 h-4 text-primary" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base">{company.company}</h4>
                        <p className="text-xs text-muted-foreground">
                          {company.role && <span className="text-foreground/70 font-medium">{company.role} · </span>}
                          {company.contacts.length} contact{company.contacts.length !== 1 ? 's' : ''}
                          {company.referralStatus && (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-medium ${REFERRAL_STATUS_COLORS[company.referralStatus]}`}>
                              {REFERRAL_STATUS_LABELS[company.referralStatus]}
                              {company.updatedAt && (
                                <span className="ml-1.5 opacity-80">· {format(new Date(company.updatedAt), 'MMM dd')}</span>
                              )}
                            </span>
                          )}
                        </p>
                        {company.jobUrl && (
                          <a
                            href={company.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> Job Link
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateCompany(company.id, { targeted: true });
                          }}
                          className="opacity-0 group-hover/card:opacity-100 p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg border border-transparent hover:border-emerald-500/20 transition-all"
                          title="Mark as targeted (archive)"
                        >
                          <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCompanyId(company.id);
                            setEditCompanyName(company.company);
                            setEditCompanyRole(company.role || '');
                            setEditJobUrl(company.jobUrl || '');
                            setEditReferralStatus(company.referralStatus || '');
                          }}
                          className="opacity-0 group-hover/card:opacity-100 p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20 transition-all"
                          title="Edit company"
                        >
                          <Pencil className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(company.id);
                          }}
                          className="opacity-0 group-hover/card:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    )}

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-border/40 p-4 space-y-3 animate-fade-in">
                        {/* Contacts List */}
                        {company.contacts.length > 0 && (
                          <div className="space-y-2">
                            {company.contacts.map((contact) => (
                              <div key={contact.id}>
                                {editingContact?.contactId === contact.id ? (
                                  <div className="p-3 bg-muted/30 rounded-xl space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        value={editingContact.name}
                                        onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                                        className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                                        placeholder="Name"
                                        autoFocus
                                      />
                                      <input
                                        type="text"
                                        value={editingContact.email}
                                        onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                                        className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                                        placeholder="Email (optional)"
                                      />
                                      <input
                                        type="text"
                                        value={editingContact.role}
                                        onChange={(e) => setEditingContact({ ...editingContact, role: e.target.value })}
                                        className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                                        placeholder="Role (optional)"
                                      />
                                      <input
                                        type="text"
                                        value={editingContact.linkedinUrl}
                                        onChange={(e) => setEditingContact({ ...editingContact, linkedinUrl: e.target.value })}
                                        className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                                        placeholder="LinkedIn URL (optional)"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={saveEditContact}
                                        className="px-3 py-1.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-xs hover:shadow-lg transition-all"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingContact(null)}
                                        className="px-3 py-1.5 bg-muted/50 text-muted-foreground rounded-lg text-xs hover:bg-muted transition-all"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl group/contact">
                                    <div className="p-1.5 bg-indigo-500/10 rounded-lg shrink-0">
                                      <Users className="w-3.5 h-3.5 text-indigo-500" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{contact.name}</p>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {contact.email && (
                                          <div className="flex items-center gap-1.5">
                                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                                            <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                                          </div>
                                        )}
                                        {contact.linkedinUrl && (
                                          <a
                                            href={contact.linkedinUrl.startsWith('http') ? contact.linkedinUrl : `https://${contact.linkedinUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Linkedin className="w-3 h-3 shrink-0" />
                                            <span className="truncate max-w-[120px]">LinkedIn</span>
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                      </div>
                                      {contact.role && (
                                        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{contact.role}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {contact.email && (
                                        <button
                                          onClick={() => handleCopyEmail(contact.email!, contact.id)}
                                          className={`p-1.5 rounded-lg border transition-all ${
                                            copiedId === contact.id
                                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                              : 'text-muted-foreground border-transparent hover:bg-muted/50 hover:border-border/50'
                                          }`}
                                          title="Copy email"
                                        >
                                          {copiedId === contact.id ? (
                                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" strokeWidth={2.5} />
                                          )}
                                        </button>
                                      )}
                                      <button
                                        onClick={() => startEditContact(company.id, contact)}
                                        className="opacity-0 group-hover/contact:opacity-100 p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20 transition-all"
                                        title="Edit contact"
                                      >
                                        <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} />
                                      </button>
                                      <button
                                        onClick={() => onDeleteContact(company.id, contact.id)}
                                        className="opacity-0 group-hover/contact:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                                        title="Remove contact"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Contact Form */}
                        <div className="p-3 bg-muted/20 rounded-xl border border-dashed border-border/60 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <UserPlus className="w-3.5 h-3.5" /> Add Contact
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={form.name}
                              onChange={(e) => updateContactForm(company.id, 'name', e.target.value)}
                              className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                              placeholder="Name *"
                            />
                            <input
                              type="text"
                              value={form.email}
                              onChange={(e) => updateContactForm(company.id, 'email', e.target.value)}
                              className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                              placeholder="Email (optional)"
                            />
                            <input
                              type="text"
                              value={form.role}
                              onChange={(e) => updateContactForm(company.id, 'role', e.target.value)}
                              className="px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                              placeholder="Role (optional)"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={form.linkedinUrl}
                                onChange={(e) => updateContactForm(company.id, 'linkedinUrl', e.target.value)}
                                className="flex-1 px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm"
                                placeholder="LinkedIn URL (optional)"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddContact(company.id)}
                                disabled={!form.name?.trim()}
                                className="px-3 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                              >
                                <Plus className="w-4 h-4" strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <textarea
                          value={company.notes || ''}
                          onChange={(e) => onUpdateNotes(company.id, e.target.value)}
                          className="w-full px-3 py-2 bg-background/60 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none transition-all text-sm resize-none"
                          rows={2}
                          placeholder="Notes about this company..."
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Archived / Targeted Section */}
              {archivedCompanies.length > 0 && (
                <div className="pt-4 border-t border-border/40 mt-4">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
                  >
                    <Archive className="w-4 h-4" />
                    Targeted / Archived ({archivedCompanies.length})
                    {showArchived ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showArchived && (
                    <div className="space-y-2">
                      {archivedCompanies.map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/40 opacity-70 group/archived"
                        >
                          <div className="p-1.5 bg-emerald-500/10 rounded-lg shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{company.company}</p>
                            {company.role && <p className="text-[11px] text-muted-foreground">{company.role}</p>}
                          </div>
                          <button
                            onClick={() => onUpdateCompany(company.id, { targeted: false })}
                            className="opacity-0 group-hover/archived:opacity-100 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border/40 transition-all"
                            title="Restore to active"
                          >
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Duplicate Warning Dialog */}
      {showDuplicateWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-card rounded-2xl border border-border/60 shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold">Duplicate Company Detected</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              A company with this name already exists. Do you want to continue adding it?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDuplicateWarning(false);
                  setPendingCompany(null);
                }}
                className="flex-1 px-4 py-2.5 bg-muted/50 text-muted-foreground rounded-xl hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pendingCompany) {
                    onAdd(pendingCompany.company, pendingCompany.role, pendingCompany.date, pendingCompany.jobUrl, pendingCompany.referralStatus);
                  }
                  setShowDuplicateWarning(false);
                  setPendingCompany(null);
                  setNewCompany('');
                  setNewRole('');
                  setNewJobUrl('');
                  setNewReferralStatus('');
                  setNewDate(format(new Date(), 'yyyy-MM-dd'));
                  setShowAddForm(false);
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
