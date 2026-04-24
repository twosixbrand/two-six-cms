import React, { useState, useEffect, useMemo } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, FormField, Button, LoadingSpinner } from '../components/ui';
import { getLogs } from '../services/errorLogApi';
import { logError } from '../services/errorApi';
import { formatDateTime } from '../utils/dateFormat';

const ErrorLogPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterApp, setFilterApp] = useState('');
  const [filterPage, setFilterPage] = useState('');

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const uniqueApps = useMemo(() => [...new Set(logs.map((log) => log.app).filter(Boolean))], [logs]);
  const uniquePages = useMemo(() => [...new Set(logs.map((log) => log.page).filter(Boolean))], [logs]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getLogs();
        setLogs(data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err: any) {
        setError('Error al cargar los logs.');
        logError(err, '/logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const appMatch = filterApp ? log.app === filterApp : true;
      const pageMatch = filterPage ? log.page === filterPage : true;
      return appMatch && pageMatch;
    });
  }, [logs, filterApp, filterPage]);

  const openDetail = (row: any) => {
    setSelectedLog(row);
    setShowDetailModal(true);
  };

  const columns = [
    { key: 'id', header: 'ID', width: '70px' },
    { key: 'app', header: 'App' },
    { key: 'page', header: 'Page' },
    {
      key: 'message',
      header: 'Mensaje',
      render: (value: any) => (
        <span style={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (value: any) => formatDateTime(value),
    },
  ];

  const appOptions = [{ value: '', label: 'Todas las Apps' }, ...uniqueApps.map((a) => ({ value: a, label: a }))];
  const pageOptions = [{ value: '', label: 'Todas las Paginas' }, ...uniquePages.map((p) => ({ value: p, label: p }))];

  return (
    <div className="page-container">
      <PageHeader title="Error Logs" icon={<FiAlertTriangle />} />

      {error && <p className="error-message">{error}</p>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 200 }}>
          <FormField
            label="Filtrar por App"
            name="filterApp"
            type="select"
            value={filterApp}
            onChange={(e: any) => setFilterApp(e.target.value)}
            options={appOptions}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <FormField
            label="Filtrar por Pagina"
            name="filterPage"
            type="select"
            value={filterPage}
            onChange={(e: any) => setFilterPage(e.target.value)}
            options={pageOptions}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando logs..." />
      ) : (
        <DataTable
          columns={columns}
          data={filteredLogs}
          emptyMessage="No se encontraron logs de error"
          onRowClick={openDetail}
        />
      )}

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title={`Error Log #${selectedLog?.id || ''}`} size="lg">
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>App</span>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{selectedLog.app || 'N/A'}</p>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Page</span>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{selectedLog.page || 'N/A'}</p>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Fecha</span>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{formatDateTime(selectedLog.createdAt)}</p>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Mensaje</span>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', lineHeight: 1.5 }}>{selectedLog.message}</p>
            </div>
            {selectedLog.stack && (
              <div>
                <span style={{ fontSize: '0.75rem', color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Stack Trace</span>
                <pre style={{
                  margin: '0.25rem 0 0', padding: '1rem', borderRadius: 8,
                  background: 'rgba(0,0,0,0.03)', fontSize: '0.75rem', overflow: 'auto',
                  maxHeight: 300, fontFamily: 'monospace', lineHeight: 1.6,
                  border: '1px solid #2a2a35',
                }}>
                  {selectedLog.stack}
                </pre>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <Button variant="ghost" onClick={() => setShowDetailModal(false)}>Cerrar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ErrorLogPage;
