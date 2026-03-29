import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiPlay, FiX, FiChevronRight } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);

const DEPRECIATION_METHODS: Record<string, string> = {
    STRAIGHT_LINE: 'Linea Recta',
};

// ── Asset Form Modal ──────────────────────────────────────

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

    if (!show) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    const assetAccounts = accounts.filter((a: any) => a.code.startsWith('15') && a.accepts_movements);
    const depExpenseAccounts = accounts.filter((a: any) => a.code.startsWith('5260') && a.accepts_movements);
    const accumAccounts = accounts.filter((a: any) => a.code.startsWith('1592') && a.accepts_movements);

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
            <div style={{
                background: '#fff', borderRadius: '12px', padding: '2rem', width: '100%',
                maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Nuevo Activo Fijo</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Nombre</label>
                        <input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Descripcion</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '60px' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Fecha Adquisicion</label>
                            <input
                                type="date"
                                value={form.acquisition_date}
                                onChange={e => setForm({ ...form, acquisition_date: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Costo Adquisicion</label>
                            <input
                                type="number"
                                value={form.acquisition_cost || ''}
                                onChange={e => setForm({ ...form, acquisition_cost: parseFloat(e.target.value) || 0 })}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Vida Util (meses)</label>
                            <input
                                type="number"
                                value={form.useful_life_months}
                                onChange={e => setForm({ ...form, useful_life_months: parseInt(e.target.value) || 0 })}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Valor Residual</label>
                            <input
                                type="number"
                                value={form.salvage_value || ''}
                                onChange={e => setForm({ ...form, salvage_value: parseFloat(e.target.value) || 0 })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Cuenta Activo (15xx)</label>
                        <select
                            value={form.id_puc_asset}
                            onChange={e => setForm({ ...form, id_puc_asset: parseInt(e.target.value) })}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <option value={0}>Seleccionar...</option>
                            {assetAccounts.map((a: any) => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Cuenta Gasto Depreciacion (5260xx)</label>
                        <select
                            value={form.id_puc_depreciation}
                            onChange={e => setForm({ ...form, id_puc_depreciation: parseInt(e.target.value) })}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <option value={0}>Seleccionar...</option>
                            {depExpenseAccounts.map((a: any) => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Cuenta Depreciacion Acumulada (1592xx)</label>
                        <select
                            value={form.id_puc_accumulated}
                            onChange={e => setForm({ ...form, id_puc_accumulated: parseInt(e.target.value) })}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                        >
                            <option value={0}>Seleccionar...</option>
                            {accumAccounts.map((a: any) => (
                                <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        style={{
                            padding: '0.75rem', borderRadius: '8px', border: 'none',
                            background: 'var(--primary-color, #d4af37)', color: '#fff',
                            fontWeight: 600, cursor: 'pointer', fontSize: '1rem',
                        }}
                    >
                        Crear Activo
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────

const DepreciationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'assets' | 'depreciate'>('assets');
    const [assets, setAssets] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    // Depreciation tab state
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
            alert('Error: ' + err.message);
        }
    };

    const handleRunDepreciation = async () => {
        setRunning(true);
        try {
            const result = await accountingApi.runDepreciation({ year: depYear, month: depMonth });
            setDepResult(result);
            loadAssets(); // Refresh assets to show updated values
        } catch (err: any) {
            logError({ message: err.message, page: 'DepreciationPage' });
            alert('Error: ' + err.message);
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

    const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const tabStyle = (active: boolean) => ({
        padding: '0.7rem 1.5rem',
        border: 'none',
        borderBottom: active ? '3px solid var(--primary-color, #d4af37)' : '3px solid transparent',
        background: 'none',
        fontWeight: active ? 700 : 400,
        color: active ? 'var(--primary-color, #d4af37)' : '#666',
        cursor: 'pointer',
        fontSize: '0.95rem',
    });

    // ── Asset Detail View ──
    if (selectedAsset) {
        return (
            <div>
                <PageHeader title={`Activo: ${selectedAsset.name}`} icon={<FiPackage />} />
                <button
                    onClick={() => setSelectedAsset(null)}
                    style={{
                        padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '8px',
                        background: '#fff', cursor: 'pointer', marginBottom: '1.5rem',
                    }}
                >
                    Volver
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Costo', value: formatCurrency(selectedAsset.acquisition_cost) },
                        { label: 'Vida Util', value: `${selectedAsset.useful_life_months} meses` },
                        { label: 'Valor Residual', value: formatCurrency(selectedAsset.salvage_value) },
                        { label: 'Metodo', value: DEPRECIATION_METHODS[selectedAsset.depreciation_method] || selectedAsset.depreciation_method },
                        { label: 'Dep. Mensual', value: formatCurrency((selectedAsset.acquisition_cost - selectedAsset.salvage_value) / selectedAsset.useful_life_months) },
                    ].map((item, i) => (
                        <div key={i} style={{
                            padding: '1rem', borderRadius: '10px', border: '1px solid #eee',
                            background: '#fafafa',
                        }}>
                            <small style={{ color: '#888' }}>{item.label}</small>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.3rem' }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                <h3>Historial de Depreciacion</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ textAlign: 'left', padding: '0.75rem' }}>Periodo</th>
                            <th style={{ textAlign: 'right', padding: '0.75rem' }}>Monto</th>
                            <th style={{ textAlign: 'right', padding: '0.75rem' }}>Acumulada</th>
                            <th style={{ textAlign: 'right', padding: '0.75rem' }}>Valor en Libros</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(selectedAsset.depreciationEntries || []).map((entry: any, idx: number) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.75rem' }}>{MONTHS[entry.month - 1]} {entry.year}</td>
                                <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(entry.amount)}</td>
                                <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(entry.accumulated)}</td>
                                <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(entry.book_value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!selectedAsset.depreciationEntries || selectedAsset.depreciationEntries.length === 0) && (
                    <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                        No hay registros de depreciacion aun.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            <PageHeader title="Activos Fijos y Depreciacion" icon={<FiPackage />} />

            <div style={{ borderBottom: '1px solid #eee', marginBottom: '1.5rem' }}>
                <button style={tabStyle(activeTab === 'assets')} onClick={() => setActiveTab('assets')}>
                    Activos Fijos
                </button>
                <button style={tabStyle(activeTab === 'depreciate')} onClick={() => setActiveTab('depreciate')}>
                    Calcular Depreciacion
                </button>
            </div>

            {/* ── Assets Tab ── */}
            {activeTab === 'assets' && (
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1.2rem', border: 'none', borderRadius: '8px',
                                background: 'var(--primary-color, #d4af37)', color: '#fff',
                                fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            <FiPlus /> Nuevo Activo
                        </button>
                    </div>

                    {loading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Nombre</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem' }}>Costo</th>
                                        <th style={{ textAlign: 'center', padding: '0.75rem' }}>Vida Util</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem' }}>Dep. Mensual</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem' }}>Acumulada</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem' }}>Valor en Libros</th>
                                        <th style={{ textAlign: 'center', padding: '0.75rem' }}>Estado</th>
                                        <th style={{ padding: '0.75rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((asset) => (
                                        <tr key={asset.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: 500 }}>{asset.name}</td>
                                            <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(asset.acquisition_cost)}</td>
                                            <td style={{ textAlign: 'center', padding: '0.75rem' }}>{asset.useful_life_months} meses</td>
                                            <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(asset.monthly_depreciation)}</td>
                                            <td style={{ textAlign: 'right', padding: '0.75rem' }}>{formatCurrency(asset.accumulated_depreciation)}</td>
                                            <td style={{ textAlign: 'right', padding: '0.75rem', fontWeight: 600 }}>{formatCurrency(asset.current_book_value)}</td>
                                            <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem',
                                                    background: asset.is_active ? '#e8f5e9' : '#ffebee',
                                                    color: asset.is_active ? '#2e7d32' : '#c62828',
                                                }}>
                                                    {asset.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <button
                                                    onClick={() => loadAssetDetail(asset.id)}
                                                    style={{
                                                        background: 'none', border: '1px solid #ccc', borderRadius: '6px',
                                                        padding: '0.3rem 0.6rem', cursor: 'pointer',
                                                    }}
                                                >
                                                    <FiChevronRight />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {assets.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
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

            {/* ── Depreciation Tab ── */}
            {activeTab === 'depreciate' && (
                <div>
                    <div style={{
                        display: 'flex', gap: '1rem', marginBottom: '1.5rem',
                        alignItems: 'center', flexWrap: 'wrap',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 600 }}>Ano:</label>
                            <select
                                value={depYear}
                                onChange={e => setDepYear(parseInt(e.target.value))}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label style={{ fontWeight: 600 }}>Mes:</label>
                            <select
                                value={depMonth}
                                onChange={e => setDepMonth(parseInt(e.target.value))}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleRunDepreciation}
                            disabled={running}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 1.2rem', border: 'none', borderRadius: '8px',
                                background: 'var(--primary-color, #d4af37)', color: '#fff',
                                fontWeight: 600, cursor: 'pointer', opacity: running ? 0.6 : 1,
                            }}
                        >
                            <FiPlay /> {running ? 'Calculando...' : 'Calcular Depreciacion'}
                        </button>
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
                                        padding: '1rem', borderRadius: '10px', border: '1px solid #eee',
                                        background: '#fafafa', textAlign: 'center',
                                    }}>
                                        <small style={{ color: '#888' }}>{item.label}</small>
                                        <div style={{ fontWeight: 700, fontSize: '1.3rem', marginTop: '0.3rem' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Results table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                        <th style={{ textAlign: 'left', padding: '0.75rem' }}>Activo</th>
                                        <th style={{ textAlign: 'center', padding: '0.75rem' }}>Estado</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem' }}>Monto</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem' }}>Acumulada</th>
                                        <th style={{ textAlign: 'right', padding: '0.75rem' }}>Valor Libros</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(depResult.results || []).map((r: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.75rem', fontWeight: 500 }}>{r.asset}</td>
                                            <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                                                <span style={{
                                                    padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem',
                                                    background: r.status === 'DEPRECIATED' ? '#e8f5e9' : '#fff8e1',
                                                    color: r.status === 'DEPRECIATED' ? '#2e7d32' : '#f9a825',
                                                }}>
                                                    {r.status === 'DEPRECIATED' ? 'Depreciado' : 'Omitido'}
                                                </span>
                                                {r.reason && <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>{r.reason}</div>}
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '0.75rem' }}>{r.amount ? formatCurrency(r.amount) : '-'}</td>
                                            <td style={{ textAlign: 'right', padding: '0.75rem' }}>{r.accumulated ? formatCurrency(r.accumulated) : '-'}</td>
                                            <td style={{ textAlign: 'right', padding: '0.75rem' }}>{r.book_value != null ? formatCurrency(r.book_value) : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!depResult && (
                        <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                            Seleccione ano y mes, luego presione "Calcular Depreciacion".
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DepreciationPage;
