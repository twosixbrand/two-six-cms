import React from 'react';
import { FiEdit2, FiTrash2, FiTag, FiEye } from 'react-icons/fi';
import ActionButton from '../common/ActionButton.jsx';
import '../../styles/MasterDesign.css';

const MasterDesignList = ({ designs, onEdit, onDelete, onViewProviders }) => {
  if (!designs || designs.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
        <FiTag style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
        <p>No hay diseños maestros registrados.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
      {designs.map((design) => (
        <div
          key={design.id}
          style={{
            background: 'var(--surface-color)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            position: 'relative'
          }}
          className="group hover:border-[#d4af37]/40 hover:shadow-[0_8px_25px_rgba(212,175,55,0.08)] hover:-translate-y-1"
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {design.image_url ? (
              <img
                src={`${design.image_url}?t=${new Date(design.updatedAt).getTime()}`}
                alt={design.reference}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <FiTag size={24} opacity={0.3} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: 'var(--primary-hover-color)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 800, letterSpacing: '0.5px' }}>
                      REF: {design.reference}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>
                    {design.clothing?.name || design.id_clothing}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {design.clothing?.gender?.name || 'GENERO N/A'}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      onClick={() => onViewProviders(design)}
                      title="Ver Proveedores"
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <FiEye size={13} />
                    </button>
                    <button
                      onClick={() => onEdit(design)}
                      title="Editar"
                      style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(design.id)}
                      title="Eliminar"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.7rem', background: 'rgba(0,0,0,0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Colección: {design.collection?.name || design.id_collection}
            </span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(22,163,74,0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px', color: '#16a34a', fontWeight: 600 }}>
              Costo: ${design.manufactured_cost}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MasterDesignList;