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
    padding: '0.85rem 1rem',
    textAlign: (col.align as any) || 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-secondary, #475569)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
    width: (col as Column).width || undefined,
  });

  const tdStyle = (col: Column | { key: string; header: string; align?: string }, rowIdx: number): React.CSSProperties => ({
    padding: '0.85rem 1rem',
    textAlign: (col.align as any) || 'left',
    fontSize: '0.875rem',
    color: 'var(--text-primary, #1e293b)',
    fontFamily: 'Inter, sans-serif',
    borderBottom: '1px solid rgba(0, 0, 0, 0.03)',
    backgroundColor:
      hoveredRow === rowIdx
        ? 'rgba(212, 175, 55, 0.06)'
        : rowIdx % 2 === 1
          ? 'rgba(0, 0, 0, 0.015)'
          : 'transparent',
    transition: 'background-color 0.15s ease',
  });

  return (
    <div
      style={{
        overflowX: 'auto',
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.8)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
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
                transition: 'background-color 0.15s ease',
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
