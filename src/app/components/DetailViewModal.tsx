import { useState } from 'react';
import { format } from 'date-fns';
import { X, Edit2, Save, Plus, Trash2 } from 'lucide-react';
import type { JobApplication, ColdEmail, LinkedInOutreach, CustomField } from '../App';
import AddCustomFieldModal from './AddCustomFieldModal';

interface DetailViewModalProps {
  type: 'application' | 'coldEmail' | 'linkedin';
  entry: JobApplication | ColdEmail | LinkedInOutreach;
  customFields: CustomField[];
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
  onAddCustomField: (field: CustomField, applyToAll: boolean) => void;
}

export default function DetailViewModal({
  type,
  entry,
  customFields,
  onClose,
  onUpdate,
  onAddCustomField,
}: DetailViewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...entry,
    customFields: entry.customFields || {},
  });
  const [showAddField, setShowAddField] = useState(false);

  const handleSave = () => {
    onUpdate(entry.id, formData);
    setIsEditing(false);
  };

  const renderField = (label: string, value: any, field: string, fieldType: string = 'text', required: boolean = false) => {
    if (isEditing) {
      const editValue = (formData as any)[field] ?? '';
      return (
        <div className="space-y-2">
          <label className="text-sm text-foreground/90">
            {label} {required && <span className="text-[var(--primary)]">*</span>}
          </label>
          {fieldType === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]/50 outline-none transition-all resize-none"
            />
          ) : (
            <input
              type={fieldType}
              value={editValue}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]/50 outline-none transition-all"
              required={required}
            />
          )}
        </div>
      );
    }

    if (!value) return null;

    return (
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    );
  };

  const renderCustomField = (field: CustomField) => {
    const value = formData.customFields?.[field.id];

    if (isEditing) {
      return (
        <div key={field.id} className="space-y-2">
          <label className="text-sm text-foreground/90">
            {field.name} {field.required && <span className="text-[var(--primary)]">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              value={value || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customFields: { ...formData.customFields, [field.id]: e.target.value },
                })
              }
              rows={4}
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]/50 outline-none transition-all resize-none"
              required={field.required}
            />
          ) : field.type === 'select' ? (
            <select
              value={value || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customFields: { ...formData.customFields, [field.id]: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]/50 outline-none transition-all"
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customFields: { ...formData.customFields, [field.id]: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]/50 outline-none transition-all"
              required={field.required}
            />
          )}
        </div>
      );
    }

    if (!value) return null;

    return (
      <div key={field.id} className="space-y-1">
        <p className="text-xs text-muted-foreground">{field.name}</p>
        <p className="text-sm">{value}</p>
      </div>
    );
  };

  const renderFields = () => {
    switch (type) {
      case 'application':
        const app = entry as JobApplication;
        return (
          <>
            {renderField('Date', format(new Date(app.date), 'MMMM dd, yyyy'), 'date', 'date', true)}
            {renderField('Company', app.company, 'company', 'text', true)}
            {renderField('Role', app.role, 'role', 'text')}
            {renderField('Source', app.source, 'source', 'text')}
            {renderField('Location', app.location, 'location', 'text')}
            {renderField('Job URL', app.jobUrl, 'jobUrl', 'url')}
            {renderField('Job ID', app.jobId, 'jobId', 'text')}
            {renderField('Referrer Name', app.referrerName, 'referrerName', 'text')}
            {renderField('Referrer Role', app.referrerRole, 'referrerRole', 'text')}
            {!isEditing && app.resumeName && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Resume</p>
                <p className="text-sm">{app.resumeName}</p>
              </div>
            )}
            {isEditing ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                  <input
                    type="checkbox"
                    id="rejected-edit"
                    checked={(formData as JobApplication).isRejected || false}
                    onChange={(e) => setFormData({ ...formData, isRejected: e.target.checked })}
                    className="w-4 h-4 rounded border-border/60 text-red-500 focus:ring-2 focus:ring-red-500/50 cursor-pointer"
                  />
                  <label htmlFor="rejected-edit" className="text-sm text-foreground/90 cursor-pointer flex-1">
                    Rejected
                  </label>
                </div>
                <div className="flex items-center gap-3 p-4 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
                  <input
                    type="checkbox"
                    id="alumni-edit"
                    checked={(formData as JobApplication).isGreatLakesAlumni || false}
                    onChange={(e) => setFormData({ ...formData, isGreatLakesAlumni: e.target.checked })}
                    className="w-4 h-4 rounded border-border/60 text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer"
                  />
                  <label htmlFor="alumni-edit" className="text-sm text-foreground/90 cursor-pointer flex-1">
                    Great Lakes Alumni
                  </label>
                </div>
              </>
            ) : app.isRejected ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-xs font-medium">
                  Rejected
                </span>
              </div>
            ) : app.isGreatLakesAlumni ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Alumni Status</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded text-xs">
                  Great Lakes Alumni
                </span>
              </div>
            ) : null}
            {isEditing ? (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-foreground/90">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: '', label: 'No Tag', icon: '—' },
                    { value: 'need_to_mail', label: 'Need to Mail', icon: '📧' },
                    { value: 'already_mailed', label: 'Already Mailed', icon: '✅' },
                    { value: 'ghost', label: 'Ghost', icon: '👻' },
                  ].map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, emailTag: tag.value })}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        ((formData as any).emailTag || '') === tag.value
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
            ) : app.emailTag ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tags</p>
                {app.emailTag === 'need_to_mail' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded text-xs font-medium">
                    📧 Need to Mail
                  </span>
                )}
                {app.emailTag === 'already_mailed' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-xs font-medium">
                    ✅ Already Mailed
                  </span>
                )}
                {app.emailTag === 'ghost' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded text-xs font-medium">
                    👻 Ghost
                  </span>
                )}
              </div>
            ) : null}
          </>
        );

      case 'coldEmail':
        const email = entry as ColdEmail;
        return (
          <>
            {renderField('Date', format(new Date(email.date), 'MMMM dd, yyyy'), 'date', 'date', true)}
            {renderField('Company', email.company, 'company', 'text', true)}
            {renderField('Email', email.email, 'email', 'email')}
            {renderField('Role', email.role, 'role', 'text')}
            {!isEditing && email.resumeName && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Resume</p>
                <p className="text-sm">{email.resumeName}</p>
              </div>
            )}
            {isEditing ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
                  <input
                    type="checkbox"
                    id="followUp-edit"
                    checked={(formData as ColdEmail).isFollowUp || false}
                    onChange={(e) => setFormData({ ...formData, isFollowUp: e.target.checked })}
                    className="w-4 h-4 rounded border-border/60 text-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/50 cursor-pointer"
                  />
                  <label htmlFor="followUp-edit" className="text-sm text-foreground/90 cursor-pointer flex-1">
                    This is a follow-up email
                  </label>
                </div>
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <input
                    type="checkbox"
                    id="gotResponse-edit"
                    checked={(formData as ColdEmail).gotResponse || false}
                    onChange={(e) => setFormData({ ...formData, gotResponse: e.target.checked })}
                    className="w-4 h-4 rounded border-border/60 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                  />
                  <label htmlFor="gotResponse-edit" className="text-sm text-foreground/90 cursor-pointer flex-1">
                    Got Response
                  </label>
                </div>
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <input
                    type="checkbox"
                    id="followUpDone-edit"
                    checked={(formData as ColdEmail).followUpDone || false}
                    onChange={(e) => setFormData({ ...formData, followUpDone: e.target.checked })}
                    className="w-4 h-4 rounded border-border/60 text-amber-500 focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                  />
                  <label htmlFor="followUpDone-edit" className="text-sm text-foreground/90 cursor-pointer flex-1">
                    Follow-up Done
                  </label>
                </div>
              </>
            ) : (
              <>
                {email.isFollowUp && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs">
                      Follow-up Email
                    </span>
                  </div>
                )}
                {email.gotResponse && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Response</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-xs">
                      Received Response
                    </span>
                  </div>
                )}
                {email.followUpDone && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Follow-up</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-xs">
                      Follow-up Completed
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        );

      case 'linkedin':
        const linkedin = entry as LinkedInOutreach;
        return (
          <>
            {renderField('Date', format(new Date(linkedin.date), 'MMMM dd, yyyy'), 'date', 'date', true)}
            {renderField('Name', linkedin.name, 'name', 'text')}
            {renderField('Role', linkedin.role, 'role', 'text')}
            {renderField('Company', linkedin.company, 'company', 'text')}
            {renderField('LinkedIn URL', linkedin.linkedinUrl, 'linkedinUrl', 'url')}
            {isEditing ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                  <input
                    type="checkbox"
                    id="isAlumni-edit"
                    checked={(formData as LinkedInOutreach).isAlumni || false}
                    onChange={(e) => setFormData({ ...formData, isAlumni: e.target.checked })}
                    className="w-4 h-4 rounded border-border/60 text-purple-500 focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                  />
                  <label htmlFor="isAlumni-edit" className="text-sm text-foreground/90 cursor-pointer flex-1">
                    Alumni Connection
                  </label>
                </div>
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <input
                    type="checkbox"
                    id="gotResponse-edit-linkedin"
                    checked={(formData as LinkedInOutreach).gotResponse || false}
                    onChange={(e) => setFormData({ ...formData, gotResponse: e.target.checked })}
                    className="w-4 h-4 rounded border-border/60 text-emerald-500 focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                  />
                  <label htmlFor="gotResponse-edit-linkedin" className="text-sm text-foreground/90 cursor-pointer flex-1">
                    Got Response
                  </label>
                </div>
              </>
            ) : (
              <>
                {linkedin.isAlumni && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Connection Type</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded text-xs">
                      Alumni
                    </span>
                  </div>
                )}
                {linkedin.gotResponse && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Response</p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-xs">
                      Received Response
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        );
    }
  };

  const titles = {
    application: 'Job Application Details',
    coldEmail: 'Cold Email Details',
    linkedin: 'LinkedIn Outreach Details',
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6 z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-gradient-to-br from-card to-card/50 rounded-t-2xl sm:rounded-2xl border border-border/60 shadow-2xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-border/40">
            <h3 className="text-base sm:text-lg font-semibold">{titles[type]}</h3>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:shadow-lg hover:shadow-[var(--primary)]/25 transition-all text-sm"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={2.5} />
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all text-sm"
                >
                  <Save className="w-4 h-4" strokeWidth={2.5} />
                  Save
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFields()}
            </div>

            {customFields.length > 0 && (
              <div className="pt-4 border-t border-border/40">
                <h4 className="text-sm mb-4">Custom Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFields.map((field) => renderCustomField(field))}
                </div>
              </div>
            )}

            {isEditing && (
              <button
                onClick={() => setShowAddField(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl border border-dashed border-border transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Add Custom Field
              </button>
            )}
          </div>
        </div>
      </div>

      {showAddField && (
        <AddCustomFieldModal
          onClose={() => setShowAddField(false)}
          onAdd={onAddCustomField}
        />
      )}
    </>
  );
}
