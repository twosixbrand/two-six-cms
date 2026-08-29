import React, { useState, useEffect, useMemo } from 'react';
import { getPosSales, queueBatchForDian } from '../services/posApi';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { FiFileText, FiCheckCircle, FiClock, FiAlertTriangle, FiEye } from 'react-icons/fi';
import './POSAdminPage.css'; // Opcional, pero usaremos estilos de tabla estándar si existen

const getPaymentMethodName = (code: string) => {
  if (code === '10') return 'Efectivo';
  if (code === '48') return 'Tarjeta';
  if (code === '49') return 'Transferencia';
  if (code === '42') return 'Consignación / Transferencia';
  if (code === '1') return 'Instrumento no definido';
  return code || 'No registrado';
};

const parseGarment = (description: string) => {
  const match = description.match(/(.*) - Talla (.*)/i);
  if (match) {
    return { name: match[1].trim(), size: match[2].trim().toUpperCase() };
  }
  return { name: description, size: 'U' }; // U = Única por defecto
};

const POSAdminPage = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(dayjs().format('YYYY-MM-DD'));

  const loadSales = async () => {
    setIsLoading(true);
    try {
      const data = await getPosSales();
      setSales(data);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar las ventas POS', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
    
    // Auto-refresh si hay ventas en QUEUED
    const interval = setInterval(() => {
      setSales(currentSales => {
        const hasQueued = currentSales.some(s => s.status === 'QUEUED');
        if (hasQueued) {
          loadSales();
        }
        return currentSales;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(s => dayjs(s.createdAt).format('YYYY-MM-DD') === filterDate);
  }, [sales, filterDate]);

  const aggregatedInventory = useMemo(() => {
    const inventory: Record<string, any> = {};
    
    filteredSales.forEach(sale => {
      if (sale.status === 'CANCELLED' || sale.status === 'VOIDED' || sale.status === 'ANULADA') return;

      let lines = [];
      try {
         lines = typeof sale.lines === 'string' ? JSON.parse(sale.lines) : sale.lines;
      } catch(e){}

      if (Array.isArray(lines)) {
        lines.forEach((l: any) => {
           const { name, size } = parseGarment(l.description || l.product_name || l.productName || 'Producto Desconocido');
           const qty = l.quantity || 1;
           
           if (!inventory[name]) {
             inventory[name] = { total: 0, sizes: {} };
           }
           inventory[name].total += qty;
           if (!inventory[name].sizes[size]) {
             inventory[name].sizes[size] = 0;
           }
           inventory[name].sizes[size] += qty;
        });
      }
    });

    return inventory;
  }, [filteredSales]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const processableIds = filteredSales.filter(s => s.status === 'PENDING' || s.status === 'ERROR').map(s => s.id);
      setSelectedIds(processableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleProcessBatch = async () => {
    if (selectedIds.length === 0) return;
    
    const result = await Swal.fire({
      title: 'Procesar Facturas',
      text: `¿Enviar ${selectedIds.length} ventas a la DIAN?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await queueBatchForDian(selectedIds);
        setSelectedIds([]);
        Swal.fire('Encoladas', 'Las facturas se procesarán en segundo plano.', 'success');
        await loadSales();
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Fallo al encolar facturas', 'error');
        setIsLoading(false);
      }
    }
  };

  const handleViewDetails = (sale: any) => {
    let lines = [];
    try {
      lines = typeof sale.lines === 'string' ? JSON.parse(sale.lines) : sale.lines;
    } catch (e) {
      console.error('Error parsing sale lines', e);
    }
    
    if (!lines || lines.length === 0) {
      Swal.fire('Sin detalle', 'Esta venta no tiene productos registrados.', 'info');
      return;
    }

    const linesHtml = `
      <div style="background: #2a2a2a; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 14px; text-align: left;">
        <div style="margin-bottom: 4px;"><strong>Cliente:</strong> ${sale.customerName}</div>
        <div style="margin-bottom: 4px;"><strong>Documento:</strong> ${sale.customerDoc}</div>
        <div style="margin-bottom: 4px;"><strong>Email:</strong> ${sale.customerEmail || 'N/A'}</div>
        <div style="margin-bottom: 4px;"><strong>Teléfono:</strong> ${sale.customerPhone || 'N/A'}</div>
        <div><strong>Medio de Pago:</strong> ${getPaymentMethodName(sale.paymentMethod)}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid #555;">
            <th style="padding: 8px;">Producto</th>
            <th style="padding: 8px; text-align: center;">Cant.</th>
            <th style="padding: 8px; text-align: right;">Precio U.</th>
            <th style="padding: 8px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map((l: any) => {
            const qty = l.quantity || 1;
            const priceWithTax = Number(l.unit_price || l.unitPrice || 0) * (1 + (l.taxPercent || 19) / 100);
            return `
            <tr style="border-bottom: 1px solid #333;">
              <td style="padding: 8px;">${l.description || l.product_name || l.productName || 'Producto'}</td>
              <td style="padding: 8px; text-align: center;">${qty}</td>
              <td style="padding: 8px; text-align: right;">$${priceWithTax.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</td>
              <td style="padding: 8px; text-align: right;">$${(qty * priceWithTax).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
      <div style="text-align: right; margin-top: 15px; font-weight: bold; font-size: 16px;">
        Total: $${Number(sale.total).toLocaleString('es-CO')}
      </div>
    `;

    Swal.fire({
      title: `Detalle Venta #${sale.id}`,
      html: linesHtml,
      width: '600px',
      confirmButtonText: 'Cerrar',
      background: '#1e1e1e',
      color: '#fff',
    });
  };

  return (
    <div className="pos-admin-container" style={{ padding: '20px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Ventas Stand (Ferias)</h2>
        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="filterDate" style={{ fontWeight: 'bold' }}>Fecha:</label>
            <input 
              type="date" 
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #555',
                background: '#222',
                color: '#fff',
                colorScheme: 'dark'
              }}
            />
          </div>
          {selectedIds.length > 0 && (
            <button 
              onClick={handleProcessBatch}
              className="btn btn-success"
              style={{ background: '#198754', color: '#fff', padding: '8px 16px', borderRadius: 4, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Procesar DIAN ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={loadSales} 
            className="btn btn-primary"
            style={{ background: 'var(--primary-color)', color: '#000', padding: '8px 16px', borderRadius: 4, fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            Actualizar Lista
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', background: 'var(--background-secondary)', borderRadius: 8, padding: 16 }}>
        {isLoading ? (
          <p>Cargando registros...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredSales.filter(s => s.status === 'PENDING' || s.status === 'ERROR').length} 
                  />
                </th>
                <th style={{ padding: 12 }}>ID</th>
                <th style={{ padding: 12 }}>Fecha</th>
                <th style={{ padding: 12 }}>Cliente</th>
                <th style={{ padding: 12 }}>Documento</th>
                <th style={{ padding: 12 }}>Total</th>
                <th style={{ padding: 12 }}>Estado DIAN</th>
                <th style={{ padding: 12 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 20, textAlign: 'center' }}>No hay ventas registradas en esta fecha.</td>
                </tr>
              ) : (
                filteredSales.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 12 }}>
                      {(sale.status === 'PENDING' || sale.status === 'ERROR') && (
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(sale.id)}
                          onChange={() => handleSelect(sale.id)} 
                        />
                      )}
                    </td>
                    <td style={{ padding: 12 }}>#{sale.id}</td>
                    <td style={{ padding: 12 }}>{dayjs(sale.createdAt).format('HH:mm')}</td>
                    <td style={{ padding: 12 }}>{sale.customerName}</td>
                    <td style={{ padding: 12 }}>{sale.customerDoc}</td>
                    <td style={{ padding: 12 }}>${Number(sale.total).toLocaleString('es-CO')}</td>
                    <td style={{ padding: 12 }}>
                      {sale.status === 'PENDING' ? (
                        <span style={{ background: 'var(--warning-color, orange)', color: '#000', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                          Pendiente
                        </span>
                      ) : sale.status === 'QUEUED' ? (
                        <span style={{ background: '#0d6efd', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                          <FiClock style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> En Cola
                        </span>
                      ) : sale.status === 'ERROR' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ background: '#dc3545', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold', width: 'fit-content' }}>
                            <FiAlertTriangle style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Error
                          </span>
                          <span style={{ fontSize: 11, color: '#ffaaaa' }}>{sale.dian_error_msg}</span>
                        </div>
                      ) : (
                        <span style={{ background: 'var(--success-color, green)', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                          <FiCheckCircle style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Facturado
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 12 }}>
                      <button 
                        onClick={() => handleViewDetails(sale)}
                        title="Ver Detalle"
                        style={{
                          background: 'transparent',
                          color: 'var(--primary-color, #eeb914)',
                          border: '1px solid var(--primary-color, #eeb914)',
                          padding: '6px 12px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12
                        }}
                      >
                        <FiEye size={16} /> Detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 30, background: 'var(--background-secondary)', borderRadius: 8, padding: 16 }}>
        <h3 style={{ marginBottom: 15 }}>Resumen de Prendas Vendidas ({filterDate})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px' }}>Prenda / Color</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', width: '100px' }}>Talla</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', width: '140px' }}>Cant. Vendida</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(aggregatedInventory).length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 20, textAlign: 'center' }}>No hay ventas agrupables en esta fecha.</td>
              </tr>
            ) : (
              Object.keys(aggregatedInventory).map((name, i) => {
                const product = aggregatedInventory[name];
                const sizes = Object.keys(product.sizes);
                return (
                  <React.Fragment key={i}>
                    {sizes.map((size, idx) => (
                      <tr key={`${i}-${idx}`} style={{ borderBottom: idx === sizes.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                        {idx === 0 && (
                          <td rowSpan={sizes.length} style={{ padding: '8px', verticalAlign: 'middle', borderRight: '1px solid var(--border-color)' }}>
                            <strong>{name}</strong>
                          </td>
                        )}
                        <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid #333' }}>
                          {size}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', background: 'var(--success-color, #198754)', color: '#fff', fontWeight: 'bold', borderBottom: '1px solid #333' }}>
                          {product.sizes[size]}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default POSAdminPage;

