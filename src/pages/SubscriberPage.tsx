import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import SubscriberList from '../components/subscriber/SubscriberList';
import * as subscriberApi from '../services/subscriberApi';
import { logError } from '../services/errorApi';

const SubscriberPage = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const data = await subscriberApi.getSubscribers();
            setSubscribers(data);
        } catch (err) {
            logError(err, '/subscribers');
            setError('Error al cargar los suscriptores.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await subscriberApi.updateSubscriber(id, { status: !currentStatus });
            // Optimistic update
            setSubscribers(subscribers.map(sub =>
                sub.id === id ? { ...sub, status: !currentStatus } : sub
            ));
        } catch (err) {
            logError(err, '/subscribers/status');
            setError('Error al actualizar el estado.');
        }
    };

    const handleToggleUnsubscribed = async (id: number, currentUnsubscribed: boolean) => {
        try {
            await subscriberApi.updateSubscriber(id, { unsubscribed: !currentUnsubscribed });
            // Optimistic update
            setSubscribers(subscribers.map(sub =>
                sub.id === id ? { ...sub, unsubscribed: !currentUnsubscribed } : sub
            ));
        } catch (err) {
            logError(err, '/subscribers/unsubscribed');
            setError('Error al actualizar el estado de baja.');
        }
    };

    return (
        <div className="page-container">
            <PageHeader title="Gestión de Suscriptores" icon={<FiUsers />} />
            {error && <p className="error-message">{error}</p>}
            {loading ? (
                <p>Cargando suscriptores...</p>
            ) : (
                <div className="list-card full-width">
                    <SubscriberList
                        subscribers={subscribers}
                        onToggleStatus={handleToggleStatus}
                        onToggleUnsubscribed={handleToggleUnsubscribed}
                    />
                </div>
            )}
        </div>
    );
};

export default SubscriberPage;
