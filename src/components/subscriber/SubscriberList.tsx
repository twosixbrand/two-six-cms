import React, { useState } from 'react';
import './SubscriberList.css';

interface Subscriber {
    id: number;
    email: string;
    registeredAt: string;
    status: boolean;
    unsubscribed: boolean;
    discount_code?: string;
    is_discount_used?: boolean;
}

interface SubscriberListProps {
    subscribers: Subscriber[];
    onToggleStatus: (id: number, currentStatus: boolean) => void;
    onToggleUnsubscribed: (id: number, currentUnsubscribed: boolean) => void;
}

const SubscriberList: React.FC<SubscriberListProps> = ({ subscribers, onToggleStatus, onToggleUnsubscribed }) => {
    const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

    const toggleRowExpansion = (id: number) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    return (
        <div className="list-container">
            <h2>Suscriber</h2>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Correo Electrónico</th>
                            <th>Fecha de Registro</th>
                            <th>Descuentos</th>
                            <th>Estado (Activo)</th>
                            <th>Dado de Baja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map((sub) => (
                            <React.Fragment key={sub.id}>
                                <tr className={expandedRowId === sub.id ? 'expanded-parent-row' : ''}>
                                    <td>{sub.id}</td>
                                    <td>{sub.email}</td>
                                    <td>{new Date(sub.registeredAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className={`action-btn ${expandedRowId === sub.id ? 'active-expansion' : ''}`}
                                            onClick={() => toggleRowExpansion(sub.id)}
                                        >
                                            {expandedRowId === sub.id ? 'Cerrar Códigos' : 'Ver Códigos'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className={`status-btn ${sub.status ? 'active' : 'inactive'}`}
                                            onClick={() => onToggleStatus(sub.id, sub.status)}
                                        >
                                            {sub.status ? 'Sí' : 'No'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className={`status-btn ${sub.unsubscribed ? 'inactive' : 'active'}`}
                                            onClick={() => onToggleUnsubscribed(sub.id, sub.unsubscribed)}
                                        >
                                            {sub.unsubscribed ? 'Sí' : 'No'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRowId === sub.id && (
                                    <tr className="expanded-content-row">
                                        <td colSpan={6} className="expanded-content-cell">
                                            <div className="expanded-content-wrapper">
                                                <h4 className="expanded-title">Códigos de Descuento</h4>
                                                {!sub.discount_code ? (
                                                    <p className="text-muted">Este usuario no tiene códigos de descuento registrados.</p>
                                                ) : (
                                                    <div className="codes-list-grid">
                                                        <div className="code-card-grid">
                                                            <div className="code-info">
                                                                <span className="code-title">{sub.discount_code}</span>
                                                                <span className="code-subtitle">Cupón de Bienvenida (10%)</span>
                                                            </div>
                                                            <div className={`code-status ${sub.is_discount_used ? 'used' : 'available'}`}>
                                                                {sub.is_discount_used ? 'CONSUMIDO' : 'DISPONIBLE'}
                                                            </div>
                                                        </div>
                                                        {/* Future codes will map here */}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {subscribers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center">No hay suscriptores registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriberList;
