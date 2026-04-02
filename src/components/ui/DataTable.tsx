import React, { useState, useMemo } from 'react';
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
  pageSize?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  loading = false,
  actions,
  pageSize = 15,
}) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  // Reset to page 1 when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div>
      <div
        style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: totalPages > 1 ? '8px 8px 0 0' : 8,
          backgroundColor: '#1a1a24',
          border: '1px solid #2a2a35',
          borderBottom: totalPages > 1 ? 'none' : '1px solid #2a2a35',
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
            {paginatedData.map((row, rowIdx) => (
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 1rem',
            backgroundColor: '#1f1f2a',
            borderRadius: '0 0 8px 8px',
            border: '1px solid #2a2a35',
            borderTop: '1px solid #2a2a35',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ color: '#6b6b7b' }}>
            {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, data.length)} de {data.length}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 6,
                border: '1px solid #2a2a35',
                backgroundColor: 'transparent',
                color: currentPage === 1 ? '#3a3a45' : '#a0a0b0',
                cursor: currentPage === 1 ? 'default' : 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ←
            </button>

            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span key={`dot-${idx}`} style={{ color: '#6b6b7b', padding: '0 0.25rem' }}>…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  style={{
                    padding: '0.3rem 0.55rem',
                    borderRadius: 6,
                    border: currentPage === page ? '1px solid #f0b429' : '1px solid #2a2a35',
                    backgroundColor: currentPage === page ? 'rgba(240, 180, 41, 0.15)' : 'transparent',
                    color: currentPage === page ? '#f0b429' : '#a0a0b0',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: currentPage === page ? 600 : 400,
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: 6,
                border: '1px solid #2a2a35',
                backgroundColor: 'transparent',
                color: currentPage === totalPages ? '#3a3a45' : '#a0a0b0',
                cursor: currentPage === totalPages ? 'default' : 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
