import React, { useEffect, useState } from 'react';
import { PqrService } from '../../services/pqr/pqr.service';
import Swal from 'sweetalert2';
import { FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import '../../styles/ImageClothingPage.css'; // Reusing generic grid styles

interface Pqr {
    id: number;
    radicado: string;
    customer_name: string;
    customer_id: string;
    type: string;
    status: string;
    description: string;
    createdAt: string;
    daysOpen?: number;
    slaStatus?: string;
    customer_email: string;
}

const PqrManagementPage: React.FC = () => {
    const [pqrs, setPqrs] = useState<Pqr[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPqr, setSelectedPqr] = useState<Pqr | null>(null);

    const fetchPqrs = async () => {
        try {
            setLoading(true);
            const data = await PqrService.getAllPqrs();
            setPqrs(data);
        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar las PQRs', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPqrs();
    }, []);

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await PqrService.updatePqrStatus(id, newStatus);
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Estado actualizado correctamente'
            });
            fetchPqrs();
            if (selectedPqr && selectedPqr.id === id) {
                setSelectedPqr({ ...selectedPqr, status: newStatus });
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
        }
    };

    const getSlaColors = (slaStatus: string | undefined, status: string) => {
        if (status === 'Resuelto' || status === 'Cerrado') {
            return { bg: '#10b981', color: '#fff', border: 'rgba(16, 185, 129, 0.4)', icon: <FiCheckCircle /> }; // Green
        }
        if (slaStatus === 'VENCIDO') {
            return { bg: '#ef4444', color: '#fff', border: 'rgba(239, 68, 68, 0.4)', icon: <FiAlertCircle /> }; // Red
        }
        if (slaStatus === 'EN RIESGO') {
            return { bg: '#f59e0b', color: '#fff', border: 'rgba(245, 158, 11, 0.4)', icon: <FiClock /> }; // Yellow
        }
        return { bg: '#3b82f6', color: '#fff', border: 'rgba(59, 130, 246, 0.4)', icon: <FiCheckCircle /> }; // Blue for OK
    };

    return (
        <div className="page-container">
            <PageHeader title="Gestión de Casos PQR" icon={<FiClock />} />

            <div className="row mt-4">
                {/* Grid de Cards PQR */}
                <div className="col-lg-8">
                    {loading ? (
                        <div className="text-center py-5">Cargando Casos...</div>
                    ) : pqrs.length === 0 ? (
                        <div className="empty-search">
                            <FiCheckCircle className="empty-icon" />
                            <p>No hay PQRs radicadas en este momento.</p>
                        </div>
                    ) : (
                        <div className="studio-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {pqrs.map((pqr) => {
                                const colors = getSlaColors(pqr.slaStatus, pqr.status);
                                const isSelected = selectedPqr?.id === pqr.id;

                                return (
                                    <div
                                        key={pqr.id}
                                        className="studio-ref-card"
                                        style={{
                                            cursor: 'pointer',
                                            border: isSelected ? `2px solid ${colors.bg}` : `1px solid ${colors.border}`,
                                            boxShadow: isSelected ? `0 8px 20px ${colors.border}` : '',
                                            transform: isSelected ? 'translateY(-2px)' : 'none'
                                        }}
                                        onClick={() => setSelectedPqr(pqr)}
                                    >
                                        <div className="ref-card-content" style={{ gap: '1rem' }}>
                                            <div
                                                className="ref-badge"
                                                style={{
                                                    background: colors.bg,
                                                    color: colors.color,
                                                    width: '50px',
                                                    height: '50px',
                                                    fontSize: '1.2rem'
                                                }}
                                            >
                                                {colors.icon}
                                            </div>
                                            <div className="ref-info">
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{pqr.radicado}</h3>
                                                <p style={{ margin: '0', fontSize: '0.85rem' }}>{pqr.customer_name}</p>
                                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span className="ref-category" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>{pqr.type}</span>
                                                    <span className="ref-category" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', borderColor: 'transparent' }}>{pqr.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {pqr.status !== 'Resuelto' && pqr.status !== 'Cerrado' && (
                                            <div style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '0.75rem', fontWeight: 600, color: colors.bg }}>
                                                {pqr.daysOpen} días
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Panel Lateral del PQR Seleccionado */}
                <div className="col-lg-4 mt-4 mt-lg-0">
                    {selectedPqr ? (
                        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--surface-color)' }}>
                            <div className="card-body p-4">
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                        Detalle del Requerimiento
                                    </h3>

                                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                        <label>Radicado</label>
                                        <input type="text" readOnly value={`${selectedPqr.radicado} (${selectedPqr.type})`} disabled />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                        <label>Nombre del Cliente</label>
                                        <input type="text" readOnly value={selectedPqr.customer_name} disabled />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                        <label>Documento (ID)</label>
                                        <input type="text" readOnly value={selectedPqr.customer_id} disabled />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                        <label>Correo Electrónico</label>
                                        <input type="text" readOnly value={selectedPqr.customer_email} disabled />
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                                        <label>Descripción del Caso</label>
                                        <textarea
                                            readOnly
                                            value={selectedPqr.description}
                                            rows={5}
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                cursor: 'default',
                                                resize: 'none',
                                                color: 'var(--text-primary)',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                padding: '0.75rem',
                                                width: '100%'
                                            }}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Estado del Ticket</span>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: getSlaColors(selectedPqr.slaStatus, selectedPqr.status).color, backgroundColor: getSlaColors(selectedPqr.slaStatus, selectedPqr.status).bg, padding: '4px 10px', borderRadius: '20px' }}>
                                                {selectedPqr.slaStatus || 'A TIEMPO'}
                                            </span>
                                        </label>
                                        <select
                                            value={selectedPqr.status}
                                            onChange={(e) => handleStatusChange(selectedPqr.id, e.target.value)}
                                            style={{ backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.75rem', borderRadius: '8px', width: '100%', marginTop: '0.5rem' }}
                                        >
                                            <option value="Abierto">Abierto</option>
                                            <option value="En Revisión">En Revisión</option>
                                            <option value="Resuelto">Resuelto</option>
                                            <option value="Cerrado">Cerrado</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                                        <a
                                            href={`https://wa.me/573108777629?text=Hola,%20notificación%20sobre%20el%20PQR%20${selectedPqr.radicado}%20del%20cliente%20${selectedPqr.customer_name}.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary"
                                            style={{ flex: 1, textAlign: 'center', textDecoration: 'none', backgroundColor: '#25D366', color: '#fff', border: 'none' }}
                                        >
                                            NOTIFICAR WHATSAPP
                                        </a>
                                        <button type="button" className="btn-secondary" onClick={() => setSelectedPqr(null)} style={{ flex: 1 }}>
                                            Cerrar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="card shadow-sm border-0 h-100 d-flex justify-content-center align-items-center p-5 text-center bg-light" style={{ borderRadius: '20px' }}>
                            <div className="text-muted">
                                <FiClock className="fs-1 mb-3 d-block mx-auto opacity-50" size={48} />
                                <p>Selecciona una PQR del listado para ver sus detalles de gestión y modificar su estado.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PqrManagementPage;
