import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { CustomField } from '../App';

interface QuickAddModalProps {
  type: 'application' | 'coldEmail' | 'linkedin' | 'content';
  customFields?: CustomField[];
  onClose: () => void;
  onAdd: (data: any) => void;
}

export default function QuickAddModal({ type, customFields = [], onClose, onAdd }: QuickAddModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customFieldsData, setCustomFieldsData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...formData, customFields: customFieldsData });
  };

  const renderCustomField = (field: CustomField) => {
    const value = customFieldsData[field.id];

    return (
      <div key={field.id} className="space-y-2">
        <label className="text-sm text-foreground/90">
          {field.name} {field.required && <span className="text-[#00b4d8]">*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            value={value || ''}
            onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all resize-none"
            required={field.required}
          />
        ) : field.type === 'select' ? (
          <select
            value={value || ''}
            onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
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
            onChange={(e) => setCustomFieldsData({ ...customFieldsData, [field.id]: e.target.value })}
            className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
            required={field.required}
          />
        )}
      </div>
    );
  };

  const renderForm = () => {
    switch (type) {
      case 'application':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Company Name <span className="text-[#00b4d8]">*</span>
              </label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="e.g., Google"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Source</label>
              <input
                type="text"
                value={formData.source || ''}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="e.g., LinkedIn, Naukri, Indeed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="e.g., Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Location</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="e.g., Bangalore, Remote"
              />
            </div>
          </>
        );

      case 'coldEmail':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Company <span className="text-[#00b4d8]">*</span>
              </label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="e.g., Google"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="recruiter@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="e.g., Senior Backend Engineer"
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <input
                type="checkbox"
                id="followUp"
                checked={formData.isFollowUp === 'true'}
                onChange={(e) => setFormData({ ...formData, isFollowUp: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 rounded border-border/60 text-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/50 cursor-pointer"
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
              <label className="text-sm text-foreground/90">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="Contact name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Role</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="e.g., Hiring Manager"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Company</label>
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="Company name"
              />
            </div>
          </>
        );

      case 'content':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Title <span className="text-[#00b4d8]">*</span>
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
                placeholder="e.g., Software Engineer Cold Email Template"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Type</label>
              <select
                value={formData.type || 'Cold Email'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
              >
                <option value="Cold Email">Cold Email</option>
                <option value="LinkedIn Message">LinkedIn Message</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">
                Content <span className="text-[#00b4d8]">*</span>
              </label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none resize-none transition-all"
                placeholder="Paste your email template or message here..."
                required
              />
            </div>
          </>
        );
    }
  };

  const titles = {
    application: 'Add Job Application',
    coldEmail: 'Add Cold Email',
    linkedin: 'Add LinkedIn Outreach',
    content: 'Add Content',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border/60 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <h3 className="text-lg">{titles[type]}</h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderForm()}

          {customFields.length > 0 && type !== 'content' && (
            <div className="pt-4 border-t border-border/40 space-y-4">
              <h4 className="text-sm text-muted-foreground">Custom Fields</h4>
              {customFields.map((field) => renderCustomField(field))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00b4d8] to-[#0096c7] text-white rounded-xl hover:shadow-lg hover:shadow-[#00b4d8]/25 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Entry
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
  );
}
