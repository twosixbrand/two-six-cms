import React from 'react';
import { FiEdit2, FiTrash2, FiGrid } from 'react-icons/fi';

const SizeGuideList = ({ items, onEdit, onDelete }) => {
    if (!items || items.length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
                <FiGrid style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
                <p>No hay medidas registradas.</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.85rem', width: '100%' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Talla</th>
                        <th>Ancho</th>
                        <th>Largo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td><strong>{item.size}</strong></td>
                            <td>{item.width}</td>
                            <td>{item.length}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                    <button
                                        onClick={() => onEdit(item)}
                                        title="Editar"
                                        style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)', border: 'none', padding: '0.35rem', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <FiEdit2 size={13} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        title="Eliminar"
                                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.35rem', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SizeGuideList;
