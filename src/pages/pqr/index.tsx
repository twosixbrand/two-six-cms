import React, { useEffect, useState } from 'react';
import { PqrService } from '../../services/pqr/pqr.service';
import Swal from 'sweetalert2';
import { FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import '../../styles/ImageClothingPage.css'; // Reusing generic grid styles

interface PqrImage {
    id: number;
    image_url: string;
}

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
    observation?: string;
    images?: PqrImage[];
}

const PqrManagementPage: React.FC = () => {
    const [pqrs, setPqrs] = useState<Pqr[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPqr, setSelectedPqr] = useState<Pqr | null>(null);
    const [editStatus, setEditStatus] = useState<string>('');
    const [editObservation, setEditObservation] = useState<string>('');

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

    const handleStatusChange = async () => {
        if (!selectedPqr) return;

        try {
            await PqrService.updatePqrStatus(selectedPqr.id, editStatus, editObservation);
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Gestión guardada correctamente'
            });
            fetchPqrs();
            setSelectedPqr({ ...selectedPqr, status: editStatus, observation: editObservation });
        } catch (error) {
            Swal.fire('Error', 'No se pudo guardar la gestión', 'error');
        }
    };

    const handleSelectPqr = (pqr: Pqr) => {
        setSelectedPqr(pqr);
        setEditStatus(pqr.status || 'Abierto');
        setEditObservation(pqr.observation || '');
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
                <div className="col-lg-7 pe-lg-4">
                    {loading ? (
                        <div className="text-center py-5">Cargando Casos...</div>
                    ) : pqrs.length === 0 ? (
                        <div className="empty-search">
                            <FiCheckCircle className="empty-icon" />
                            <p>No hay PQRs radicadas en este momento.</p>
                        </div>
                    ) : (
                        <div className="studio-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.8rem' }}>
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
                                        onClick={() => handleSelectPqr(pqr)}
                                    >
                                        <div className="ref-card-content" style={{ gap: '0.7rem' }}>
                                            <div
                                                className="ref-badge"
                                                style={{
                                                    background: colors.bg,
                                                    color: colors.color,
                                                    width: '36px',
                                                    height: '36px',
                                                    fontSize: '0.95rem',
                                                    borderRadius: '10px'
                                                }}
                                            >
                                                {colors.icon}
                                            </div>
                                            <div className="ref-info">
                                                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.1rem', lineHeight: 1.2 }}>{pqr.radicado}</h3>
                                                <p style={{ margin: '0', fontSize: '0.78rem' }}>{pqr.customer_name}</p>
                                                <div style={{ marginTop: '0.3rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                    <span className="ref-category" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>{pqr.type}</span>
                                                    <span className="ref-category" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', borderColor: 'transparent' }}>{pqr.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {pqr.status !== 'Resuelto' && pqr.status !== 'Cerrado' && (
                                            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', fontWeight: 600, color: colors.bg }}>
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
                <div className="col-lg-4 offset-lg-1 mt-4 mt-lg-0">
                    {selectedPqr ? (
                        <div className="card border-0 form-card" style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            background: 'var(--surface-color)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                            marginTop: '1.5rem'
                        }}>
                            <div className="card-body" style={{ padding: '1.5rem' }}>
                                <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 700 }}>
                                            Detalle del Requerimiento
                                        </h3>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: getSlaColors(selectedPqr.slaStatus, selectedPqr.status).color, backgroundColor: getSlaColors(selectedPqr.slaStatus, selectedPqr.status).bg, padding: '4px 12px', borderRadius: '30px' }}>
                                            {selectedPqr.slaStatus || 'A TIEMPO'}
                                        </span>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>Radicado & Tipo</label>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.08)', color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {selectedPqr.radicado} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({selectedPqr.type})</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>Cliente</label>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.08)', color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {selectedPqr.customer_name} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>- {selectedPqr.customer_id}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>Correo Electrónico</label>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.08)', color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {selectedPqr.customer_email}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>Descripción del Caso</label>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.08)', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6, maxHeight: '200px', overflowY: 'auto' }}>
                                            {selectedPqr.description}
                                        </div>
                                    </div>

                                    {selectedPqr.images && selectedPqr.images.length > 0 && (
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>Evidencia Adjunta ({selectedPqr.images.length})</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '8px' }}>
                                                {selectedPqr.images.map(img => (
                                                    <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', aspectRatio: '1/1', background: 'var(--surface-color)', position: 'relative' }}>
                                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', zIndex: 1, transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'} />
                                                        <img src={img.image_url} alt="Evidencia PQR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', marginTop: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Actualizar Estado Operativo</label>
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value)}
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                                color: 'var(--text-primary)',
                                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                                padding: '0.85rem 1rem',
                                                borderRadius: '12px',
                                                width: '100%',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                                                marginBottom: '1rem'
                                            }}
                                            onFocus={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; e.currentTarget.style.borderColor = '#d4af37' }}
                                            onBlur={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'; e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)' }}
                                        >
                                            <option value="Abierto">Abierto</option>
                                            <option value="En Revisión">En Revisión</option>
                                            <option value="Resuelto">Resuelto</option>
                                            <option value="Cerrado">Cerrado</option>
                                        </select>

                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Observaciones de Gestión / Resolución</label>
                                        <textarea
                                            value={editObservation}
                                            onChange={(e) => setEditObservation(e.target.value)}
                                            rows={3}
                                            placeholder="Detalla aquí las acciones tomadas o la resolución final otorgada al cliente..."
                                            style={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                                color: 'var(--text-primary)',
                                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                                padding: '0.85rem 1rem',
                                                borderRadius: '12px',
                                                width: '100%',
                                                fontSize: '0.9rem',
                                                outline: 'none',
                                                resize: 'vertical',
                                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                                            }}
                                            onFocus={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; e.currentTarget.style.borderColor = '#d4af37' }}
                                            onBlur={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'; e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                                        <button
                                            type="button"
                                            onClick={handleStatusChange}
                                            style={{
                                                flex: 2,
                                                padding: '0.85rem',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #d4af37 0%, #f5d76e 50%, #d4af37 100%)',
                                                border: 'none',
                                                color: '#0f172a',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseOut={e => e.currentTarget.style.transform = 'none'}
                                        >
                                            Guardar Gestión
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPqr(null)}
                                            style={{
                                                flex: 1,
                                                padding: '0.85rem',
                                                borderRadius: '12px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1.5px solid rgba(212, 175, 55, 0.25)',
                                                color: 'var(--text-primary)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.borderColor = '#d4af37' }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)' }}
                                        >
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
