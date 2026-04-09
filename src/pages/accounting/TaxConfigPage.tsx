import React, { useState, useEffect } from 'react';
import { FiSettings, FiPlus, FiTrash2, FiInfo, FiMapPin, FiPercent } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import { Button, LoadingSpinner, Modal, FormField } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import * as locationApi from '../../services/locationApi';
import { logError } from '../../services/errorApi';

interface TaxConfig {
    id: number;
    name: string;
    type: 'ICA' | 'AUTORETENCION_RENTA';
    city_id?: number;
    rate: number;
    puc_account_debit?: number;
    puc_account_credit?: number;
    is_active: boolean;
    city?: { name: string };
    pucAccountDebit?: { code: string; name: string };
    pucAccountCredit?: { code: string; name: string };
}

const TaxConfigPage = () => {
    const [configs, setConfigs] = useState<TaxConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [form, setForm] = useState({
        name: '',
        type: 'ICA',
        city_id: '',
        rate: '',
        puc_account_debit: '',
        puc_account_credit: '',
    });

    // Master data
    const [cities, setCities] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [configsData, departmentsData, accountsData] = await Promise.all([
                accountingApi.getTaxConfigs().catch(() => []),
                locationApi.getDepartments().catch(() => []),
                accountingApi.getAccounts({ level: 5 }).catch(() => [])
            ]);
            
            setConfigs(Array.isArray(configsData) ? configsData : []);
            
            // Flatten cities from departments safely
            const allCities = (departmentsData || []).flatMap((d: any) => d?.cities || []);
            setCities(allCities);
            setAccounts(Array.isArray(accountsData) ? accountsData : []);
        } catch (err) {
            logError(err, 'tax-config-page');
            // No mostrar error crítico si simplemente está vacío
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...form,
                city_id: form.city_id ? parseInt(form.city_id) : null,
                rate: parseFloat(form.rate),
                puc_account_debit: form.puc_account_debit ? parseInt(form.puc_account_debit) : null,
                puc_account_credit: form.puc_account_credit ? parseInt(form.puc_account_credit) : null,
            };

            await accountingApi.createTaxConfig(payload);
            Swal.fire('Éxito', 'Configuración guardada correctamente.', 'success');
            setShowModal(false);
            fetchData();
        } catch (err) {
            logError(err, 'save-tax-config');
            Swal.fire('Error', 'No se pudo guardar la configuración.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: '¿Eliminar configuración?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await accountingApi.deleteTaxConfig(id);
                fetchData();
                Swal.fire('Eliminado', 'La configuración ha sido eliminada.', 'success');
            } catch (err) {
                logError(err, 'delete-tax-config');
                Swal.fire('Error', 'No se pudo eliminar la configuración.', 'error');
            }
        }
    };

    return (
        <div className="page-container">
            <PageHeader 
                title="Configuración de Impuestos" 
                subtitle="Gestión de ICA y Autorretenciones Especiales"
                icon={<FiSettings />} 
            />

            <div style={{ marginBottom: '24px' }}>
                <Button variant="primary" icon={<FiPlus />} onClick={() => setShowModal(true)}>
                    Nueva Configuración
                </Button>
            </div>

            {loading ? (
                <LoadingSpinner size="lg" />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {configs.map((config) => (
                        <div key={config.id} style={{
                            background: '#1f1f2a', border: '1px solid #2a2a35', borderRadius: '12px',
                            padding: '20px', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, right: 0, width: '4px', height: '100%',
                                background: config.type === 'ICA' ? '#38bdf8' : '#fb923c'
                            }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{
                                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                                    background: config.type === 'ICA' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(251, 146, 60, 0.1)',
                                    color: config.type === 'ICA' ? '#38bdf8' : '#fb923c'
                                }}>
                                    {config.type}
                                </span>
                                <button 
                                    onClick={() => handleDelete(config.id)}
                                    style={{ background: 'none', border: 'none', color: '#6b6b7b', cursor: 'pointer' }}
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', color: '#f1f1f3', marginBottom: '4px' }}>{config.name}</h3>
                            {config.city && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a0a0b0', fontSize: '0.85rem', marginBottom: '12px' }}>
                                    <FiMapPin size={14} /> {config.city.name}
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f1f3' }}>
                                    {(config.rate * 100).toFixed(3)}%
                                </span>
                                <span style={{ color: '#6b6b7b', fontSize: '0.8rem' }}>
                                    Tarifa aplicada
                                </span>
                            </div>

                            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.8rem' }}>
                                <div style={{ marginBottom: '4px', color: '#a0a0b0' }}>
                                    <strong>Débito:</strong> {config.pucAccountDebit?.code} - {config.pucAccountDebit?.name}
                                </div>
                                <div style={{ color: '#a0a0b0' }}>
                                    <strong>Crédito:</strong> {config.pucAccountCredit?.code} - {config.pucAccountCredit?.name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Creación */}
            <Modal show={showModal} onClose={() => setShowModal(false)} title="Nueva Configuración de Impuesto" size="md">
                <form onSubmit={handleSave}>
                    <FormField label="Nombre Descriptivo" required>
                        <input 
                            className="form-control"
                            value={form.name}
                            onChange={(e) => setForm({...form, name: e.target.value})}
                            placeholder="Ej: ICA Bogotá - Comercial"
                            required
                        />
                    </FormField>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <FormField label="Tipo de Impuesto" required>
                            <select 
                                className="form-control"
                                value={form.type}
                                onChange={(e) => setForm({...form, type: e.target.value})}
                            >
                                <option value="ICA">ICA (Municipal)</option>
                                <option value="AUTORETENCION_RENTA">Autorretención Especial</option>
                            </select>
                        </FormField>

                        <FormField label="Ciudad (Solo para ICA)">
                            <select 
                                className="form-control"
                                value={form.city_id}
                                onChange={(e) => setForm({...form, city_id: e.target.value})}
                                disabled={form.type !== 'ICA'}
                                required={form.type === 'ICA'}
                            >
                                <option value="">Seleccione ciudad...</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <FormField label="Tarifa Decimal (ej: 11.04 x 1000 = 0.01104)" required>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="number"
                                step="0.00001"
                                className="form-control"
                                value={form.rate}
                                onChange={(e) => setForm({...form, rate: e.target.value})}
                                placeholder="0.01104"
                                required
                            />
                            <div style={{ position: 'absolute', right: '10px', top: '10px', color: '#6b6b7b', fontSize: '0.8rem' }}>
                                = {(parseFloat(form.rate) * 100 || 0).toFixed(3)}%
                            </div>
                        </div>
                    </FormField>

                    <FormField label="Cuenta Contable DÉBITO (Gasto/Activo)" required>
                        <select 
                            className="form-control"
                            value={form.puc_account_debit}
                            onChange={(e) => setForm({...form, puc_account_debit: e.target.value})}
                            required
                        >
                            <option value="">Seleccione cuenta...</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                        </select>
                    </FormField>

                    <FormField label="Cuenta Contable CRÉDITO (Pasivo/Anticipo)" required>
                        <select 
                            className="form-control"
                            value={form.puc_account_credit}
                            onChange={(e) => setForm({...form, puc_account_credit: e.target.value})}
                            required
                        >
                            <option value="">Seleccione cuenta...</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                        </select>
                    </FormField>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="primary" type="submit" loading={saving}>Guardar Configuración</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TaxConfigPage;
