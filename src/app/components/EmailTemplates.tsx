import { useState } from 'react';
import { Mail, Edit, Copy, Trash2, Plus, Eye, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { EmailTemplate } from '../utils/emailScheduler';

interface EmailTemplatesProps {
  templates: EmailTemplate[];
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  onTemplateCreate: (template: Omit<EmailTemplate, 'id'>) => void;
  onTemplateUpdate: (template: EmailTemplate) => void;
  onTemplateDelete: (templateId: string) => void;
}

export default function EmailTemplates({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
}: EmailTemplatesProps) {
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
  });

  const handleCreateTemplate = () => {
    if (formData.name && formData.subject && formData.body) {
      onTemplateCreate({
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        variables: extractVariables(formData.subject + formData.body),
      });
      setFormData({ name: '', subject: '', body: '' });
      setShowCreateForm(false);
    }
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate && formData.name && formData.subject && formData.body) {
      onTemplateUpdate({
        ...editingTemplate,
        name: formData.name,
        subject: formData.subject,
        body: formData.body,
        variables: extractVariables(formData.subject + formData.body),
      });
      setEditingTemplate(null);
      setFormData({ name: '', subject: '', body: '' });
    }
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    return matches ? [...new Set(matches.map(match => match.slice(2, -2)))] : [];
  };

  const startEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
    });
  };

  const duplicateTemplate = (template: EmailTemplate) => {
    onTemplateCreate({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      body: template.body,
      variables: template.variables,
    });
  };

  const previewWithVariables = (template: EmailTemplate) => {
    let subject = template.subject;
    let body = template.body;
    
    // Replace variables with sample data
    const sampleData = {
      name: 'John',
      company: 'Acme Corp',
      role: 'Software Engineer',
      days: '3',
    };
    
    Object.entries(sampleData).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return { subject, body };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage follow-up email templates
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg">Create New Template</h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                placeholder="e.g., Standard Follow-up"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
                placeholder="e.g., Following up - {{role}} at {{company}}"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {{variable}} for dynamic content (e.g., {{name}}, {{company}})
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Body</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none min-h-[200px] resize-y"
                placeholder="Hi {{name}},&#10;&#10;I hope you're doing well.&#10;&#10;I wanted to follow up on my application for the {{role}} position at {{company}}..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCreateTemplate}
                disabled={!formData.name || !formData.subject || !formData.body}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Create Template
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Form */}
      {editingTemplate && (
        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-lg">Edit Template</h4>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setFormData({ name: '', subject: '', body: '' });
              }}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Body</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none min-h-[200px] resize-y"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleUpdateTemplate}
                disabled={!formData.name || !formData.subject || !formData.body}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Update Template
              </button>
              <button
                onClick={() => {
                  setEditingTemplate(null);
                  setFormData({ name: '', subject: '', body: '' });
                }}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border rounded-xl p-4 transition-all cursor-pointer ${
              selectedTemplateId === template.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 bg-card'
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold truncate">{template.name}</h4>
                  {selectedTemplateId === template.id && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
                
                <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
                  {template.subject}
                </p>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.body}
                </p>
                
                {template.variables && template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.variables.map((variable) => (
                      <span
                        key={variable}
                        className="px-2 py-1 bg-muted text-xs rounded-md font-mono"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewTemplate(template);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateTemplate(template);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(template);
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this template?')) {
                      onTemplateDelete(template.id);
                    }
                  }}
                  className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">Template Preview</h4>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <div className="px-4 py-2 bg-muted rounded-lg">
                  {previewWithVariables(previewTemplate).subject}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Body</label>
                <div className="px-4 py-3 bg-muted rounded-lg whitespace-pre-wrap">
                  {previewWithVariables(previewTemplate).body}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Variables are replaced with sample data for preview</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}