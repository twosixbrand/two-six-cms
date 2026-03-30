import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  loading?: boolean;
  actions?: (row: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  loading = false,
  actions,
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <LoadingSpinner size="md" text="Cargando datos..." />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  const allColumns = actions
    ? [...columns, { key: '__actions__', header: 'Acciones', align: 'center' as const }]
    : columns;

  const thStyle = (col: Column | { key: string; header: string; align?: string }): React.CSSProperties => ({
    padding: '0.65rem 1rem',
    textAlign: (col.align as any) || 'left',
    fontSize: '0.7rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
    backgroundColor: '#1f1f2a',
    width: (col as Column).width || undefined,
  });

  const tdStyle = (col: Column | { key: string; header: string; align?: string }, rowIdx: number): React.CSSProperties => ({
    padding: '0.65rem 1rem',
    textAlign: (col.align as any) || 'left',
    fontSize: '0.8125rem',
    color: '#f1f1f3',
    fontFamily: 'Inter, sans-serif',
    borderBottom: '1px solid #1f1f2a',
    backgroundColor: hoveredRow === rowIdx ? 'rgba(255, 255, 255, 0.03)' : '#1a1a24',
    transition: 'background-color 0.1s ease',
  });

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: 8,
        backgroundColor: '#1a1a24',
        border: '1px solid #2a2a35',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: 500,
        }}
      >
        <thead>
          <tr>
            {allColumns.map((col) => (
              <th key={col.key} style={thStyle(col)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onMouseEnter={() => setHoveredRow(rowIdx)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
              }}
            >
              {columns.map((col) => (
                <td key={col.key} style={tdStyle(col, rowIdx)}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td style={{ ...tdStyle({ key: '__actions__', header: '', align: 'center' }, rowIdx) }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
