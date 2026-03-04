import React from 'react';
import './SubscriberList.css';

interface Subscriber {
    id: number;
    email: string;
    registeredAt: string;
    status: boolean;
    unsubscribed: boolean;
}

interface SubscriberListProps {
    subscribers: Subscriber[];
    onToggleStatus: (id: number, currentStatus: boolean) => void;
    onToggleUnsubscribed: (id: number, currentUnsubscribed: boolean) => void;
}

const SubscriberList: React.FC<SubscriberListProps> = ({ subscribers, onToggleStatus, onToggleUnsubscribed }) => {
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
                            <th>Estado (Activo)</th>
                            <th>Dado de Baja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map((sub) => (
                            <tr key={sub.id}>
                                <td>{sub.id}</td>
                                <td>{sub.email}</td>
                                <td>{new Date(sub.registeredAt).toLocaleDateString()}</td>
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
                        ))}
                        {subscribers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center">No hay suscriptores registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriberList;
