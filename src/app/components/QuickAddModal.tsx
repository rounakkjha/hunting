import { useState, useRef, useEffect } from 'react';
import { X, Plus, Upload, FileText, Trash2, Calendar, Clock, CheckCircle, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import type { CustomField, InterviewRoundStatus, InterviewStatus, Interview } from '../App';
import CompanyAutocomplete from './CompanyAutocomplete';

interface QuickAddModalProps {
  type: 'application' | 'coldEmail' | 'linkedin' | 'content' | 'interview';
  customFields?: CustomField[];
  knownCompanies?: string[];
  onClose: () => void;
  onAdd: (data: any) => void;
  onAddKnownCompany?: (company: string) => void;
  editingEntry?: any;
  existingEntries?: any[];
}

export default function QuickAddModal({ type, customFields = [], knownCompanies = [], onClose, onAdd, onAddKnownCompany, editingEntry, existingEntries = [] }: QuickAddModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});
  const [resumeFile, setResumeFile] = useState<{ name: string; data: string } | null>(null);
  const [rounds, setRounds] = useState<Array<{ id: string; roundName: string; date: string; status: InterviewRoundStatus; notes: string }>>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with editing data
  useEffect(() => {
    if (editingEntry) {
      // Pre-fill form with existing entry data
      setFormData({
        date: editingEntry.date || new Date().toISOString().split('T')[0],
        company: editingEntry.company || '',
        role: editingEntry.role || '',
        source: editingEntry.source || '',
        customSource: editingEntry.source === 'Other' ? editingEntry.source : '',
        email: editingEntry.email || '',
        name: editingEntry.name || '',
        location: editingEntry.location || '',
        jobUrl: editingEntry.jobUrl || '',
        jobId: editingEntry.jobId || '',
        notes: editingEntry.notes || '',
        title: editingEntry.title || '',
        content: editingEntry.content || '',
        isFollowUp: editingEntry.isFollowUp ? 'true' : 'false',
        isAlumni: editingEntry.isAlumni ? 'true' : 'false',
        isGreatLakesAlumni: editingEntry.isGreatLakesAlumni ? 'true' : 'false',
        referrerName: editingEntry.referrerName || '',
        referrerRole: editingEntry.referrerRole || '',
        emailTag: editingEntry.emailTag || '',
      });
      setCustomFieldsData(editingEntry.customFields || {});
      if (type === 'interview') {
        setRounds(editingEntry.rounds || []);
      }
      if (editingEntry.resumeData) {
        setResumeFile({ name: editingEntry.resumeName || 'resume', data: editingEntry.resumeData });
      }
    } else {
      // Initialize with default values for new entry
      const today = new Date().toISOString().split('T')[0];
      setFormData({ date: today });
      setCustomFieldsData({});
      if (type === 'interview') {
        setRounds([]);
      }
      setResumeFile(null);
    }
  }, [editingEntry, type]);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setResumeFile({ name: file.name, data: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const checkForDuplicate = (data: any): boolean => {
    if (editingEntry) return false; // Skip check when editing

    switch (type) {
      case 'application':
        return existingEntries.some((e: any) => 
          e.company?.toLowerCase() === data.company?.toLowerCase()
        );
      case 'coldEmail':
        return existingEntries.some((e: any) => 
          e.company?.toLowerCase() === data.company?.toLowerCase()
        );
      case 'linkedin':
        return existingEntries.some((e: any) => 
          e.name?.toLowerCase() === data.name?.toLowerCase() ||
          e.company?.toLowerCase() === data.company?.toLowerCase()
        );
      case 'interview':
        return existingEntries.some((e: any) => 
          e.company?.toLowerCase() === data.company?.toLowerCase() &&
          e.role?.toLowerCase() === data.role?.toLowerCase()
        );
      default:
        return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (finalData.source === 'Other' && finalData.customSource) {
      finalData.source = finalData.customSource;
    }
    delete finalData.customSource;
    const payload: any = { ...finalData, customFields: customFieldsData };
    if (resumeFile) {
      payload.resumeData = resumeFile.data;
      payload.resumeName = resumeFile.name;
    }
    if (type === 'interview') {
      payload.rounds = rounds;
      payload.status = 'active';
      payload.sources = {};
      if (editingEntry) {
        payload.id = editingEntry.id;
        payload.createdAt = editingEntry.createdAt;
      }
    }

    // Check for duplicates
    if (checkForDuplicate(payload)) {
      setPendingSubmit(payload);
      setShowDuplicateWarning(true);
      return;
    }

    onAdd(payload);
    onClose();
  };

  const addRound = () => {
    // Auto-set previous round to selected if it exists and is pending
    const updatedRounds = [...rounds];
    if (updatedRounds.length > 0) {
      const lastRoundIndex = updatedRounds.length - 1;
      if (updatedRounds[lastRoundIndex].status === 'pending') {
        updatedRounds[lastRoundIndex] = { ...updatedRounds[lastRoundIndex], status: 'selected' };
      }
    }
    setRounds([...updatedRounds, {
      id: Date.now().toString(),
      roundName: '',
      date: '',
      status: 'pending',
      notes: ''
    }]);
  };

  const updateRound = (id: string, field: string, value: any) => {
    setRounds(rounds.map((r: any) => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRound = (id: string) => {
    setRounds(rounds.filter((r: any) => r.id !== id));
  };

  const renderCustomField = (field: CustomField) => {
    const value = customFieldsData[field.id];

    return (
      <div key={field.id} className="space-y-2">
        <label className="text-sm text-foreground/90">
          {field.name} {field.required && <span className="text-[var(--primary)]">*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            value={value || ''}
            onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all resize-none"
            required={field.required}
          />
        ) : field.type === 'select' ? (
          <select
            value={value || ''}
            onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
            className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
            className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
            required={field.required}
          />
        )}
      </div>
    );
  };

  const renderForm = () => {
    if (!type) {
      return null;
    }
    switch (type) {
      case 'application':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Date</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Company Name <span className="text-[var(--primary)]">*</span>
              </label>
              <CompanyAutocomplete
                value={formData.company || ''}
                onChange={(val) => setFormData({ ...formData, company: val })}
                placeholder="e.g., Google"
                required
                knownCompanies={knownCompanies}
                onAddCompany={onAddKnownCompany}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Source</label>
              <select
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value, customSource: '' })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
              >
                <option value="">Select source...</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Naukri">Naukri</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
              {formData.source === 'Other' && (
                <input
                  type="text"
                  value={formData.customSource || ''}
                  onChange={(e) => setFormData({ ...formData, customSource: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all mt-2"
                  placeholder="Enter source name"
                />
              )}
            </div>
            {formData.source === 'Referral' && (
              <div className="space-y-4 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20">
                <h4 className="text-sm font-semibold text-orange-500">Referral Details</h4>
                <div className="space-y-2">
                  <label className="text-sm text-foreground/90">Referrer Name</label>
                  <input
                    type="text"
                    value={formData.referrerName || ''}
                    onChange={(e) => setFormData({ ...formData, referrerName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                    placeholder="Who referred you?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground/90">Referrer Role</label>
                  <input
                    type="text"
                    value={formData.referrerRole || ''}
                    onChange={(e) => setFormData({ ...formData, referrerRole: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                    placeholder="e.g., Senior Engineer, HR Manager"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isGreatLakesAlumni"
                    checked={formData.isGreatLakesAlumni === 'true'}
                    onChange={(e) => setFormData({ ...formData, isGreatLakesAlumni: e.target.checked ? 'true' : 'false' })}
                    className="w-4 h-4 rounded border-border/60 text-orange-500 focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
                  />
                  <label htmlFor="isGreatLakesAlumni" className="text-sm text-foreground/90 cursor-pointer">
                    Great Lakes Alumni
                  </label>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="e.g., Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Tags</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: '', label: 'No Tag', icon: '—' },
                  { value: 'need_to_mail', label: 'Need to Contact', icon: '📧' },
                  { value: 'already_mailed', label: 'Contacted', icon: '✅' },
                  { value: 'ghost', label: 'Ghost', icon: '👻' },
                ].map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, emailTag: tag.value })}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      (formData.emailTag || '') === tag.value
                        ? 'bg-primary/10 border-primary/50 text-primary ring-2 ring-primary/20'
                        : 'bg-background/50 border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    <span>{tag.icon}</span>
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="e.g., Bangalore, Remote"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground/90">Job URL</label>
                <input
                  type="url"
                  value={formData.jobUrl || ''}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground/90">Job ID</label>
                <input
                  type="text"
                  value={formData.jobId || ''}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                  placeholder="e.g., JOB-12345"
                />
              </div>
            </div>
          </>
        );

      case 'coldEmail':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Date</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Company <span className="text-[var(--primary)]">*</span>
              </label>
              <CompanyAutocomplete
                value={formData.company || ''}
                onChange={(val) => setFormData({ ...formData, company: val })}
                placeholder="e.g., Google"
                required
                knownCompanies={knownCompanies}
                onAddCompany={onAddKnownCompany}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="recruiter@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="e.g., Senior Backend Engineer"
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
              <input
                type="checkbox"
                id="followUp"
                checked={formData.isFollowUp === 'true'}
                onChange={(e) => setFormData({ ...formData, isFollowUp: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 rounded border-border/60 text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer"
              />
              <label htmlFor="followUp" className="text-sm text-foreground/90 cursor-pointer flex-1">
                This is a follow-up email
              </label>
            </div>
          </>
        );

      case 'linkedin':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Date</label>
              <input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="Contact name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="e.g., Hiring Manager"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Company</label>
              <CompanyAutocomplete
                value={formData.company || ''}
                onChange={(val) => setFormData({ ...formData, company: val })}
                placeholder="Company name"
                knownCompanies={knownCompanies}
                onAddCompany={onAddKnownCompany}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isAlumni"
                checked={formData.isAlumni === 'true'}
                onChange={(e) => setFormData({ ...formData, isAlumni: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 rounded border-border/60 text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer"
              />
              <label htmlFor="isAlumni" className="text-sm text-foreground/90 cursor-pointer flex-1">
                This person is an alumni
              </label>
            </div>
          </>
        );

      case 'content':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Title <span className="text-[var(--primary)]">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="e.g., Software Engineer Cold Email Template"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Type</label>
              <select
                value={formData.type || 'Cold Email'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
              >
                <option value="Cold Email">Cold Email</option>
                <option value="LinkedIn Message">LinkedIn Message</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Content <span className="text-[var(--primary)]">*</span>
              </label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none resize-none transition-all"
                placeholder="Paste your email template or message here..."
                required
              />
            </div>
          </>
        );

      case 'interview':
        console.log('[QuickAddModal] Rendering interview case');
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Company <span className="text-[var(--primary)]">*</span>
              </label>
              <CompanyAutocomplete
                value={formData.company || ''}
                onChange={(val) => setFormData({ ...formData, company: val })}
                placeholder="e.g., Google"
                required
                knownCompanies={knownCompanies}
                onAddCompany={onAddKnownCompany}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Role <span className="text-[var(--primary)]">*</span>
              </label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                placeholder="e.g., Senior Frontend Engineer"
                required
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground/90">Interview Rounds</h4>
                <button
                  type="button"
                  onClick={addRound}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Add Round
                </button>
              </div>
              
              {rounds.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No rounds added yet</p>
              ) : (
                <div className="space-y-3">
                  {rounds.map((round: any, index: number) => (
                    <div key={round.id} className="p-4 bg-background/50 rounded-xl border border-border/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">Round {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeRound(round.id)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-foreground/80">Round Name</label>
                        <input
                          type="text"
                          value={round.roundName}
                          onChange={(e) => updateRound(round.id, 'roundName', e.target.value)}
                          className="w-full px-3 py-2 bg-background rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
                          placeholder="e.g., HR Telephonic, Technical Round 1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <label className="text-xs text-foreground/80">Date</label>
                          <input
                            type="date"
                            value={round.date}
                            onChange={(e) => updateRound(round.id, 'date', e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-foreground/80">Status</label>
                          <select
                            value={round.status}
                            onChange={(e) => updateRound(round.id, 'status', e.target.value as InterviewRoundStatus)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all text-sm"
                          >
                            <option value="pending">Result Pending</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="selected">Selected</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-foreground/80">Notes</label>
                        <textarea
                          value={round.notes}
                          onChange={(e) => updateRound(round.id, 'notes', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-background rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none resize-none transition-all text-sm"
                          placeholder="Notes about this round..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2 pt-4 border-t border-border/40">
              <label className="text-sm text-foreground/90">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none resize-none transition-all"
                placeholder="Any additional notes about this interview..."
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const titles = {
    application: editingEntry ? 'Edit Job Application' : 'Add Job Application',
    coldEmail: editingEntry ? 'Edit Cold Email' : 'Add Cold Email',
    linkedin: editingEntry ? 'Edit LinkedIn Outreach' : 'Add LinkedIn Outreach',
    content: editingEntry ? 'Edit Content' : 'Add Content',
    interview: editingEntry ? 'Edit Interview' : 'Add Interview',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6 z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-gradient-to-br from-card to-card/50 rounded-t-2xl sm:rounded-2xl border border-border/60 shadow-2xl w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border/40">
            <h3 className="text-base sm:text-lg font-semibold">{titles[type]}</h3>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(85vh-120px)] sm:max-h-[calc(90vh-140px)]">
          {renderForm() || <div className="text-center text-muted-foreground">Form not available</div>}

          {(type === 'application' || type === 'coldEmail') && (
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Resume (optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />
              {resumeFile ? (
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-border/60">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{resumeFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setResumeFile(null)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-background/50 rounded-xl border border-dashed border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all text-sm"
                >
                  <Upload className="w-4 h-4" strokeWidth={2.5} />
                  Upload Resume (PDF, DOC)
                </button>
              )}
            </div>
          )}

          {customFields.length > 0 && type !== 'content' && (
            <div className="pt-4 border-t border-border/40 space-y-4">
              <h4 className="text-sm text-muted-foreground">Custom Fields</h4>
              {customFields.map((field) => renderCustomField(field))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              {editingEntry ? (
                <>
                  <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                  Save Changes
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Add Entry
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-muted/50 text-muted-foreground rounded-xl hover:bg-muted transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
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
            <h3 className="text-lg font-semibold">Duplicate Entry Detected</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            An entry with similar details already exists. Do you want to continue adding this entry?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDuplicateWarning(false);
                setPendingSubmit(null);
              }}
              className="flex-1 px-4 py-2.5 bg-muted/50 text-muted-foreground rounded-xl hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (pendingSubmit) {
                  onAdd(pendingSubmit);
                }
                setShowDuplicateWarning(false);
                setPendingSubmit(null);
                onClose();
              }}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
