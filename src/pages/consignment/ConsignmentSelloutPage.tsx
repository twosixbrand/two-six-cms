import React, { useState, useEffect, useMemo } from 'react';
import { FiUpload, FiFileText, FiCheck, FiZap } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { Button, LoadingSpinner } from '../../components/ui';
import * as selloutApi from '../../services/consignmentSelloutApi';
import type { SelloutRow } from '../../services/consignmentSelloutApi';
import * as warehouseApi from '../../services/consignmentWarehouseApi';
import { getCustomers } from '../../services/customerApi';
import { logError } from '../../services/errorApi';

interface Customer {
  id: number;
  name: string;
  is_consignment_ally?: boolean;
}

const SAMPLE_CSV = `sku,reference,color,size,quantity
,CAM-001,Azul,M,3
,CAM-001,Negro,L,2
`;

const currencyCO = (n: number) =>
  (n ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const ConsignmentSelloutPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [idCustomer, setIdCustomer] = useState<string>('');
  const [idWarehouse, setIdWarehouse] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [csvText, setCsvText] = useState('');
  const [rows, setRows] = useState<SelloutRow[]>([]);

  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [cs, whs] = await Promise.all([getCustomers(), warehouseApi.getWarehouses()]);
      setCustomers(cs);
      setWarehouses(whs);
      setError('');
    } catch (err: any) {
      logError(err, '/consignment/sellout');
      setError('Error al cargar datos iniciales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const allyCustomers = useMemo(
    () => customers.filter((c) => c.is_consignment_ally),
    [customers],
  );

  const warehousesForCustomer = useMemo(
    () => warehouses.filter((w) => idCustomer && String(w.id_customer) === idCustomer && w.is_active),
    [warehouses, idCustomer],
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    const parsed = selloutApi.parseSelloutCsv(text);
    setRows(parsed);
    setPreview(null);
    setResult(null);
  };

  const handleCsvTextChange = (text: string) => {
    setCsvText(text);
    const parsed = selloutApi.parseSelloutCsv(text);
    setRows(parsed);
    setPreview(null);
    setResult(null);
  };

  const loadSample = () => {
    setCsvText(SAMPLE_CSV);
    setRows(selloutApi.parseSelloutCsv(SAMPLE_CSV));
    setPreview(null);
    setResult(null);
  };

  const handlePreview = async () => {
    if (!idCustomer || !idWarehouse) {
      await Swal.fire({ title: 'Faltan datos', text: 'Selecciona cliente y bodega.', icon: 'warning', confirmButtonColor: '#f0b429' });
      return;
    }
    if (rows.length === 0) {
      await Swal.fire({ title: 'Sin datos', text: 'Carga un CSV o pega filas.', icon: 'warning', confirmButtonColor: '#f0b429' });
      return;
    }
    try {
      setPreviewing(true);
      setResult(null);
      const data = await selloutApi.previewSellout({
        id_customer: Number(idCustomer),
        id_warehouse: Number(idWarehouse),
        rows,
      });
      setPreview(data);
    } catch (err: any) {
      logError(err, '/consignment/sellout/preview');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setPreviewing(false);
    }
  };

  const handleProcess = async () => {
    if (!preview) return;
    if (preview.summary.error_count > 0) {
      await Swal.fire({
        title: 'Hay errores',
        text: `Corrige las ${preview.summary.error_count} filas con error antes de procesar.`,
        icon: 'warning',
        confirmButtonColor: '#f0b429',
      });
      return;
    }
    const result = await Swal.fire({
      title: '¿Procesar y facturar?',
      html: `Se creará la orden sell-out, descontará ${preview.summary.ok_count} ítems del stock en consignación y se generará la factura DIAN.<br/><strong>Total: ${currencyCO(preview.summary.total)}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f0b429',
      cancelButtonColor: '#2a2a35',
      confirmButtonText: 'Sí, procesar y facturar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;

    try {
      setProcessing(true);

      // 1. Procesar sell-out → crea la orden + descuenta stock
      const order = await selloutApi.processSellout({
        id_customer: Number(idCustomer),
        id_warehouse: Number(idWarehouse),
        rows,
        notes,
      });

      // 2. Disparar DIAN sobre la orden recién creada
      let dianResult: any = null;
      let dianError: string | null = null;
      try {
        dianResult = await selloutApi.generateDianForOrder(order.id);
      } catch (err: any) {
        dianError = err.message || 'Error al generar DIAN';
      }

      setResult({ order, dian: dianResult, dianError });

      await Swal.fire({
        title: dianError ? 'Orden creada (DIAN pendiente)' : '¡Facturado!',
        html: dianError
          ? `Orden <strong>${order.order_reference}</strong> creada, pero DIAN falló:<br/><code>${dianError}</code><br/>Puedes reintentar desde la pantalla de DIAN.`
          : `Orden <strong>${order.order_reference}</strong> y factura DIAN <strong>${dianResult?.cufe ? dianResult.cufe.slice(0, 12) + '...' : 'generada'}</strong>.`,
        icon: dianError ? 'warning' : 'success',
        confirmButtonColor: '#f0b429',
      });
    } catch (err: any) {
      logError(err, '/consignment/sellout/process');
      await Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonColor: '#f0b429' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando..." />;

  return (
    <div className="page-container">
      <PageHeader title="Procesar Sell-out" icon={<FiFileText />} />
      <p style={{ marginTop: '-0.75rem', marginBottom: '1rem', color: '#a0aec0', fontSize: '0.9rem' }}>
        Cargue de ventas reportadas por el aliado, descuento de stock y facturación DIAN (F08)
      </p>

      {error && <p className="error-message">{error}</p>}

      {/* Paso 1: selección */}
      <section style={{ padding: '1rem', background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: '8px', marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>1. Cliente y bodega</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Cliente aliado *
            </label>
            <select
              value={idCustomer}
              onChange={(e) => {
                setIdCustomer(e.target.value);
                setIdWarehouse('');
                setPreview(null);
                setResult(null);
              }}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
            >
              <option value="">Selecciona...</option>
              {allyCustomers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Bodega *
            </label>
            <select
              value={idWarehouse}
              onChange={(e) => {
                setIdWarehouse(e.target.value);
                setPreview(null);
                setResult(null);
              }}
              disabled={!idCustomer}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
            >
              <option value="">Selecciona...</option>
              {warehousesForCustomer.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Paso 2: carga de CSV */}
      <section style={{ padding: '1rem', background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: '8px', marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>2. Reporte de ventas</h3>
        <p style={{ fontSize: '0.85rem', color: '#4a5568' }}>
          Columnas aceptadas: <code>sku, reference, color, size, quantity, price_override</code>. Solo <code>quantity</code> es obligatorio junto con <code>sku</code> o la combinación <code>reference + color + size</code>.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.8rem',
            background: '#f0b429',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            color: '#1a202c',
            fontSize: '0.85rem',
          }}>
            <FiUpload /> Cargar CSV
            <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
          <Button variant="ghost" size="sm" onClick={loadSample}>Usar ejemplo</Button>
        </div>
        <textarea
          value={csvText}
          onChange={(e) => handleCsvTextChange(e.target.value)}
          placeholder="Pega aquí el CSV o cárgalo con el botón..."
          rows={6}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '6px',
            borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
          }}
        />
        <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0.25rem 0 0' }}>
          {rows.length > 0 ? `${rows.length} filas detectadas.` : 'Sin filas.'}
        </p>

        <div style={{ marginTop: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Notas (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Corte mensual marzo 2026"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', borderWidth: 1, borderStyle: 'solid', borderColor: '#2a2a35', background: '#1a1a24', color: '#f1f1f3' }}
          />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <Button variant="primary" icon={<FiCheck />} onClick={handlePreview} loading={previewing}>
            Previsualizar
          </Button>
        </div>
      </section>

      {/* Paso 3: preview */}
      {preview && (
        <section style={{ padding: '1rem', background: '#1a1a24', border: '1px solid #2a2a35', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>3. Previsualización</h3>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div><strong>Cliente:</strong> {preview.customer.name}</div>
            <div><strong>Bodega:</strong> {preview.warehouse.name}</div>
            <div style={{ color: '#065f46' }}><strong>OK:</strong> {preview.summary.ok_count}</div>
            <div style={{ color: preview.summary.error_count > 0 ? '#991b1b' : '#065f46' }}>
              <strong>Errores:</strong> {preview.summary.error_count}
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Producto</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Cant.</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Precio</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem' }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {preview.resolved.map((r: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #edf2f7', background: r.status === 'error' ? '#fee2e2' : 'transparent' }}>
                    <td style={{ padding: '0.5rem' }}>{idx + 1}</td>
                    <td style={{ padding: '0.5rem' }}>{r.status === 'ok' ? '✓' : '✗'}</td>
                    <td style={{ padding: '0.5rem' }}>
                      {r.product ? `${r.product.reference} ${r.product.color} ${r.product.size}` : (r.row.sku || `${r.row.reference}/${r.row.color}/${r.row.size}`)}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{r.row.quantity}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{r.effective_price ? currencyCO(r.effective_price) : '—'}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{r.line_total ? currencyCO(r.line_total) : '—'}</td>
                    <td style={{ padding: '0.5rem', fontSize: '0.8rem', color: r.status === 'error' ? '#991b1b' : '#4a5568' }}>{r.message || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#12121a', borderRadius: '6px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>Subtotal: {currencyCO(preview.summary.subtotal)}</div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568' }}>IVA (19%): {currencyCO(preview.summary.iva)}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total: {currencyCO(preview.summary.total)}</div>
            </div>
            <Button
              variant="primary"
              icon={<FiZap />}
              onClick={handleProcess}
              loading={processing}
              disabled={preview.summary.error_count > 0 || preview.summary.ok_count === 0}
            >
              Procesar y facturar DIAN
            </Button>
          </div>
        </section>
      )}

      {/* Paso 4: resultado */}
      {result && (
        <section
          style={{
            padding: '1rem',
            background: result.dianError ? '#fef3c7' : '#d1fae5',
            border: `1px solid ${result.dianError ? '#92400e' : '#065f46'}`,
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {result.dianError ? 'Orden creada (DIAN pendiente)' : '¡Procesado!'}
          </h3>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Orden:</strong> {result.order.order_reference} (id #{result.order.id})
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Total:</strong> {currencyCO(result.order.total_payment)}
          </p>
          {result.dian?.invoiceId && (
            <p style={{ margin: '0.25rem 0' }}>
              <strong>Factura DIAN:</strong> #{result.dian.invoiceId} · CUFE {result.dian.cufe?.slice(0, 16)}...
            </p>
          )}
          {result.dianError && (
            <p style={{ margin: '0.25rem 0', color: '#92400e' }}>
              <strong>Error DIAN:</strong> {result.dianError}
            </p>
          )}
        </section>
      )}
    </div>
  );
};

export default ConsignmentSelloutPage;
