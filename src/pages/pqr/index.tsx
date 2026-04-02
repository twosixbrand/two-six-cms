import React, { useEffect, useState } from 'react';
import { PqrService } from '../../services/pqr/pqr.service';
import Swal from 'sweetalert2';
import { FiMessageSquare, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Button, StatusBadge, LoadingSpinner, FormField, SearchInput, Modal } from '../../components/ui';
import '../../styles/ImageClothingPage.css';

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

const PAGE_SIZE = 8;

const PqrManagementPage: React.FC = () => {
    const [pqrs, setPqrs] = useState<Pqr[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPqr, setSelectedPqr] = useState<Pqr | null>(null);
    const [editStatus, setEditStatus] = useState<string>('');
    const [editObservation, setEditObservation] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

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
            return { bg: '#10b981', color: '#fff', border: 'rgba(16, 185, 129, 0.4)', icon: <FiCheckCircle /> };
        }
        if (slaStatus === 'VENCIDO') {
            return { bg: '#ef4444', color: '#fff', border: 'rgba(239, 68, 68, 0.4)', icon: <FiAlertCircle /> };
        }
        if (slaStatus === 'EN RIESGO') {
            return { bg: '#f59e0b', color: '#fff', border: 'rgba(245, 158, 11, 0.4)', icon: <FiMessageSquare /> };
        }
        return { bg: '#3b82f6', color: '#fff', border: 'rgba(59, 130, 246, 0.4)', icon: <FiCheckCircle /> };
    };

    const filteredPqrs = pqrs.filter((pqr) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            pqr.radicado.toLowerCase().includes(q) ||
            pqr.customer_name.toLowerCase().includes(q) ||
            pqr.type.toLowerCase().includes(q) ||
            pqr.status.toLowerCase().includes(q)
        );
    });

    const visiblePqrs = filteredPqrs.slice(0, visibleCount);
    const hasMore = visibleCount < filteredPqrs.length;

    return (
        <div className="page-container">
            <PageHeader title="Gestión de Casos PQR" icon={<FiMessageSquare />} />

            <div style={{ marginTop: '1.5rem', marginBottom: '1rem', maxWidth: 360 }}>
                <SearchInput
                    value={search}
                    onChange={(val) => { setSearch(val); setVisibleCount(PAGE_SIZE); }}
                    placeholder="Buscar por radicado, cliente, tipo..."
                />
            </div>

            {loading ? (
                <LoadingSpinner text="Cargando Casos..." />
            ) : filteredPqrs.length === 0 ? (
                <div className="empty-search">
                    <FiCheckCircle className="empty-icon" />
                    <p>{pqrs.length === 0 ? 'No hay PQRs radicadas en este momento.' : 'No se encontraron resultados para la búsqueda.'}</p>
                </div>
            ) : (
                <>
                    <div className="studio-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.8rem' }}>
                        {visiblePqrs.map((pqr) => {
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
                                                <StatusBadge status={pqr.type} variant="info" size="sm" />
                                                <StatusBadge status={pqr.status} variant="neutral" size="sm" />
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

                    {hasMore && (
                        <div style={{ textAlign: 'center', padding: '1.2rem 0' }}>
                            <Button
                                variant="outline"
                                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                            >
                                Ver más ({filteredPqrs.length - visibleCount} restantes)
                            </Button>
                        </div>
                    )}

                    {!hasMore && filteredPqrs.length > PAGE_SIZE && (
                        <p style={{ textAlign: 'center', color: '#6b6b7b', fontSize: '0.8rem', padding: '0.8rem 0', margin: 0 }}>
                            Mostrando {filteredPqrs.length} de {filteredPqrs.length} casos
                        </p>
                    )}
                </>
            )}

            {/* Modal de Detalle PQR */}
            <Modal
                isOpen={!!selectedPqr}
                onClose={() => setSelectedPqr(null)}
                title={`Detalle — ${selectedPqr?.radicado || ''}`}
                size="lg"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setSelectedPqr(null)}>
                            Cerrar
                        </Button>
                        <Button variant="primary" onClick={handleStatusChange}>
                            Guardar Gestión
                        </Button>
                    </>
                }
            >
                {selectedPqr && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StatusBadge status={selectedPqr.type} variant="info" />
                            <StatusBadge
                                status={selectedPqr.slaStatus || 'A TIEMPO'}
                                variant={
                                    (selectedPqr.status === 'Resuelto' || selectedPqr.status === 'Cerrado') ? 'success' :
                                    selectedPqr.slaStatus === 'VENCIDO' ? 'error' :
                                    selectedPqr.slaStatus === 'EN RIESGO' ? 'warning' : 'info'
                                }
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'block' }}>Cliente</label>
                                <div style={{ background: '#13131a', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #2a2a35', color: '#f1f1f3', fontWeight: 500, fontSize: '0.875rem' }}>
                                    {selectedPqr.customer_name}
                                    <span style={{ color: '#6b6b7b', fontWeight: 400, fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>{selectedPqr.customer_id}</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'block' }}>Correo</label>
                                <div style={{ background: '#13131a', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #2a2a35', color: '#f1f1f3', fontWeight: 500, fontSize: '0.875rem' }}>
                                    {selectedPqr.customer_email}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'block' }}>Descripción del Caso</label>
                            <div style={{ background: '#13131a', padding: '1rem', borderRadius: '10px', border: '1px solid #2a2a35', color: '#f1f1f3', fontSize: '0.875rem', lineHeight: 1.6, maxHeight: '180px', overflowY: 'auto' }}>
                                {selectedPqr.description}
                            </div>
                        </div>

                        {selectedPqr.images && selectedPqr.images.length > 0 && (
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b6b7b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.3rem', display: 'block' }}>Evidencia ({selectedPqr.images.length})</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '8px' }}>
                                    {selectedPqr.images.map(img => (
                                        <a key={img.id} href={img.image_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2a2a35', aspectRatio: '1/1', background: '#13131a', position: 'relative' }}>
                                            <img src={img.image_url} alt="Evidencia PQR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #2a2a35', paddingTop: '1.2rem', marginTop: '0.3rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FormField
                                    label="Estado Operativo"
                                    name="editStatus"
                                    type="select"
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    options={[
                                        { value: 'Abierto', label: 'Abierto' },
                                        { value: 'En Revisión', label: 'En Revisión' },
                                        { value: 'Resuelto', label: 'Resuelto' },
                                        { value: 'Cerrado', label: 'Cerrado' },
                                    ]}
                                />
                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <StatusBadge
                                        status={editStatus}
                                        variant={
                                            editStatus === 'Resuelto' || editStatus === 'Cerrado' ? 'success' :
                                            editStatus === 'En Revisión' ? 'warning' : 'info'
                                        }
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <FormField
                                    label="Observaciones de Gestión / Resolución"
                                    name="editObservation"
                                    type="textarea"
                                    value={editObservation}
                                    onChange={(e) => setEditObservation(e.target.value)}
                                    placeholder="Detalla aquí las acciones tomadas o la resolución final..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PqrManagementPage;
