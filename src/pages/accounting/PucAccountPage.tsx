import React, { useState, useEffect } from 'react';
import { FiBook, FiPlus, FiChevronRight, FiChevronDown, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Button, StatusBadge, LoadingSpinner, SearchInput, Modal, ConfirmDialog, FormField } from '../../components/ui';
import * as accountingApi from '../../services/accountingApi';
import { logError } from '../../services/errorApi';

interface Account {
    id: number;
    code: string;
    name: string;
    nature: 'D' | 'C';
    level: number;
    parent_code: string | null;
    description?: string;
    children?: Account[];
}

const PucAccountPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [form, setForm] = useState({ code: '', name: '', nature: 'D', parent_code: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await accountingApi.getAccountTree();
            setAccounts(data);
        } catch (err) {
            logError(err, '/accounting/puc');
            setError('Error al cargar el Plan de Cuentas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const toggleNode = (code: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code);
            else next.add(code);
            return next;
        });
    };

    const openCreateModal = () => {
        setEditingAccount(null);
        setForm({ code: '', name: '', nature: 'D', parent_code: '', description: '' });
        setShowModal(true);
    };

    const openEditModal = (account: Account) => {
        setEditingAccount(account);
        setForm({
            code: account.code,
            name: account.name,
            nature: account.nature,
            parent_code: account.parent_code || '',
            description: account.description || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            if (editingAccount) {
                await accountingApi.updateAccount(editingAccount.id, form);
            } else {
                await accountingApi.createAccount(form);
            }
            setShowModal(false);
            fetchAccounts();
        } catch (err: any) {
            alert('Error: ' + (err.message || err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await accountingApi.deleteAccount(deleteConfirm.id);
            fetchAccounts();
        } catch (err: any) {
            alert('Error al eliminar: ' + (err.message || err));
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const filterAccounts = (nodes: Account[], term: string): Account[] => {
        if (!term) return nodes;
        const lower = term.toLowerCase();
        return nodes.reduce<Account[]>((acc, node) => {
            const matches = node.code.toLowerCase().includes(lower) || node.name.toLowerCase().includes(lower);
            const filteredChildren = node.children ? filterAccounts(node.children, term) : [];
            if (matches || filteredChildren.length > 0) {
                acc.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
            }
            return acc;
        }, []);
    };

    const cellStyle: React.CSSProperties = {
        padding: '0.65rem 1rem',
        fontSize: '0.8125rem',
        color: '#f1f1f3',
        borderBottom: '1px solid #1f1f2a',
    };

    const renderTree = (nodes: Account[], depth: number = 0) => {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedNodes.has(node.code);
            return (
                <React.Fragment key={node.code}>
                    <tr style={{ background: depth === 0 ? '#1f1f2a' : 'transparent' }}>
                        <td style={{ ...cellStyle, paddingLeft: `${depth * 24 + 8}px`, whiteSpace: 'nowrap' }}>
                            {hasChildren ? (
                                <span
                                    onClick={() => toggleNode(node.code)}
                                    style={{ cursor: 'pointer', marginRight: '6px', display: 'inline-flex', alignItems: 'center', color: '#a0a0b0' }}
                                >
                                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                </span>
                            ) : (
                                <span style={{ display: 'inline-block', width: '20px' }} />
                            )}
                            <strong>{node.code}</strong>
                        </td>
                        <td style={cellStyle}>{node.name}</td>
                        <td style={cellStyle}>
                            <StatusBadge
                                status={node.nature === 'D' ? 'Debito' : 'Credito'}
                                variant={node.nature === 'D' ? 'success' : 'warning'}
                                size="sm"
                            />
                        </td>
                        <td style={cellStyle}>
                            <StatusBadge
                                status={`Nivel ${node.level}`}
                                variant="info"
                                size="sm"
                            />
                        </td>
                        <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<FiEdit2 />}
                                onClick={() => openEditModal(node)}
                            >
                                {''}
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                icon={<FiTrash2 />}
                                onClick={() => setDeleteConfirm(node)}
                            >
                                {''}
                            </Button>
                        </td>
                    </tr>
                    {hasChildren && isExpanded && renderTree(node.children!, depth + 1)}
                </React.Fragment>
            );
        });
    };

    const displayed = filterAccounts(accounts, search);

    return (
        <div className="page-container">
            <PageHeader title="PUC - Plan Unico de Cuentas" icon={<FiBook />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1', maxWidth: '400px' }}>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar por codigo o nombre..."
                    />
                </div>
                <Button variant="primary" icon={<FiPlus />} onClick={openCreateModal}>
                    Nueva Cuenta
                </Button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <LoadingSpinner text="Cargando plan de cuentas..." />
            ) : (
                <div style={{
                    overflowX: 'auto',
                    borderRadius: 8,
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2a2a35',
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: 600,
                    }}>
                        <thead>
                            <tr>
                                {['Codigo', 'Nombre', 'Naturaleza', 'Nivel', 'Acciones'].map((h) => (
                                    <th key={h} style={{
                                        padding: '0.65rem 1rem',
                                        textAlign: 'left',
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        color: '#6b6b7b',
                                        borderBottom: '1px solid #2a2a35',
                                        backgroundColor: '#1f1f2a',
                                        whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {displayed.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#a0a0b0' }}>No se encontraron cuentas</td></tr>
                            ) : (
                                renderTree(displayed)
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal crear / editar cuenta */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta PUC'}
                size="sm"
                footer={
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        loading={saving}
                        disabled={saving || !form.code || !form.name}
                    >
                        {saving ? 'Guardando...' : editingAccount ? 'Actualizar' : 'Crear Cuenta'}
                    </Button>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <FormField
                        label="Codigo"
                        name="code"
                        type="text"
                        value={form.code}
                        onChange={handleChange}
                        disabled={!!editingAccount}
                        placeholder="Ej: 110505"
                    />
                    <FormField
                        label="Nombre"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Ej: Caja General"
                    />
                    <FormField
                        label="Codigo Padre (opcional)"
                        name="parent_code"
                        type="text"
                        value={form.parent_code}
                        onChange={handleChange}
                        placeholder="Ej: 1105"
                    />
                    <FormField
                        label="Naturaleza"
                        name="nature"
                        type="select"
                        value={form.nature}
                        onChange={handleChange}
                        options={[
                            { value: 'D', label: 'Debito' },
                            { value: 'C', label: 'Credito' },
                        ]}
                    />
                    <FormField
                        label="Descripcion"
                        name="description"
                        type="textarea"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>
            </Modal>

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
                title="Eliminar cuenta"
                message={deleteConfirm ? `Eliminar la cuenta ${deleteConfirm.code} - ${deleteConfirm.name}?` : ''}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default PucAccountPage;
