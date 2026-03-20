/* eslint-disable no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-unused-expressions */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react';
// import {
//   DetailsList,
//   DetailsListLayoutMode,
//   IColumn,
//   SelectionMode,
//   Spinner,
//   SpinnerSize,
//   SearchBox,
//   Stack,
//   IconButton,
//   IIconProps,
// } from '@fluentui/react';
// import styles from '../Rev350.module.scss';

// export interface ColumnDef {
//   key: string;
//   label: string;
// }

// interface DataTableProps {
//   columns: ColumnDef[];
//   data: Record<string, any>[];
//   onAdd: () => void;
//   isLoading?: boolean;
//   onEdit?: (row: Record<string, any>) => void;
//   onDelete?: (id: number) => void;
//   showInactiveLabel?: string;
//   onShowInactive?: () => void;   // BUG FIX: was missing entirely
//   showInactive?: boolean;
//   addButtonText?: string;
// }

// const editIcon: IIconProps   = { iconName: 'Edit' };
// const deleteIcon: IIconProps = { iconName: 'Delete' };
// const PAGE_SIZE_OPTIONS      = [10, 25, 50];

// const DataTable: React.FC<DataTableProps> = ({
//   columns,
//   data,
//   onAdd,
//   isLoading,
//   onEdit,
//   onDelete,
//   showInactiveLabel,
//   onShowInactive,
//   showInactive = false,
//   addButtonText = '+ Add',
// }) => {
//   const [searchText, setSearchText] = React.useState('');
//   // BUG FIX: pagination was fully non-functional — now wired up
//   const [currentPage, setCurrentPage] = React.useState(1);
//   const [pageSize, setPageSize]       = React.useState(10);

//   React.useEffect(() => { setCurrentPage(1); }, [searchText, data.length]);

//   const filteredData = data.filter(row =>
//     columns.some(col =>
//       String(row[col.key] || '').toLowerCase().includes(searchText.toLowerCase())
//     )
//   );

//   const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
//   const startIndex = (currentPage - 1) * pageSize;
//   const pagedData  = filteredData.slice(startIndex, startIndex + pageSize);

//   const detailsColumns: IColumn[] = [
//     ...columns.map(col => ({
//       key: col.key,
//       name: col.label,
//       fieldName: col.key,
//       minWidth: 80,
//       maxWidth: 200,
//       isResizable: true,
//       onRender: (item: any) => (
//         <span title={String(item[col.key] || '')}>{item[col.key] || '-'}</span>
//       ),
//     })),
//     {
//       key: 'actions',
//       name: 'Actions',
//       fieldName: 'actions',
//       minWidth: 80,
//       maxWidth: 80,
//       onRender: (item: any) => (
//         <Stack horizontal tokens={{ childrenGap: 4 }}>
//           <IconButton
//             iconProps={editIcon}
//             title="Edit"
//             onClick={() => onEdit && onEdit(item)}
//             styles={{ root: { color: '#1d4ed8' }, rootHovered: { backgroundColor: '#eff6ff' } }}
//           />
//           <IconButton
//             iconProps={deleteIcon}
//             title="Delete"
//             onClick={() => {
//               if (window.confirm('Are you sure you want to delete this item?')) {
//                 onDelete && onDelete(item.Id);
//               }
//             }}
//             styles={{ root: { color: '#dc2626' }, rootHovered: { backgroundColor: '#fef2f2' } }}
//           />
//         </Stack>
//       ),
//     },
//   ];

//   return (
//     <div className={styles.pageWrapper}>

//       <div className={styles.actionBar}>
//         <button
//           style={{
//             background: '#7f1d1d', color: '#fff', border: 'none',
//             borderRadius: '4px', padding: '8px 16px', fontSize: '13px',
//             fontWeight: 600, cursor: 'pointer',
//           }}
//           onClick={onAdd}
//         >
//           {addButtonText}
//         </button>

//         {/* BUG FIX: Show Inactive button now calls onShowInactive and reflects state
//         {showInactiveLabel && (
//           <button
//             style={{
//               background: showInactive ? '#7f1d1d' : '#fff',
//               color: showInactive ? '#fff' : '#7f1d1d',
//               border: '1px solid #7f1d1d', borderRadius: '4px',
//               padding: '7px 14px', fontSize: '13px', cursor: 'pointer',
//               transition: 'all 0.15s',
//             }}
//             onClick={onShowInactive}
//           >
//             👁️ {showInactiveLabel}
//           </button>
//         )} */}

//         <div className={styles.actionBarRight}>
//           <SearchBox
//             placeholder="Search..."
//             value={searchText}
//             onChange={(_, val) => setSearchText(val || '')}
//             styles={{ root: { width: 220 } }}
//           />
//         </div>
//       </div>

//       <div className={styles.tableContainer}>
//         {isLoading ? (
//           <div className={styles.loadingWrapper}>
//             <Spinner size={SpinnerSize.medium} label="Loading..." />
//           </div>
//         ) : pagedData.length === 0 ? (
//           <div className={styles.noData}>
//             {searchText ? 'No results match your search.' : 'No Data Available'}
//           </div>
//         ) : (
//           <DetailsList
//             items={pagedData}
//             columns={detailsColumns}
//             layoutMode={DetailsListLayoutMode.justified}
//             selectionMode={SelectionMode.none}
//             isHeaderVisible={true}
//           />
//         )}
//       </div>

//       {/* BUG FIX: pagination fully functional */}
//       <div className={styles.tableFooter}>
//         <span>
//           {filteredData.length === 0
//             ? '0 items'
//             : `${startIndex + 1}–${Math.min(startIndex + pageSize, filteredData.length)} of ${filteredData.length}`}
//         </span>
//         <div className={styles.pagination}>
//           <span>Rows per page</span>
//           <select
//             value={pageSize}
//             onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
//           >
//             {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
//           </select>
//           <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
//           <span>{currentPage} / {totalPages}</span>
//           <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default DataTable;


/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Spinner,
  SpinnerSize,
  SearchBox,
  Stack,
  IconButton,
  IIconProps,
} from '@fluentui/react';
import styles from '../Rev350.module.scss';

export interface ColumnDef {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: ColumnDef[];
  data: Record<string, any>[];
  onAdd: () => void;
  isLoading?: boolean;
  onEdit?: (row: Record<string, any>) => void;
  onDelete?: (id: number) => void;
  showInactiveLabel?: string;
  onShowInactive?: () => void;
  showInactive?: boolean;
  addButtonText?: string;
  exportFileName?: string;  // ← NEW
}

const editIcon: IIconProps   = { iconName: 'Edit' };
const deleteIcon: IIconProps = { iconName: 'Delete' };
const PAGE_SIZE_OPTIONS      = [10, 25, 50];

// ── EXPORT TO CSV FUNCTION ────────────────────────────
const exportToCSV = (
  columns: ColumnDef[],
  data: Record<string, any>[],
  fileName: string
): void => {
  if (data.length === 0) {
    alert('No data to export!');
    return;
  }

  const headers = columns.map(col => `"${col.label}"`).join(',');

  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '""';
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  const BOM        = '\uFEFF';
  const blob       = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url        = URL.createObjectURL(blob);
  const link       = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log(`✅ Exported ${data.length} rows to ${fileName}.csv`);
};

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onAdd,
  isLoading,
  onEdit,
  onDelete,
  showInactiveLabel,
  onShowInactive,
  showInactive   = false,
  addButtonText  = '+ Add',
  exportFileName = 'Export',
}) => {
  const [searchText, setSearchText] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize]       = React.useState(10);

  React.useEffect(() => { setCurrentPage(1); }, [searchText, data.length]);

  const filteredData = data.filter(row =>
    columns.some(col =>
      String(row[col.key] || '').toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData  = filteredData.slice(startIndex, startIndex + pageSize);

  const detailsColumns: IColumn[] = [
    ...columns.map(col => ({
      key:         col.key,
      name:        col.label,
      fieldName:   col.key,
      minWidth:    80,
      maxWidth:    200,
      isResizable: true,
      onRender:    (item: any) => (
        <span title={String(item[col.key] || '')}>{item[col.key] || '-'}</span>
      ),
    })),
    {
      key:       'actions',
      name:      'Actions',
      fieldName: 'actions',
      minWidth:  80,
      maxWidth:  80,
      onRender:  (item: any) => (
        <Stack horizontal tokens={{ childrenGap: 4 }}>
          <IconButton
            iconProps={editIcon}
            title="Edit"
            onClick={() => onEdit && onEdit(item)}
            styles={{
              root:        { color: '#1d4ed8' },
              rootHovered: { backgroundColor: '#eff6ff' },
            }}
          />
          <IconButton
            iconProps={deleteIcon}
            title="Delete"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                onDelete && onDelete(item.Id);
              }
            }}
            styles={{
              root:        { color: '#dc2626' },
              rootHovered: { backgroundColor: '#fef2f2' },
            }}
          />
        </Stack>
      ),
    },
  ];

  return (
    <div className={styles.pageWrapper}>

      {/* ── ACTION BAR ── */}
      <div className={styles.actionBar}>

        {/* Add Button */}
        <button
          style={{
            background:   '#7f1d1d',
            color:        '#fff',
            border:       'none',
            borderRadius: '4px',
            padding:      '8px 16px',
            fontSize:     '13px',
            fontWeight:   600,
            cursor:       'pointer',
          }}
          onClick={onAdd}
        >
          {addButtonText}
        </button>

        {/* Show Inactive Button
        {showInactiveLabel && (
          <button
            style={{
              background:   showInactive ? '#7f1d1d' : '#fff',
              color:        showInactive ? '#fff' : '#7f1d1d',
              border:       '1px solid #7f1d1d',
              borderRadius: '4px',
              padding:      '7px 14px',
              fontSize:     '13px',
              cursor:       'pointer',
              transition:   'all 0.15s',
            }}
            onClick={onShowInactive}
          >
             {showInactiveLabel}
          </button>
        )} */}


        {/* Search — pushed to right */}
        <div className={styles.actionBarRight}>
          <SearchBox
            placeholder="Search..."
            value={searchText}
            onChange={(_, val) => setSearchText(val || '')}
            styles={{ root: { width: 220 } }}
          />
        </div>



        {/* ── EXPORT BUTTON ── */}
        <button
          style={{
            background:   '#fff',
            color:        '#166534',
            border:       '1px solid #166534',
            borderRadius: '4px',
            padding:      '7px 14px',
            fontSize:     '13px',
            cursor:       filteredData.length === 0 ? 'not-allowed' : 'pointer',
            opacity:      filteredData.length === 0 ? 0.5 : 1,
            display:      'flex',
            alignItems:   'center',
            gap:          '5px',
            transition:   'all 0.15s',
          }}
          onClick={() => exportToCSV(columns, filteredData, exportFileName)}
          disabled={filteredData.length === 0}
          title={`Export ${filteredData.length} rows to CSV`}
        >
          📥 Export
        </button>

        

      </div>

      {/* ── TABLE ── */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <Spinner size={SpinnerSize.medium} label="Loading..." />
          </div>
        ) : pagedData.length === 0 ? (
          <div className={styles.noData}>
            {searchText ? 'No results match your search.' : 'No Data Available'}
          </div>
        ) : (
          <DetailsList
            items={pagedData}
            columns={detailsColumns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            isHeaderVisible={true}
          />
        )}
      </div>

      {/* ── FOOTER PAGINATION ── */}
      <div className={styles.tableFooter}>
        <span>
          {filteredData.length === 0
            ? '0 items'
            : `${startIndex + 1}–${Math.min(startIndex + pageSize, filteredData.length)} of ${filteredData.length}`}
        </span>
        <div className={styles.pagination}>
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {PAGE_SIZE_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >‹</button>
          <span>{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >›</button>
        </div>
      </div>

    </div>
  );
};

export default DataTable;