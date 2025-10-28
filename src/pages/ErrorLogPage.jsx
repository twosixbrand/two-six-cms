import React, { useState, useEffect, useMemo } from 'react';
import { getLogs } from '../services/errorLogApi';
import { logError } from '../services/errorApi';
import '../styles/ErrorLogPage.css';

const ErrorLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterApp, setFilterApp] = useState('');
  const [filterPage, setFilterPage] = useState('');

  const uniqueApps = useMemo(() => [...new Set(logs.map(log => log.app).filter(Boolean))], [logs]);
  const uniquePages = useMemo(() => [...new Set(logs.map(log => log.page).filter(Boolean))], [logs]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getLogs();
        setLogs(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setError('');
      } catch (err) {
        setError('Failed to fetch error logs.');
        logError(err, '/logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const appMatch = filterApp ? log.app === filterApp : true;
      const pageMatch = filterPage ? log.page === filterPage : true;
      return appMatch && pageMatch;
    });
  }, [logs, filterApp, filterPage]);

  return (
    <div className="page-container">
      <h1>Error Logs</h1>

      <div className="log-filters">
        <select value={filterApp} onChange={(e) => setFilterApp(e.target.value)}>
          <option value="">All Apps</option>
          {uniqueApps.map(app => (
            <option key={app} value={app}>{app}</option>
          ))}
        </select>

        <select value={filterPage} onChange={(e) => setFilterPage(e.target.value)}>
          <option value="">All Pages</option>
          {uniquePages.map(page => (
            <option key={page} value={page}>{page}</option>
          ))}
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <div className="logs-list">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="log-item">
                <div className="log-header">
                  <span className="log-app-page">
                    {log.app && `App: ${log.app}`} {log.page && `| Page: ${log.page}`}
                  </span>
                  <span className="log-timestamp">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="log-message">{log.message}</p>
                <pre className="log-stack">{log.stack}</pre>
              </div>
            ))
          ) : (
            <p>No error logs found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorLogPage;