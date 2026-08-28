import React, { useState, useEffect } from 'react';
import { getPosSales } from '../services/posApi';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { FiFileText, FiCheckCircle } from 'react-icons/fi';
import './POSAdminPage.css'; // Opcional, pero usaremos estilos de tabla estándar si existen

const POSAdminPage = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const handleInvoice = async (id: number) => {
    Swal.fire('Atención', `La integración con la DIAN (facturación de la venta #${id}) será implementada en la Parte 2 de la Fase 3.`, 'info');
  };

  return (
    <div className="pos-admin-container" style={{ padding: '20px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Ventas Stand (Ferias)</h2>
        <button 
          onClick={loadSales} 
          className="btn btn-primary"
          style={{ background: 'var(--primary-color)', color: '#000', padding: '8px 16px', borderRadius: 4, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          Actualizar Lista
        </button>
      </div>

      <div style={{ overflowX: 'auto', background: 'var(--background-secondary)', borderRadius: 8, padding: 16 }}>
        {isLoading ? (
          <p>Cargando registros...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>ID</th>
                <th style={{ padding: 12 }}>Fecha</th>
                <th style={{ padding: 12 }}>Cliente</th>
                <th style={{ padding: 12 }}>Documento</th>
                <th style={{ padding: 12 }}>Email</th>
                <th style={{ padding: 12 }}>Total</th>
                <th style={{ padding: 12 }}>Estado</th>
                <th style={{ padding: 12 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 20, textAlign: 'center' }}>No hay ventas registradas.</td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 12 }}>#{sale.id}</td>
                    <td style={{ padding: 12 }}>{dayjs(sale.createdAt).format('YYYY-MM-DD HH:mm')}</td>
                    <td style={{ padding: 12 }}>{sale.customerName}</td>
                    <td style={{ padding: 12 }}>{sale.customerDoc}</td>
                    <td style={{ padding: 12 }}>{sale.customerEmail || <span style={{opacity: 0.5}}>-</span>}</td>
                    <td style={{ padding: 12 }}>${Number(sale.total).toLocaleString('es-CO')}</td>
                    <td style={{ padding: 12 }}>
                      {sale.status === 'PENDING' ? (
                        <span style={{ background: 'var(--warning-color, orange)', color: '#000', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                          Pendiente Facturar
                        </span>
                      ) : (
                        <span style={{ background: 'var(--success-color, green)', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 'bold' }}>
                          <FiCheckCircle style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Facturado
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 12 }}>
                      {sale.status === 'PENDING' && (
                        <button 
                          onClick={() => handleInvoice(sale.id)}
                          style={{
                            background: '#0d6efd',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <FiFileText />
                          Generar Factura
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default POSAdminPage;
