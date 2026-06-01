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
            {label} {required && <span className="text-[#00b4d8]">*</span>}
          </label>
          {fieldType === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all resize-none"
            />
          ) : (
            <input
              type={fieldType}
              value={editValue}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
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
            {field.name} {field.required && <span className="text-[#00b4d8]">*</span>}
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
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all resize-none"
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
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
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
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
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
            {isEditing && (
              <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
                <input
                  type="checkbox"
                  id="followUp-edit"
                  checked={(formData as ColdEmail).isFollowUp || false}
                  onChange={(e) => setFormData({ ...formData, isFollowUp: e.target.checked })}
                  className="w-4 h-4 rounded border-border/60 text-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/50 cursor-pointer"
                />
                <label htmlFor="followUp-edit" className="text-sm text-foreground/90 cursor-pointer flex-1">
                  This is a follow-up email
                </label>
              </div>
            )}
            {!isEditing && email.isFollowUp && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Type</p>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs">
                  Follow-up Email
                </span>
              </div>
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
        <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border/60 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
            <h3 className="text-lg">{titles[type]}</h3>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00b4d8] text-white rounded-lg hover:shadow-lg hover:shadow-[#00b4d8]/25 transition-all text-sm"
                >
                  <Edit2 className="w-4 h-4" strokeWidth={2.5} />
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:shadow-lg transition-all text-sm"
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
