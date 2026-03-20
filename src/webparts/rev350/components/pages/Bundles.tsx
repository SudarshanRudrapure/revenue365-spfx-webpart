/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import DataTable, { ColumnDef } from '../shared/DataTable';
import { getItems, saveItem, updateItem, deleteItem, addAttachment } from '../services/SharePointService';
import styles from '../Rev350.module.scss';

const COLUMNS: ColumnDef[] = [
  { key: 'Title',       label: 'Name' },
  { key: 'BundlesID',   label: 'Bundles ID' },
  { key: 'Items',       label: 'Items' },
  { key: 'HSN_SAC',     label: 'HSN/SAC' },
  { key: 'Description', label: 'Description' },
];

const generateID = (prefix: string, existingItems: any[], idField: string): string => {
  const nums = existingItems.map(i => parseInt((i[idField] || '').split('-')[1])).filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `${prefix}-${max + 1}`;
};

const Bundles: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen]       = React.useState(false);
  const [items, setItems]                   = React.useState<any[]>([]);
  const [isLoading, setIsLoading]           = React.useState(false);
  const [isSaving, setIsSaving]             = React.useState(false);
  const [generatedID, setGeneratedID]       = React.useState('');
  const [selectedItems, setSelectedItems]   = React.useState('');
  const [isEditing, setIsEditing]           = React.useState(false);
  const [editItemId, setEditItemId]         = React.useState<number>(0);
  const [bundleName, setBundleName]         = React.useState('');
  const [bundleDesc, setBundleDesc]         = React.useState('');
  const [bundleHSN, setBundleHSN]           = React.useState('');
  const [showInactive, setShowInactive]     = React.useState(false);
  const [selectedFile, setSelectedFile]     = React.useState<File | undefined>(undefined);
  // BUG FIX: dropdown was always open — controlled by state now
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const fileInputRef                        = React.useRef<HTMLInputElement>(null);

  const [products, setProducts]           = React.useState<any[]>([]);
  const [services, setServices]           = React.useState<any[]>([]);
  const [subscriptions, setSubscriptions] = React.useState<any[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    setItems(await getItems('Bundle', showInactive));
    setIsLoading(false);
  };

  const loadDropdownData = async () => {
    setProducts(await getItems('Product'));
    setServices(await getItems('Service'));
    setSubscriptions(await getItems('Subscription'));
  };

  React.useEffect(() => { loadData(); loadDropdownData(); }, [showInactive]);

  const clearForm = () => {
    setBundleName(''); setBundleDesc(''); setBundleHSN('');
    setSelectedItems(''); setIsEditing(false); setEditItemId(0);
    setSelectedFile(undefined); setIsDropdownOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (row: Record<string, any>) => {
    setBundleName(row.Title || ''); setBundleDesc(row.Description || '');
    setBundleHSN(row.HSN_SAC || ''); setSelectedItems(row.Items || '');
    setEditItemId(row.Id); setIsEditing(true);
    setIsPanelOpen(true); setIsDropdownOpen(false);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteItem(id);
    if (success) { await loadData(); } else { alert('Failed to delete. Please try again.'); }
  };

  const handleSave = async () => {
    if (!bundleName) { alert('Please fill in: Name'); return; }
    if (!selectedItems) { alert('Please select at least one item'); return; }
    setIsSaving(true);

    const itemData = { Title: bundleName, Description: bundleDesc, HSN_SAC: bundleHSN, Items: selectedItems, Types: 'Bundle' };

    if (isEditing) {
      const success = await updateItem(editItemId, itemData);
      if (success) {
        if (selectedFile) await addAttachment(editItemId, selectedFile);
        setIsPanelOpen(false); clearForm(); await loadData();
      } else { alert('Failed to update. Please try again.'); }
    } else {
      const newId = await saveItem({ ...itemData, BundlesID: generatedID, Status: 'Active', CreatedDate: new Date().toISOString() });
      if (newId !== null) {
        if (selectedFile) await addAttachment(newId, selectedFile);
        setIsPanelOpen(false); clearForm(); await loadData();
      } else { alert('Failed to save. Please try again.'); }
    }
    setIsSaving(false);
  };

  const handleToggle = (itemName: string) => {
    const current = selectedItems ? selectedItems.split(',').map(i => i.trim()) : [];
    const index = current.indexOf(itemName);
    if (index !== -1) { current.splice(index, 1); } else { current.push(itemName); }
    setSelectedItems(current.join(', '));
  };

  const isSelected = (itemName: string): boolean =>
    !!selectedItems && selectedItems.split(',').map(i => i.trim()).includes(itemName);

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #e5e7eb', borderRadius: '4px',
    padding: '8px 12px', fontSize: '13px', boxSizing: 'border-box',
  };

  return (
    <>
      <h1 style={{ padding: '0 24px', marginBottom: 0, color: '#7f1d1d' }}>Bundles</h1>

      <DataTable
        columns={COLUMNS} data={items} isLoading={isLoading}
        onAdd={() => { setGeneratedID(generateID('BUN', items, 'BundlesID')); clearForm(); setIsPanelOpen(true); }}
        onEdit={handleEdit} onDelete={handleDelete}
        showInactiveLabel="Show Inactive Bundles"
        onShowInactive={() => setShowInactive(prev => !prev)}
        showInactive={showInactive}
      />

      {isPanelOpen && (
        <>
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', zIndex: 100 }}
            onClick={() => { setIsPanelOpen(false); clearForm(); }}
          />
          <div style={{ position: 'fixed', top: 0, right: 0, width: '420px', height: '100%', background: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.15)', fontFamily: 'Segoe UI, sans-serif' }}>

            {/* Header */}
            <div style={{ background: '#7f1d1d', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px' }}>{isEditing ? '✏️ Edit Bundle' : 'Add Bundle'}</h2>
              <button onClick={() => { setIsPanelOpen(false); clearForm(); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: 5 }}>Name <span style={{ color: '#b91c1c' }}>*</span></label>
                <input style={inputStyle} placeholder="Enter Name" value={bundleName} onChange={e => setBundleName(e.target.value)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: 5 }}>Bundles ID</label>
                <input style={{ ...inputStyle, background: '#f9fafb', color: '#4b5563' }} value={isEditing ? (items.find(i => i.Id === editItemId)?.BundlesID || '') : generatedID} readOnly />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: 5 }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Enter Description" value={bundleDesc} onChange={e => setBundleDesc(e.target.value)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: 5 }}>HSN/SAC</label>
                <input style={inputStyle} placeholder="Enter HSN/SAC" value={bundleHSN} onChange={e => setBundleHSN(e.target.value)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: 5 }}>Bundle Items <span style={{ color: '#b91c1c' }}>*</span></label>
                <div className={styles.bundleSelectWrapper}>
                  {/* BUG FIX: trigger now toggles dropdown */}
                  <div className={styles.bundleSelectTrigger} onClick={() => setIsDropdownOpen(prev => !prev)}>
                    {selectedItems
                      ? <span style={{ fontSize: '12px', flex: 1 }}>{selectedItems}</span>
                      : <span className={styles.bundleSelectPlaceholder}>Select items...</span>
                    }
                    <span className={`${styles.bundleSelectArrow} ${isDropdownOpen ? styles.open : ''}`}>▼</span>
                  </div>

                  {/* BUG FIX: only renders when open */}
                  {isDropdownOpen && (
                    <div className={styles.bundleSelectDropdown}>
                      {products.length > 0 && (<>
                        <div className={styles.bundleSelectGroup}>PRODUCTS</div>
                        {products.map((p: any) => (
                          <div key={p.Id} className={styles.bundleSelectItem} onClick={() => handleToggle(p.Title)}>
                            <input type="checkbox" checked={isSelected(p.Title)} onChange={() => handleToggle(p.Title)} onClick={e => e.stopPropagation()} />
                            <span>{p.Title}</span>
                          </div>
                        ))}
                      </>)}
                      {services.length > 0 && (<>
                        <div className={styles.bundleSelectGroup}>SERVICES</div>
                        {services.map((s: any) => (
                          <div key={s.Id} className={styles.bundleSelectItem} onClick={() => handleToggle(s.Title)}>
                            <input type="checkbox" checked={isSelected(s.Title)} onChange={() => handleToggle(s.Title)} onClick={e => e.stopPropagation()} />
                            <span>{s.Title}</span>
                          </div>
                        ))}
                      </>)}
                      {subscriptions.length > 0 && (<>
                        <div className={styles.bundleSelectGroup}>SUBSCRIPTIONS</div>
                        {subscriptions.map((sub: any) => (
                          <div key={sub.Id} className={styles.bundleSelectItem} onClick={() => handleToggle(sub.Title)}>
                            <input type="checkbox" checked={isSelected(sub.Title)} onChange={() => handleToggle(sub.Title)} onClick={e => e.stopPropagation()} />
                            <span>{sub.Title}</span>
                          </div>
                        ))}
                      </>)}
                      {products.length === 0 && services.length === 0 && subscriptions.length === 0 && (
                        <div className={styles.bundleSelectEmpty}>No items found. Add Products, Services or Subscriptions first!</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* BUG FIX: file input wired up */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '13px', marginBottom: 5 }}>Attachment 📎</label>
                <input ref={fileInputRef} type="file" style={{ width: '100%', fontSize: '13px' }} onChange={e => setSelectedFile(e.target.files?.[0])} />
                {selectedFile && <span style={{ fontSize: '12px', color: '#4b5563', marginTop: 4, display: 'block' }}>Selected: {selectedFile.name}</span>}
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 12 }}>
              <button disabled={isSaving} style={{ background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 4, padding: '9px 24px', fontSize: 14, fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }} onClick={handleSave}>
                {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
              </button>
              <button style={{ background: '#fff', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: 4, padding: '9px 24px', fontSize: 14, cursor: 'pointer' }} onClick={() => { setIsPanelOpen(false); clearForm(); }}>
                Cancel
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
};

export default Bundles;