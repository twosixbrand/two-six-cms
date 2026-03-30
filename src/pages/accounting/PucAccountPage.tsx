import React, { useState, useEffect } from 'react';
import { FiBook, FiPlus, FiChevronRight, FiChevronDown, FiEdit2, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Button, StatusBadge, LoadingSpinner, SearchInput, Modal, ConfirmDialog } from '../../components/ui';
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

    const renderTree = (nodes: Account[], depth: number = 0) => {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expandedNodes.has(node.code);
            return (
                <React.Fragment key={node.code}>
                    <tr style={{ background: depth === 0 ? '#f8f9fa' : 'transparent' }}>
                        <td style={{ paddingLeft: `${depth * 24 + 8}px`, whiteSpace: 'nowrap' }}>
                            {hasChildren ? (
                                <span
                                    onClick={() => toggleNode(node.code)}
                                    style={{ cursor: 'pointer', marginRight: '6px', display: 'inline-flex', alignItems: 'center' }}
                                >
                                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                </span>
                            ) : (
                                <span style={{ display: 'inline-block', width: '20px' }} />
                            )}
                            <strong>{node.code}</strong>
                        </td>
                        <td>{node.name}</td>
                        <td>
                            <StatusBadge
                                status={node.nature === 'D' ? 'Débito' : 'Crédito'}
                                variant={node.nature === 'D' ? 'success' : 'warning'}
                                size="sm"
                            />
                        </td>
                        <td>
                            <StatusBadge
                                status={`Nivel ${node.level}`}
                                variant="info"
                                size="sm"
                            />
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
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
            <PageHeader title="PUC - Plan Único de Cuentas" icon={<FiBook />} />

            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: '1', maxWidth: '400px' }}>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar por código o nombre..."
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
                <div className="list-card full-width">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Naturaleza</th>
                                <th>Nivel</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayed.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center' }}>No se encontraron cuentas</td></tr>
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
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Código</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                            disabled={!!editingAccount}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                            placeholder="Ej: 110505"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Nombre</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                            placeholder="Ej: Caja General"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Código Padre (opcional)</label>
                        <input
                            type="text"
                            value={form.parent_code}
                            onChange={e => setForm({ ...form, parent_code: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                            placeholder="Ej: 1105"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Naturaleza</label>
                        <select
                            value={form.nature}
                            onChange={e => setForm({ ...form, nature: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                        >
                            <option value="D">Débito</option>
                            <option value="C">Crédito</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>Descripción</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', resize: 'vertical' }}
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
                title="Eliminar cuenta"
                message={deleteConfirm ? `¿Eliminar la cuenta ${deleteConfirm.code} - ${deleteConfirm.name}?` : ''}
                confirmText="Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </div>
    );
};

export default PucAccountPage;
