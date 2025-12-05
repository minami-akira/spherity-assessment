import { useState } from 'react';
import type { CreateCredentialPayload, FieldConfig } from '../types/credential';
import { CREDENTIAL_TEMPLATES } from '../types/credential';

interface CredentialFormProps {
  onSubmit: (payload: CreateCredentialPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CredentialForm({ onSubmit, onCancel, isLoading }: CredentialFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(CREDENTIAL_TEMPLATES[0]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [customType, setCustomType] = useState('');
  const [customFields, setCustomFields] = useState('');

  const handleTemplateChange = (templateType: string) => {
    const template = CREDENTIAL_TEMPLATES.find((t) => t.type === templateType);
    if (template) {
      setSelectedTemplate(template);
      setFormData({});
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let type: string;
    let claims: Record<string, unknown>;

    if (selectedTemplate.type === 'Custom') {
      type = customType || 'Custom';
      // Parse custom fields (key:value format, one per line)
      claims = customFields
        .split('\n')
        .filter((line) => line.includes(':'))
        .reduce((acc, line) => {
          const [key, ...valueParts] = line.split(':');
          acc[key.trim()] = valueParts.join(':').trim();
          return acc;
        }, {} as Record<string, string>);
    } else {
      type = selectedTemplate.type;
      claims = { ...formData };
    }

    await onSubmit({ type, claims });
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="input w-full cursor-pointer"
            required={field.required}
          >
            <option value="">Select {field.label}...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="input w-full cursor-pointer"
            required={field.required}
            min={new Date().toISOString().split('T')[0]}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="input w-full"
            required={field.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="input w-full"
            required={field.required}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="input w-full"
            required={field.required}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Issue New Credential</h2>
        <p className="text-sm text-slate-500 mt-1">
          Select a credential type and fill in the details
        </p>
      </div>

      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Credential Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CREDENTIAL_TEMPLATES.map((template) => (
            <button
              key={template.type}
              type="button"
              onClick={() => handleTemplateChange(template.type)}
              className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2 ${
                selectedTemplate.type === template.type
                  ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-xl">{template.icon}</span>
              <span className="font-medium">{template.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Fields based on Template */}
      {selectedTemplate.type === 'Custom' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Custom Type Name
            </label>
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="e.g., DriverLicense"
              className="input w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Claims (one per line, format: key: value)
            </label>
            <textarea
              value={customFields}
              onChange={(e) => setCustomFields(e.target.value)}
              placeholder={`name: John Doe\nlicenseNumber: ABC123\nexpiryDate: 2026-01-01`}
              className="textarea w-full h-32"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter each claim on a new line in the format: fieldName: value
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {selectedTemplate.fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Issuing...
            </span>
          ) : (
            '🎫 Issue Credential'
          )}
        </button>
      </div>
    </form>
  );
}
