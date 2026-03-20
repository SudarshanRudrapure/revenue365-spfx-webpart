/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import {
  Panel, PanelType, TextField, Dropdown, IDropdownOption,
  PrimaryButton, DefaultButton, Stack, Label,
} from '@fluentui/react';

export interface FieldDef {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
  placeholder?: string;
  readOnly?: boolean;
}

interface AddPanelProps {
  title: string;
  fields: FieldDef[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string>, file?: File) => void; // BUG FIX: file param added
  isSaving?: boolean;
  defaultValues?: Record<string, any>;
  isEditing?: boolean;
}

const AddPanel: React.FC<AddPanelProps> = ({
  title, fields, isOpen, onClose, onSave, isSaving, defaultValues, isEditing = false,
}) => {
  const [formData, setFormData]       = React.useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = React.useState<File | undefined>(undefined);
  const fileInputRef                    = React.useRef<HTMLInputElement>(null);

  // BUG FIX: defaultValues added to deps — was missing, causing stale form on re-open
  React.useEffect(() => {
    if (isOpen) {
      const filled: Record<string, string> = {};
      fields.forEach(f => {
        filled[f.key] = defaultValues ? String(defaultValues[f.key] ?? '') : '';
      });
      setFormData(filled);
      setSelectedFile(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setFormData({});
      setSelectedFile(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, defaultValues]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const missing = fields.filter(f => f.required && !formData[f.key]);
    if (missing.length > 0) {
      alert(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    onSave(formData, selectedFile); // BUG FIX: pass file to parent
  };

  const onRenderFooterContent = () => (
    <Stack horizontal tokens={{ childrenGap: 10 }}>
      <PrimaryButton
        text={isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
        onClick={handleSave}
        disabled={isSaving}
        styles={{
          root: { backgroundColor: '#7f1d1d', borderColor: '#7f1d1d' },
          rootHovered: { backgroundColor: '#b91c1c', borderColor: '#b91c1c' },
        }}
      />
      <DefaultButton text="Cancel" onClick={onClose} disabled={isSaving} />
    </Stack>
  );

  return (
    <Panel
      isOpen={isOpen}
      onDismiss={onClose}
      type={PanelType.medium}
      headerText={title}
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom={true}
      styles={{ headerText: { color: '#7f1d1d', fontSize: '16px', fontWeight: 600 } }}
    >
      <Stack tokens={{ childrenGap: 16 }} style={{ padding: '20px 0' }}>

        {fields.map(field => (
          <Stack.Item key={field.key}>
            {field.type === 'select' ? (
              <Dropdown
                label={field.label}
                required={field.required}
                selectedKey={formData[field.key] || ''}
                options={(field.options || []).map(opt => ({ key: opt, text: opt } as IDropdownOption))}
                onChange={(_, option) => { if (option) handleChange(field.key, option.key as string); }}
                placeholder={`Select ${field.label}`}
                disabled={field.readOnly}
              />
            ) : field.type === 'textarea' ? (
              <TextField
                label={field.label}
                required={field.required}
                multiline rows={3}
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={formData[field.key] || ''}
                onChange={(_, val) => handleChange(field.key, val || '')}
                readOnly={field.readOnly}
              />
            ) : (
              <TextField
                label={field.label}
                required={field.required}
                type={field.type === 'number' ? 'number' : 'text'}
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={formData[field.key] || ''}
                onChange={(_, val) => handleChange(field.key, val || '')}
                readOnly={field.readOnly}
                styles={field.readOnly ? { field: { backgroundColor: '#f9fafb', color: '#4b5563' } } : {}}
              />
            )}
          </Stack.Item>
        ))}

        {/* BUG FIX: file input is now wired to state and passed on save */}
        <Stack.Item>
          <Label>Attachment 📎</Label>
          <input
            ref={fileInputRef}
            type="file"
            style={{ width: '100%', fontSize: '13px' }}
            onChange={e => setSelectedFile(e.target.files?.[0])}
          />
          {selectedFile && (
            <span style={{ fontSize: '12px', color: '#4b5563', marginTop: 4, display: 'block' }}>
              Selected: {selectedFile.name}
            </span>
          )}
        </Stack.Item>

      </Stack>
    </Panel>
  );
};

export default AddPanel;