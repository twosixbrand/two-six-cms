import React, { useState, useEffect } from 'react';
import { FiPackage, FiHome, FiPlus, FiPlay, FiX, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const DEPRECIATION_METHODS: Record<string, string> = {
    STRAIGHT_LINE: 'Linea Recta',
};

const thStyle: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.7rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b6b7b',
    borderBottom: '1px solid #2a2a35', backgroundColor: '#1f1f2a',
    whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
};

const tdStyleBase: React.CSSProperties = {
    padding: '0.65rem 1rem', fontSize: '0.8125rem', color: '#f1f1f3',
    borderBottom: '1px solid #1f1f2a', fontFamily: 'Inter, sans-serif',
};

const darkSelectStyle: React.CSSProperties = {
    padding: '0.55rem 0.75rem', borderRadius: 8,
    border: '1px solid #2a2a35', fontSize: '0.875rem',
    backgroundColor: '#1a1a24', color: '#f1f1f3',
    outline: 'none', height: '40px',
    fontFamily: 'Inter, sans-serif',
};

// Asset Form Modal
const AssetFormModal = ({
    show,
    onClose,
    onSave,
    accounts,
}: {
    show: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    accounts: any[];
}) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        acquisition_date: '',
        acquisition_cost: 0,
        useful_life_months: 60,
        salvage_value: 0,
        depreciation_method: 'STRAIGHT_LINE',
        id_puc_asset: 0,
        id_puc_depreciation: 0,
        id_puc_accumulated: 0,
    });

    const handleSubmit = () => {
        onSave(form);
    };

    const assetAccounts = accounts.filter((a: any) => a.code.startsWith('15') && a.accepts_movements);
    const depExpenseAccounts = accounts.filter((a: any) => a.code.startsWith('5260') && a.accepts_movements);
    const accumAccounts = accounts.filter((a: any) => a.code.startsWith('1592') && a.accepts_movements);

    return (
        <Modal
            isOpen={show}
            onClose={onClose}
            title="Nuevo Activo Fijo"
            size="lg"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit}>Crear Activo</Button>
                </>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormField label="Nombre" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <FormField label="Descripcion" name="description" type="textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormField label="Fecha Adquisicion" name="acquisition_date" type="date" value={form.acquisition_date} onChange={e => setForm({ ...form, acquisition_date: e.target.value })} required />
                    <FormField label="Costo Adquisicion" name="acquisition_cost" type="number" value={form.acquisition_cost || ''} onChange={e => setForm({ ...form, acquisition_cost: parseFloat(e.target.value) || 0 })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormField label="Vida Util (meses)" name="useful_life_months" type="number" value={form.useful_life_months} onChange={e => setForm({ ...form, useful_life_months: parseInt(e.target.value) || 0 })} required />
                    <FormField label="Valor Residual" name="salvage_value" type="number" value={form.salvage_value || ''} onChange={e => setForm({ ...form, salvage_value: parseFloat(e.target.value) || 0 })} />
                </div>
                <FormField
                    label="Cuenta Activo (15xx)"
                    name="id_puc_asset"
                    type="select"
                    value={form.id_puc_asset}
                    onChange={e => setForm({ ...form, id_puc_asset: parseInt(e.target.value) })}
                    placeholder="Seleccionar..."
                    options={assetAccounts.map((a: any) => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
                    required
                />
                <FormField
                    label="Cuenta Gasto Depreciacion (5260xx)"
                    name="id_puc_depreciation"
                    type="select"
                    value={form.id_puc_depreciation}
                    onChange={e => setForm({ ...form, id_puc_depreciation: parseInt(e.target.value) })}
                    placeholder="Seleccionar..."
                    options={depExpenseAccounts.map((a: any) => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
                    required
                />
                <FormField
                    label="Cuenta Depreciacion Acumulada (1592xx)"
                    name="id_puc_accumulated"
                    type="select"
                    value={form.id_puc_accumulated}
                    onChange={e => setForm({ ...form, id_puc_accumulated: parseInt(e.target.value) })}
                    placeholder="Seleccionar..."
                    options={accumAccounts.map((a: any) => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
                    required
                />
            </div>
        </Modal>
    );
};

// Main Page
const DepreciationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'assets' | 'depreciate'>('assets');
    const [assets, setAssets] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    const currentYear = new Date().getFullYear();
    const [depYear, setDepYear] = useState(currentYear);
    const [depMonth, setDepMonth] = useState(new Date().getMonth() + 1);
    const [depResult, setDepResult] = useState<any>(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        loadAssets();
        loadAccounts();
    }, []);

    const loadAssets = async () => {
        setLoading(true);
        try {
            const data = await accountingApi.getFixedAssets();
            setAssets(Array.isArray(data) ? data : []);
        } catch (err: any) {
            logError({ message: err.message, page: 'DepreciationPage' });
        }
        setLoading(false);
    };

    const loadAccounts = async () => {
        try {
            const data = await accountingApi.getAccounts();
            setAccounts(Array.isArray(data) ? data : (data.data || []));
        } catch (err: any) {
            logError({ message: err.message, page: 'DepreciationPage' });
        }
    };

    const handleCreateAsset = async (data: any) => {
        try {
            await accountingApi.createFixedAsset(data);
            setShowModal(false);
            loadAssets();
        } catch (err: any) {
            logError({ message: err.message, page: 'DepreciationPage' });
            await Swal.fire({ title: 'Error', text: err.message || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
        }
    };

    const handleRunDepreciation = async () => {
        setRunning(true);
        try {
            const result = await accountingApi.runDepreciation({ year: depYear, month: depMonth });
            setDepResult(result);
            loadAssets();
        } catch (err: any) {
            logError({ message: err.message, page: 'DepreciationPage' });
            await Swal.fire({ title: 'Error', text: err.message || 'Ocurrió un error', icon: 'error', confirmButtonColor: '#f0b429' });
        }
        setRunning(false);
    };

    const loadAssetDetail = async (id: number) => {
        try {
            const data = await accountingApi.getFixedAssetDetail(id);
            setSelectedAsset(data);
        } catch (err: any) {
            logError({ message: err.message, page: 'DepreciationPage' });
        }
    };

    const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const tabStyle = (active: boolean): React.CSSProperties => ({
        padding: '0.7rem 1.5rem',
        border: 'none',
        borderBottom: active ? '3px solid #f0b429' : '3px solid transparent',
        background: 'none',
        fontWeight: active ? 700 : 400,
        color: active ? '#f0b429' : '#6b6b7b',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontFamily: 'Inter, sans-serif',
    });

    // Asset Detail View
    if (selectedAsset) {
        return (
            <div className="page-container">
                <PageHeader title={`Activo: ${selectedAsset.name}`} icon={<FiHome />} />
                <div style={{ marginBottom: '1.5rem' }}>
                    <Button variant="secondary" onClick={() => setSelectedAsset(null)}>Volver</Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Costo', value: formatCurrency(selectedAsset.acquisition_cost) },
                        { label: 'Vida Util', value: `${selectedAsset.useful_life_months} meses` },
                        { label: 'Valor Residual', value: formatCurrency(selectedAsset.salvage_value) },
                        { label: 'Metodo', value: DEPRECIATION_METHODS[selectedAsset.depreciation_method] || selectedAsset.depreciation_method },
                        { label: 'Dep. Mensual', value: formatCurrency((selectedAsset.acquisition_cost - selectedAsset.salvage_value) / selectedAsset.useful_life_months) },
                    ].map((item, i) => (
                        <div key={i} style={{
                            padding: '1rem', borderRadius: '12px', border: '1px solid #2a2a35',
                            background: '#1a1a24',
                        }}>
                            <small style={{ color: '#6b6b7b', fontFamily: 'Inter, sans-serif' }}>{item.label}</small>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.3rem', color: '#f1f1f3' }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                <h3 style={{ color: '#f1f1f3', fontFamily: 'Inter, sans-serif' }}>Historial de Depreciacion</h3>
                <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                <th style={{ ...thStyle, textAlign: 'left' }}>Periodo</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Acumulada</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Valor en Libros</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(selectedAsset.depreciationEntries || []).map((entry: any, idx: number) => (
                                <tr key={idx}>
                                    <td style={tdStyleBase}>{MONTH_NAMES[entry.month - 1]} {entry.year}</td>
                                    <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(entry.amount)}</td>
                                    <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(entry.accumulated)}</td>
                                    <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(entry.book_value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!selectedAsset.depreciationEntries || selectedAsset.depreciationEntries.length === 0) && (
                    <p style={{ textAlign: 'center', color: '#6b6b7b', padding: '2rem' }}>
                        No hay registros de depreciacion aun.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="page-container">
            <PageHeader title="Activos Fijos y Depreciacion" icon={<FiHome />} />

            <div style={{ borderBottom: '1px solid #2a2a35', marginBottom: '1.5rem' }}>
                <button style={tabStyle(activeTab === 'assets')} onClick={() => setActiveTab('assets')}>
                    Activos Fijos
                </button>
                <button style={tabStyle(activeTab === 'depreciate')} onClick={() => setActiveTab('depreciate')}>
                    Calcular Depreciacion
                </button>
            </div>

            {/* Assets Tab */}
            {activeTab === 'assets' && (
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <Button variant="primary" icon={<FiPlus />} onClick={() => setShowModal(true)}>
                            Nuevo Activo
                        </Button>
                    </div>

                    {loading ? (
                        <LoadingSpinner size="md" text="Cargando..." />
                    ) : (
                        <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, textAlign: 'left' }}>Nombre</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Costo</th>
                                        <th style={{ ...thStyle, textAlign: 'center' }}>Vida Util</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Dep. Mensual</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Acumulada</th>
                                        <th style={{ ...thStyle, textAlign: 'right' }}>Valor en Libros</th>
                                        <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                                        <th style={thStyle}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((asset) => (
                                        <tr key={asset.id} style={{ borderBottom: '1px solid #1f1f2a' }}>
                                            <td style={{ ...tdStyleBase, fontWeight: 500 }}>{asset.name}</td>
                                            <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(asset.acquisition_cost)}</td>
                                            <td style={{ ...tdStyleBase, textAlign: 'center' }}>{asset.useful_life_months} meses</td>
                                            <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(asset.monthly_depreciation)}</td>
                                            <td style={{ ...tdStyleBase, textAlign: 'right' }}>{formatCurrency(asset.accumulated_depreciation)}</td>
                                            <td style={{ ...tdStyleBase, textAlign: 'right', fontWeight: 600 }}>{formatCurrency(asset.current_book_value)}</td>
                                            <td style={{ ...tdStyleBase, textAlign: 'center' }}>
                                                <StatusBadge status={asset.is_active ? 'Activo' : 'Inactivo'} variant={asset.is_active ? 'success' : 'error'} size="sm" />
                                            </td>
                                            <td style={tdStyleBase}>
                                                <Button variant="ghost" size="sm" onClick={() => loadAssetDetail(asset.id)}>
                                                    <FiChevronRight />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {assets.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#6b6b7b', padding: '2rem' }}>
                                    No hay activos registrados.
                                </p>
                            )}
                        </div>
                    )}

                    <AssetFormModal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        onSave={handleCreateAsset}
                        accounts={accounts}
                    />
                </div>
            )}

            {/* Depreciation Tab */}
            {activeTab === 'depreciate' && (
                <div>
                    <div style={{
                        display: 'flex', gap: '1rem', marginBottom: '1.5rem',
                        alignItems: 'center', flexWrap: 'wrap',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 600, color: '#a0a0b0', fontFamily: 'Inter, sans-serif' }}>Ano:</label>
                            <select
                                value={depYear}
                                onChange={e => setDepYear(parseInt(e.target.value))}
                                style={darkSelectStyle}
                            >
                                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 600, color: '#a0a0b0', fontFamily: 'Inter, sans-serif' }}>Mes:</label>
                            <select
                                value={depMonth}
                                onChange={e => setDepMonth(parseInt(e.target.value))}
                                style={darkSelectStyle}
                            >
                                {MONTH_NAMES.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            variant="primary"
                            icon={<FiPlay />}
                            onClick={handleRunDepreciation}
                            disabled={running}
                            loading={running}
                        >
                            {running ? 'Calculando...' : 'Calcular Depreciacion'}
                        </Button>
                    </div>

                    {depResult && (
                        <div>
                            {/* Summary cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                {[
                                    { label: 'Total Activos', value: depResult.summary?.total || 0 },
                                    { label: 'Depreciados', value: depResult.summary?.depreciated || 0 },
                                    { label: 'Omitidos', value: depResult.summary?.skipped || 0 },
                                    { label: 'Monto Total', value: formatCurrency(depResult.summary?.totalAmount || 0) },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: '1rem', borderRadius: '12px', border: '1px solid #2a2a35',
                                        background: '#1a1a24', textAlign: 'center',
                                    }}>
                                        <small style={{ color: '#6b6b7b', fontFamily: 'Inter, sans-serif' }}>{item.label}</small>
                                        <div style={{ fontWeight: 700, fontSize: '1.3rem', marginTop: '0.3rem', color: '#f1f1f3' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Results table */}
                            <div style={{ overflowX: 'auto', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', borderRadius: 12 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ ...thStyle, textAlign: 'left' }}>Activo</th>
                                            <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Acumulada</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Valor Libros</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(depResult.results || []).map((r: any, idx: number) => (
                                            <tr key={idx}>
                                                <td style={{ ...tdStyleBase, fontWeight: 500 }}>{r.asset}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'center' }}>
                                                    <StatusBadge
                                                        status={r.status === 'DEPRECIATED' ? 'Depreciado' : 'Omitido'}
                                                        variant={r.status === 'DEPRECIATED' ? 'success' : 'warning'}
                                                        size="sm"
                                                    />
                                                    {r.reason && <div style={{ fontSize: '0.75rem', color: '#6b6b7b', marginTop: '0.2rem' }}>{r.reason}</div>}
                                                </td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{r.amount ? formatCurrency(r.amount) : '-'}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{r.accumulated ? formatCurrency(r.accumulated) : '-'}</td>
                                                <td style={{ ...tdStyleBase, textAlign: 'right' }}>{r.book_value != null ? formatCurrency(r.book_value) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!depResult && (
                        <p style={{ textAlign: 'center', color: '#6b6b7b', padding: '2rem' }}>
                            Seleccione ano y mes, luego presione "Calcular Depreciacion".
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DepreciationPage;
