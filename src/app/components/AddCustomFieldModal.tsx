import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { CustomField } from '../App';

interface AddCustomFieldModalProps {
  onClose: () => void;
  onAdd: (field: CustomField, applyToAll: boolean) => void;
}

export default function AddCustomFieldModal({ onClose, onAdd }: AddCustomFieldModalProps) {
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<CustomField['type']>('text');
  const [required, setRequired] = useState(false);
  const [applyToAll, setApplyToAll] = useState(false);
  const [options, setOptions] = useState<string[]>(['']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const field: CustomField = {
      id: Date.now().toString(),
      name: fieldName,
      type: fieldType,
      required,
      options: fieldType === 'select' ? options.filter(o => o.trim()) : undefined,
    };

    onAdd(field, applyToAll);
    onClose();
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
      <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border/60 shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <h3 className="text-lg">Add Custom Field</h3>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-foreground/90">
              Field Name <span className="text-[#00b4d8]">*</span>
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
              placeholder="e.g., Interview Date, Salary Range"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-foreground/90">Field Type</label>
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as CustomField['type'])}
              className="w-full px-4 py-2.5 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all"
            >
              <option value="text">Text</option>
              <option value="textarea">Text Area</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Dropdown</option>
            </select>
          </div>

          {fieldType === 'select' && (
            <div className="space-y-2">
              <label className="text-sm text-foreground/90">Options</label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-background/50 rounded-lg border border-border/60 focus:ring-2 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]/50 outline-none transition-all text-sm"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-dashed border-border transition-all text-sm"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Add Option
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/40">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 rounded border-border/60 text-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/50 cursor-pointer"
            />
            <label htmlFor="required" className="text-sm text-foreground/90 cursor-pointer flex-1">
              Make this field required
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#00b4d8]/5 rounded-lg border border-[#00b4d8]/20">
            <input
              type="checkbox"
              id="applyToAll"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
              className="w-4 h-4 rounded border-border/60 text-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/50 cursor-pointer"
            />
            <label htmlFor="applyToAll" className="text-sm text-foreground/90 cursor-pointer flex-1">
              Apply this field to all existing entries
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00b4d8] to-[#0096c7] text-white rounded-xl hover:shadow-lg hover:shadow-[#00b4d8]/25 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Field
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
