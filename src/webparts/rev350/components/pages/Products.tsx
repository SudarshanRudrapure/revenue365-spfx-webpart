/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import DataTable, { ColumnDef } from '../shared/DataTable';
import AddPanel, { FieldDef } from '../shared/AddPanel';
import { getItems, saveItem, updateItem, deleteItem, addAttachment } from '../services/SharePointService';

const COLUMNS: ColumnDef[] = [
  { key: 'Title',       label: 'Name' },
  { key: 'ProductID',   label: 'Products ID' },
  { key: 'Category',    label: 'Category' },
  { key: 'Price',       label: 'Price' },
  { key: 'HSN_SAC',     label: 'HSN/SAC' },
  { key: 'Description', label: 'Description' },
];

const FORM_FIELDS: FieldDef[] = [
  { key: 'Title',       label: 'Name',        required: true },
  { key: 'ProductID',   label: 'Products ID', required: true, readOnly: true },
  { key: 'Category',    label: 'Category',    type: 'select', options: ['HR365', 'APPS365', 'CIVIC365'] },
  { key: 'Description', label: 'Description', type: 'textarea' },
  { key: 'HSN_SAC',     label: 'HSN/SAC' },
  { key: 'Price',       label: 'Price',       required: true, type: 'number' },
];

// Fixed: uses max existing ID number instead of array length to avoid duplicates after deletion
const generateID = (prefix: string, existingItems: any[], idField: string): string => {
  const nums = existingItems
    .map(i => parseInt((i[idField] || '').split('-')[1]))
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `${prefix}-${max + 1}`;
};

const Products: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen]   = React.useState(false);
  const [items, setItems]               = React.useState<any[]>([]);
  const [isLoading, setIsLoading]       = React.useState(false);
  const [isSaving, setIsSaving]         = React.useState(false);
  const [generatedID, setGeneratedID]   = React.useState('');
  const [isEditing, setIsEditing]       = React.useState(false);
  const [editItemId, setEditItemId]     = React.useState<number>(0);
  const [showInactive, setShowInactive] = React.useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getItems('Product', showInactive);
    setItems(data);
    setIsLoading(false);
  };

  React.useEffect(() => { loadData(); }, [showInactive]);

  const handleEdit = (row: Record<string, any>) => {
    setIsEditing(true);
    setEditItemId(row.Id);
    setIsPanelOpen(true);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteItem(id);
    if (success) {
      await loadData();
    } else {
      alert('Failed to delete. Please try again.');
    }
  };

  const handleSave = async (formData: Record<string, string>, file?: File) => {
    setIsSaving(true);

    if (isEditing) {
      const success = await updateItem(editItemId, {
        ...formData,
        Types: 'Product',
      });
      if (success) {
        if (file) await addAttachment(editItemId, file);
        setIsPanelOpen(false);
        setIsEditing(false);
        setEditItemId(0);
        await loadData();
      } else {
        alert('Failed to update. Please try again.');
      }
    } else {
      const newId = await saveItem({
        ...formData,
        Types: 'Product',
        // No Status, no CreatedDate — keep payload minimal to avoid field-not-found errors
      });
      if (newId !== null) {
        if (file) await addAttachment(newId, file);
        setIsPanelOpen(false);
        await loadData();
      } else {
        alert('Failed to save. Please try again.');
      }
    }

    setIsSaving(false);
  };

  return (
    <>
      <h1 style={{ padding: '0 24px', marginBottom: 0, color: '#7f1d1d' }}>
        Products
      </h1>

      <DataTable
        columns={COLUMNS}
        data={items}
        isLoading={isLoading}
        onAdd={() => {
          setIsEditing(false);
          setGeneratedID(generateID('PRO', items, 'ProductID'));
          setIsPanelOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showInactiveLabel="Show Inactive Products"
        onShowInactive={() => setShowInactive(prev => !prev)}
        showInactive={showInactive}
      />

      <AddPanel
        title={isEditing ? 'Edit Product' : 'Add Products'}
        fields={FORM_FIELDS}
        isOpen={isPanelOpen}
        isEditing={isEditing}
        onClose={() => {
          setIsPanelOpen(false);
          setIsEditing(false);
          setEditItemId(0);
        }}
        onSave={handleSave}
        isSaving={isSaving}
        defaultValues={
          isEditing
            ? items.find(i => i.Id === editItemId) || {}
            : { ProductID: generatedID }
        }
      />
    </>
  );
};

export default Products;