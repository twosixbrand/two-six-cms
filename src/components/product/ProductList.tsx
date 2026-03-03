import React from 'react';
import { FiEdit2, FiTrash2, FiBox, FiTag } from 'react-icons/fi';
import ActionButton from '../common/ActionButton.jsx';

const ProductList = ({ items, onEdit, onDelete }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
        <FiBox style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
        <p>No hay productos registrados.</p>
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
          className={`group hover:border-[#d4af37]/40 hover:shadow-[0_8px_25px_rgba(212,175,55,0.08)] hover:-translate-y-1 ${!item.active ? 'opacity-70' : ''}`}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.clothing_name}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <FiBox size={24} opacity={0.3} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ marginBottom: '0.4rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: 'var(--primary-hover-color)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 800, letterSpacing: '0.5px' }}>
                      SKU: {item.sku}
                    </span>
                    {!item.active && (
                      <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
                        INACTIVO
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>
                    {item.clothing_name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ${parseFloat(item.price).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.3rem', flexDirection: 'column' }}>
                  <button
                    onClick={() => onEdit(item)}
                    title="Editar"
                    style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <FiEdit2 size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    title="Eliminar"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Color</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.color_name || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Talla</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.size_name || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Colección</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.collection_name || 'N/A'} ({item.year_production || 'N/A'})</span>
            </div>
          </div>

          {item.is_outlet && (
            <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#eab308', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '12px', boxShadow: '0 2px 5px rgba(234,179,8,0.4)', zIndex: 10 }}>
              OUTLET
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductList;