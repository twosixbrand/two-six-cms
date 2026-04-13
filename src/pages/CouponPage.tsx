import React, { useState, useEffect } from 'react';
import { FiGift, FiPlus } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import { DataTable, Modal, Button, StatusBadge, LoadingSpinner } from '../components/ui';
import * as couponApi from '../services/couponApi';
import { logError } from '../services/errorApi';

const CouponPage = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    percentage: 0,
    free_shipping: false,
    valid_from: '',
    valid_until: '',
    is_single_use_per_client: false,
    is_active: true,
    max_uses: '',
    min_purchase_amount: '',
    min_items_count: ''
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await couponApi.getCoupons();
      setCoupons(data);
    } catch (err: any) {
      logError(err, '/coupons');
      setError('Error al cargar cupones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      code: '', percentage: 0, free_shipping: false, valid_from: '', valid_until: '',
      is_single_use_per_client: false, is_active: true, max_uses: '', min_purchase_amount: '', min_items_count: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setFormData({
      code: item.code,
      percentage: item.percentage || 0,
      free_shipping: item.free_shipping || false,
      valid_from: new Date(item.valid_from).toISOString().slice(0, 16),
      valid_until: new Date(item.valid_until).toISOString().slice(0, 16),
      is_single_use_per_client: item.is_single_use_per_client || false,
      is_active: item.is_active,
      max_uses: item.max_uses || '',
      min_purchase_amount: item.min_purchase_amount || '',
      min_items_count: item.min_items_count || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        code: formData.code,
        percentage: Number(formData.percentage),
        free_shipping: formData.free_shipping,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        is_single_use_per_client: formData.is_single_use_per_client,
        is_active: formData.is_active,
      };

      if (formData.max_uses) payload.max_uses = Number(formData.max_uses);
      if (formData.min_purchase_amount) payload.min_purchase_amount = Number(formData.min_purchase_amount);
      if (formData.min_items_count) payload.min_items_count = Number(formData.min_items_count);

      if (editingId) {
        await couponApi.updateCoupon(editingId, payload);
      } else {
        await couponApi.createCoupon(payload);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      logError(err, '/coupons/submit');
      console.error(err.response?.data?.message || 'Error al guardar cupón');
      alert(err.response?.data?.message || 'Error al guardar cupón. Revisa los datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await couponApi.updateCoupon(id, { is_active: !currentStatus });
      setCoupons((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, is_active: !currentStatus } : sub))
      );
    } catch (err: any) {
      logError(err, '/coupons/status');
      alert('Error cambiando estado.');
    }
  };

  const columns = [
    { key: 'code', header: 'Código' },
    { key: 'percentage', header: 'Descuento', render: (val: any) => `${val}%` },
    { key: 'free_shipping', header: 'Envío Gratis', render: (val: any) => val ? 'SI' : 'NO' },
    { key: 'valid_from', header: 'Inicio', render: (val: any) => new Date(val).toLocaleDateString() },
    { key: 'valid_until', header: 'Fin', render: (val: any) => new Date(val).toLocaleDateString() },
    { key: 'current_uses', header: 'Usos', render: (val: any, row: any) => `${val} ${row.max_uses ? `/ ${row.max_uses}` : ''}` },
    {
      key: 'is_active',
      header: 'Activo (Kill Switch)',
      align: 'center' as const,
      render: (value: any, row: any) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(row.id, row.is_active)}
          style={{
            padding: '0.25rem 0.75rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem',
            backgroundColor: value ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: value ? '#16a34a' : '#dc2626',
          }}
        >
          {value ? 'Activo' : 'Pausado'}
        </button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Campañas de Descuento" icon={<FiGift />} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <Button onClick={openAddModal} icon={<FiPlus />}>Nueva Campaña</Button>
      </div>

      {error ? <p className="error-message">{error}</p> : null}
      
      {loading ? (
        <LoadingSpinner text="Cargando campañas..." />
      ) : (
        <DataTable
          columns={columns}
          data={coupons}
          emptyMessage="No hay campañas registradas"
          onEdit={openEditModal}
        />
      )}

      {/* Modal CRUD */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Campaña' : 'Crear Campaña'}>
        <form onSubmit={handleSubmit} className="crud-form">
          <div className="form-group">
            <label>Código Promocional</label>
            <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
          </div>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div>
                <label>Porcentaje (%)</label>
                <input type="number" min="0" max="100" value={formData.percentage} onChange={(e) => setFormData({...formData, percentage: e.target.value as any})} required />
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '1.8rem' }}>
                <input type="checkbox" checked={formData.free_shipping} onChange={(e) => setFormData({...formData, free_shipping: e.target.checked})} id="fs" />
                <label htmlFor="fs" style={{ margin: 0, cursor: 'pointer' }}>Forzar Envío Gratis</label>
             </div>
          </div>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Fecha de Inicio</label>
              <input type="datetime-local" value={formData.valid_from} onChange={(e) => setFormData({...formData, valid_from: e.target.value})} required />
            </div>
            <div>
              <label>Fecha de Fin</label>
              <input type="datetime-local" value={formData.valid_until} onChange={(e) => setFormData({...formData, valid_until: e.target.value})} required />
            </div>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
             <input type="checkbox" checked={formData.is_single_use_per_client} onChange={(e) => setFormData({...formData, is_single_use_per_client: e.target.checked})} id="su" />
             <label htmlFor="su" style={{ margin: 0, cursor: 'pointer' }}>Exclusivo: Un Solo Uso por Cliente (Registrado por Email/Cedula)</label>
          </div>
          <hr style={{ margin: '1rem 0', borderColor: '#333' }} />
          <h5>Reglas y Limitaciones Opcionales</h5>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
             <div>
                <label>Max. Usos Gbl.</label>
                <input type="number" min="1" value={formData.max_uses} placeholder="Ilimitado" onChange={(e) => setFormData({...formData, max_uses: e.target.value})} />
             </div>
             <div>
                <label>Compra Mín. ($)</label>
                <input type="number" min="1" value={formData.min_purchase_amount} placeholder="Sin mínimo" onChange={(e) => setFormData({...formData, min_purchase_amount: e.target.value})} />
             </div>
             <div>
                <label>Prendas Mín.</label>
                <input type="number" min="1" value={formData.min_items_count} placeholder="0" onChange={(e) => setFormData({...formData, min_items_count: e.target.value})} />
             </div>
          </div>
          
          <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} type="button">Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Campaña'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CouponPage;
