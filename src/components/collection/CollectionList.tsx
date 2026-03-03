import React from 'react';
import { FiEdit2, FiTrash2, FiArchive } from 'react-icons/fi';

const CollectionList = ({ items, onEdit, onDelete }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
        <FiArchive style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
        <p>No hay colecciones registradas.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
      {items.map((item) => (
        <div
          key={item.id}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: 'var(--primary-hover-color)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 800, letterSpacing: '0.5px' }}>
                  ID: {item.id}
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>
                {item.name}
              </h4>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.3rem', flexDirection: 'column' }}>
              <button
                type="button"
                onClick={() => onEdit(item)}
                title="Editar"
                style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <FiEdit2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                title="Eliminar"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Temporada</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.season?.name || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Año Prod.</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.yearProduction?.year || 'N/A'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionList;