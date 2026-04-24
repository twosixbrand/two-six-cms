import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiClock, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';
import { formatDate } from '../../utils/dateFormat';


const cardStyle: React.CSSProperties = {
  padding: '1rem',
  background: '#1a1a24',
  border: '1px solid #2a2a35',
  borderRadius: '8px',
  marginBottom: '1rem',
};

const headerStyle: React.CSSProperties = {
  margin: 0,
  marginBottom: '0.5rem',
  fontSize: '1rem',
  color: '#f0b429',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.85rem',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.4rem',
  color: '#a0a0b0',
  borderBottom: '1px solid #2a2a35',
};

const tdStyle: React.CSSProperties = {
  padding: '0.4rem',
  borderBottom: '1px solid #2a2a35',
  color: '#f1f1f3',
};

const AccountingAlertsPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = async () => {
    try {
      setLoading(true);
      const result = await accountingApi.getAccountingAlerts();
      setData(result);
      setError('');
    } catch (err: any) {
      logError(err, '/accounting/alerts');
      setError('Error al cargar alertas contables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  if (loading) return <LoadingSpinner text="Cargando alertas contables..." />;
  if (error) return <p className="error-message">{error}</p>;
  if (!data) return null;

  const summary = data.summary || {};
  const cards = [
    { key: 'stale_drafts', label: 'Asientos en borrador', icon: <FiClock />, color: '#f0b429' },
    { key: 'invalid_movements', label: 'Movimientos inválidos', icon: <FiAlertCircle />, color: '#dc2626' },
    { key: 'orphan_accounts', label: 'Cuentas huérfanas', icon: <FiAlertTriangle />, color: '#dc2626' },
    { key: 'idle_accounts', label: 'Cuentas sin movimiento', icon: <FiClock />, color: '#a0a0b0' },
    { key: 'unclosed_periods', label: 'Períodos sin cerrar', icon: <FiAlertCircle />, color: '#dc2626' },
    { key: 'unbilled_orders', label: 'Órdenes sin facturar DIAN', icon: <FiAlertCircle />, color: '#f0b429' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Alertas Contables" icon={<FiAlertTriangle />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Visibilidad operativa de problemas y vencimientos fiscales
      </p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {cards.map((c) => (
          <div key={c.key} style={{ ...cardStyle, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: c.color, marginBottom: '0.5rem' }}>
              {c.icon}
              <span style={{ fontSize: '0.8rem' }}>{c.label}</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: summary[c.key] > 0 ? c.color : '#34d399' }}>
              {summary[c.key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Próximos vencimientos */}
      <div style={cardStyle}>
        <h3 style={headerStyle}>
          <FiCalendar /> Próximos vencimientos fiscales
        </h3>
        {data.fiscal_deadlines.length === 0 ? (
          <p style={{ color: '#a0aec0' }}>Sin vencimientos en los próximos 14 días.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Concepto</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Días</th>
              </tr>
            </thead>
            <tbody>
              {data.fiscal_deadlines.map((d: any, i: number) => (
                <tr key={i}>
                  <td style={tdStyle}>{d.name}</td>
                  <td style={tdStyle}>{formatDate()}</td>
                  <td style={{ ...tdStyle, color: d.days_left <= 3 ? '#dc2626' : '#f0b429', fontWeight: 600 }}>
                    {d.days_left}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Asientos en borrador stale */}
      {data.stale_drafts.length > 0 && (
        <div style={cardStyle}>
          <h3 style={headerStyle}><FiClock /> Asientos en borrador (más de 7 días)</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Asiento</th>
                <th style={thStyle}>Descripción</th>
                <th style={thStyle}>Origen</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Creado</th>
              </tr>
            </thead>
            <tbody>
              {data.stale_drafts.map((e: any) => (
                <tr key={e.id}>
                  <td style={tdStyle}>{e.entry_number}</td>
                  <td style={tdStyle}>{e.description}</td>
                  <td style={tdStyle}>{e.source_type}</td>
                  <td style={tdStyle}>{e.total_debit?.toLocaleString('es-CO')}</td>
                  <td style={tdStyle}>{formatDate()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Movimientos inválidos */}
      {data.invalid_movements.length > 0 && (
        <div style={cardStyle}>
          <h3 style={headerStyle}><FiAlertCircle /> Movimientos sobre cuentas mayores (inválidos)</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Asiento</th>
                <th style={thStyle}>Cuenta</th>
                <th style={thStyle}>Débito</th>
                <th style={thStyle}>Crédito</th>
              </tr>
            </thead>
            <tbody>
              {data.invalid_movements.map((m: any) => (
                <tr key={m.line_id}>
                  <td style={tdStyle}>{m.entry_number}</td>
                  <td style={tdStyle}>{m.account_code} - {m.account_name}</td>
                  <td style={tdStyle}>{m.debit?.toLocaleString('es-CO')}</td>
                  <td style={tdStyle}>{m.credit?.toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Períodos sin cerrar */}
      {data.unclosed_periods.length > 0 && (
        <div style={cardStyle}>
          <h3 style={headerStyle}><FiAlertCircle /> Períodos sin cerrar</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Período</th>
                <th style={thStyle}>Días vencido</th>
              </tr>
            </thead>
            <tbody>
              {data.unclosed_periods.map((p: any, i: number) => (
                <tr key={i}>
                  <td style={tdStyle}>{p.year}-{String(p.month).padStart(2, '0')}</td>
                  <td style={{ ...tdStyle, color: '#dc2626', fontWeight: 600 }}>{p.days_overdue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Órdenes sin facturar */}
      {data.unbilled_orders.length > 0 && (
        <div style={cardStyle}>
          <h3 style={headerStyle}><FiAlertCircle /> Órdenes pagadas sin factura DIAN</h3>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Orden</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Creada</th>
              </tr>
            </thead>
            <tbody>
              {data.unbilled_orders.map((o: any) => (
                <tr key={o.id}>
                  <td style={tdStyle}>{o.order_reference || `#${o.id}`}</td>
                  <td style={tdStyle}>{o.status}</td>
                  <td style={tdStyle}>{o.total_payment?.toLocaleString('es-CO')}</td>
                  <td style={tdStyle}>{formatDate()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cuentas huérfanas */}
      {data.orphan_accounts.length > 0 && (
        <div style={cardStyle}>
          <h3 style={headerStyle}><FiAlertTriangle /> Cuentas PUC huérfanas</h3>
          <p style={{ color: '#a0aec0', fontSize: '0.85rem' }}>
            Cuentas que apuntan a un parent_code inexistente.
          </p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Código</th>
                <th style={thStyle}>Nombre</th>
                <th style={thStyle}>Padre faltante</th>
              </tr>
            </thead>
            <tbody>
              {data.orphan_accounts.map((a: any) => (
                <tr key={a.id}>
                  <td style={tdStyle}>{a.code}</td>
                  <td style={tdStyle}>{a.name}</td>
                  <td style={{ ...tdStyle, color: '#dc2626' }}>{a.parent_code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountingAlertsPage;
