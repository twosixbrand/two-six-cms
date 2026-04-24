import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiAlertTriangle, FiTrendingDown, FiPackage } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Button, LoadingSpinner } from '../../components/ui';
import * as reportsApi from '../../services/consignmentReportsApi';
import { logError } from '../../services/errorApi';
import { formatDate } from '../../utils/dateFormat';

type Tab = 'inventory' | 'losses' | 'pending';

const currencyCO = (n: number) =>
  (n ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const todayIso = () => new Date().toISOString().slice(0, 10);
const monthAgoIso = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

const ConsignmentReportsPage = () => {
  const [tab, setTab] = useState<Tab>('inventory');

  // Inventory tab
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loadingInv, setLoadingInv] = useState(false);

  // Losses tab
  const [lossFrom, setLossFrom] = useState(monthAgoIso());
  const [lossTo, setLossTo] = useState(todayIso());
  const [lossData, setLossData] = useState<any | null>(null);
  const [loadingLoss, setLoadingLoss] = useState(false);

  // Pending tab
  const [threshold, setThreshold] = useState(30);
  const [pendingData, setPendingData] = useState<any | null>(null);
  const [loadingPending, setLoadingPending] = useState(false);

  const loadInventory = async () => {
    try {
      setLoadingInv(true);
      const data = await reportsApi.getInventoryByCustomer();
      setInventoryData(data);
    } catch (err: any) {
      logError(err, '/consignment/reports/inventory');
    } finally {
      setLoadingInv(false);
    }
  };

  const loadLosses = async () => {
    try {
      setLoadingLoss(true);
      const data = await reportsApi.getLossReport(lossFrom, lossTo);
      setLossData(data);
    } catch (err: any) {
      logError(err, '/consignment/reports/losses');
    } finally {
      setLoadingLoss(false);
    }
  };

  const loadPending = async () => {
    try {
      setLoadingPending(true);
      const data = await reportsApi.getPendingReconciliation(threshold);
      setPendingData(data);
    } catch (err: any) {
      logError(err, '/consignment/reports/pending');
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    if (tab === 'inventory' && inventoryData.length === 0) loadInventory();
    if (tab === 'losses' && !lossData) loadLosses();
    if (tab === 'pending' && !pendingData) loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const tabButton = (key: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(key)}
      style={{
        padding: '0.6rem 1rem',
        background: tab === key ? '#f0b429' : 'transparent',
        color: tab === key ? '#1a202c' : '#a0aec0',
        border: 'none',
        borderBottom: tab === key ? '2px solid #f0b429' : '2px solid transparent',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="page-container">
      <PageHeader title="Reportes de Consignación" icon={<FiBarChart2 />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Estado de inventario por cliente, análisis de mermas/garantías y alertas de conciliación
      </p>

      <div style={{ display: 'flex', borderBottom: '1px solid #2a2a35', marginBottom: '1.5rem' }}>
        {tabButton('inventory', 'Inventario por Cliente', <FiPackage />)}
        {tabButton('losses', 'Mermas y Garantías', <FiTrendingDown />)}
        {tabButton('pending', 'Conciliación Pendiente', <FiAlertTriangle />)}
      </div>

      {/* === TAB: INVENTORY === */}
      {tab === 'inventory' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <Button variant="ghost" onClick={loadInventory}>Recargar</Button>
          </div>
          {loadingInv ? (
            <LoadingSpinner text="Cargando inventario..." />
          ) : inventoryData.length === 0 ? (
            <p style={{ color: '#a0aec0' }}>No hay clientes aliados con bodegas registradas.</p>
          ) : (
            inventoryData.map((c: any) => (
              <div
                key={c.id}
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: '#1a1a1f',
                  borderRadius: '8px',
                  border: '1px solid #2a2a35',
                }}
              >
                <h3 style={{ marginTop: 0, color: '#f0b429' }}>{c.name}</h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#a0aec0' }}>
                  {c.document_number && `NIT/CC: ${c.document_number} · `}
                  Sell-outs: {c.totals.sellout_orders} órdenes · {c.totals.sellout_units} u. ·{' '}
                  {currencyCO(c.totals.sellout_total_invoiced)}
                </p>

                <table style={{ width: '100%', marginTop: '0.75rem', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a35', color: '#a0aec0' }}>
                      <th style={{ textAlign: 'left', padding: '0.4rem' }}>Bodega</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Pendiente recep.</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>En consignación</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Despachado (hist.)</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Faltantes</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Sobrantes</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Pendientes</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Dev. portafolio</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Garantía</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Dev. post-venta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.warehouses.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ padding: '0.5rem', color: '#718096' }}>
                          Sin bodegas.
                        </td>
                      </tr>
                    ) : (
                      c.warehouses.map((w: any) => (
                        <tr key={w.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                          <td style={{ padding: '0.4rem' }}>
                            {w.name} {!w.is_active && <small style={{ color: '#718096' }}>(inactiva)</small>}
                          </td>
                          <td style={{ padding: '0.4rem', textAlign: 'right', color: '#fbbf24' }}>
                            {w.current_pending_reception}
                          </td>
                          <td style={{ padding: '0.4rem', textAlign: 'right', color: '#34d399' }}>
                            {w.current_in_consignment}
                          </td>
                          <td style={{ padding: '0.4rem', textAlign: 'right' }}>
                            {w.total_dispatched_received}
                          </td>
                          <td style={{ padding: '0.4rem', textAlign: 'right', color: w.reception_shortage > 0 ? '#f87171' : '#6b6b7b' }}>
                            {w.reception_shortage || 0}
                          </td>
                          <td style={{ padding: '0.4rem', textAlign: 'right', color: w.reception_surplus > 0 ? '#f0b429' : '#6b6b7b' }}>
                            {w.reception_surplus || 0}
                          </td>
                          <td style={{ padding: '0.4rem', textAlign: 'right' }}>
                            {w.reception_pending > 0 ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, borderRadius: '50%', fontSize: '0.7rem', fontWeight: 700, color: '#fff', background: '#dc2626' }}>
                                {w.reception_pending}
                              </span>
                            ) : (
                              <span style={{ color: '#6b6b7b' }}>0</span>
                            )}
                          </td>
                          <td style={{ padding: '0.4rem', textAlign: 'right' }}>{w.total_returned.PORTFOLIO}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'right' }}>{w.total_returned.WARRANTY}</td>
                          <td style={{ padding: '0.4rem', textAlign: 'right' }}>{w.total_returned.POST_SALE}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}

      {/* === TAB: LOSSES === */}
      {tab === 'losses' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0' }}>Desde</label>
              <input
                type="date"
                value={lossFrom}
                onChange={(e) => setLossFrom(e.target.value)}
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #2a2a35', background: '#1a1a1f', color: '#f1f1f3' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0' }}>Hasta</label>
              <input
                type="date"
                value={lossTo}
                onChange={(e) => setLossTo(e.target.value)}
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #2a2a35', background: '#1a1a1f', color: '#f1f1f3' }}
              />
            </div>
            <Button variant="primary" onClick={loadLosses}>Consultar</Button>
          </div>

          {loadingLoss ? (
            <LoadingSpinner text="Cargando..." />
          ) : !lossData ? (
            <p style={{ color: '#a0aec0' }}>Sin datos.</p>
          ) : (
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#1a1a1f', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                  <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Mermas facturadas</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0b429' }}>{lossData.summary.total_merma_orders}</div>
                  <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>{lossData.summary.total_merma_units} u.</div>
                </div>
                <div style={{ padding: '1rem', background: '#1a1a1f', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                  <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Monto merma</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0b429' }}>
                    {currencyCO(lossData.summary.total_merma_amount)}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: '#1a1a1f', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                  <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>Garantías procesadas</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0b429' }}>{lossData.summary.total_warranty_returns}</div>
                  <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>{lossData.summary.total_warranty_units} u.</div>
                </div>
              </div>

              <h4 style={{ color: '#f1f1f3' }}>Por cliente</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a35', color: '#a0aec0' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem' }}>Cliente</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem' }}>Mermas (ord.)</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem' }}>Mermas (u.)</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem' }}>Monto</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem' }}>Garantías (u.)</th>
                  </tr>
                </thead>
                <tbody>
                  {lossData.by_customer.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '0.5rem', color: '#718096' }}>Sin datos en el rango.</td></tr>
                  ) : (
                    lossData.by_customer.map((c: any) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                        <td style={{ padding: '0.4rem' }}>{c.name}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>{c.merma_orders}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>{c.merma_units}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>{currencyCO(c.merma_total)}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>{c.warranty_units}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <h4 style={{ color: '#f1f1f3' }}>Detalle mermas</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a35', color: '#a0aec0' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem' }}>Fecha</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem' }}>Orden</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem' }}>Cliente</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem' }}>Unid.</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lossData.merma_orders.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '0.5rem', color: '#718096' }}>Sin mermas.</td></tr>
                  ) : (
                    lossData.merma_orders.map((o: any) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                        <td style={{ padding: '0.4rem' }}>{formatDate(o.date)}</td>
                        <td style={{ padding: '0.4rem' }}>{o.order_reference}</td>
                        <td style={{ padding: '0.4rem' }}>{o.customer}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>{o.units}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>{currencyCO(o.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <h4 style={{ color: '#f1f1f3' }}>Detalle garantías</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a2a35', color: '#a0aec0' }}>
                    <th style={{ textAlign: 'left', padding: '0.4rem' }}>Fecha</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem' }}>Cliente / Bodega</th>
                    <th style={{ textAlign: 'right', padding: '0.4rem' }}>Unid.</th>
                    <th style={{ textAlign: 'left', padding: '0.4rem' }}>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {lossData.warranty_returns.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '0.5rem', color: '#718096' }}>Sin garantías.</td></tr>
                  ) : (
                    lossData.warranty_returns.map((r: any) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #2a2a35' }}>
                        <td style={{ padding: '0.4rem' }}>{r.date ? formatDate(r.date) : '—'}</td>
                        <td style={{ padding: '0.4rem' }}>{r.customer} / {r.warehouse}</td>
                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>{r.units}</td>
                        <td style={{ padding: '0.4rem', color: '#a0aec0' }}>{r.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* === TAB: PENDING === */}
      {tab === 'pending' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0' }}>Umbral (días)</label>
              <input
                type="number"
                min={1}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 30)}
                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #2a2a35', background: '#1a1a1f', color: '#f1f1f3', width: '100px' }}
              />
            </div>
            <Button variant="primary" onClick={loadPending}>Consultar</Button>
          </div>

          {loadingPending ? (
            <LoadingSpinner text="Cargando..." />
          ) : !pendingData ? (
            <p style={{ color: '#a0aec0' }}>Sin datos.</p>
          ) : (
            <>
              <p style={{ color: '#a0aec0', marginBottom: '1rem' }}>
                {pendingData.pending_count === 0
                  ? `Todas las bodegas activas tienen conteos al día (dentro de ${pendingData.threshold_days} días).`
                  : `${pendingData.pending_count} bodega(s) con conciliación pendiente (más de ${pendingData.threshold_days} días sin conteo aprobado).`}
              </p>

              {pendingData.warehouses.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a35', color: '#a0aec0' }}>
                      <th style={{ textAlign: 'left', padding: '0.4rem' }}>Cliente</th>
                      <th style={{ textAlign: 'left', padding: '0.4rem' }}>Bodega</th>
                      <th style={{ textAlign: 'left', padding: '0.4rem' }}>Último conteo</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Días</th>
                      <th style={{ textAlign: 'right', padding: '0.4rem' }}>Stock actual (u.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingData.warehouses.map((w: any) => (
                      <tr key={w.warehouse_id} style={{ borderBottom: '1px solid #2a2a35' }}>
                        <td style={{ padding: '0.4rem' }}>{w.customer_name}</td>
                        <td style={{ padding: '0.4rem' }}>{w.warehouse_name}</td>
                        <td style={{ padding: '0.4rem' }}>
                          {w.never_counted ? (
                            <span style={{ color: '#dc2626' }}>Nunca</span>
                          ) : (
                            formatDate(w.last_count_date)
                          )}
                        </td>
                        <td style={{ padding: '0.4rem', textAlign: 'right', color: w.days_since_last_count > 60 ? '#dc2626' : '#f0b429', fontWeight: 600 }}>
                          {w.days_since_last_count}
                        </td>
                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>{w.current_stock_units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsignmentReportsPage;
