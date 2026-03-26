import React from 'react';
import { FiEdit2, FiUsers } from 'react-icons/fi';

const CustomerList = ({ items, onEdit }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
        <FiUsers style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
        <p>No hay clientes registrados.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
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
            gap: '0.8rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {item.document_number && (
                  <span style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: 'var(--primary-hover-color)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    {item.identificationType?.name || 'Doc'}: {item.document_number}
                  </span>
                )}
                <span style={{
                  fontSize: '0.6rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                  background: item.is_registered ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                  color: item.is_registered ? '#10b981' : '#f59e0b',
                  border: `1px solid ${item.is_registered ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                }}>
                  {item.is_registered ? '✓ Registrado' : '⚠ Invitado'}
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>
                {item.name}
              </h4>
              {item.customerType && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {item.customerType.name}
                </span>
              )}
            </div>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => onEdit(item)}
              title="Editar"
              style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <FiEdit2 size={14} />
            </button>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Contacto</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.email}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.current_phone_number}</span>
            </div>
            {(item.city || item.state) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Ubicación</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {[item.city, item.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CustomerList;
