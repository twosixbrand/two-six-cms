import React, { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiTag, FiSearch } from 'react-icons/fi';

const ClothingColorList = ({ items, onEdit, onDelete }) => {
  const [filterText, setFilterText] = useState('');

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!filterText) {
      return items;
    }
    const lowercasedFilter = filterText.toLowerCase();
    return items.filter(item => {
      const prenda = item.design?.clothing?.name?.toLowerCase() || '';
      const referencia = item.design?.reference?.toLowerCase() || '';
      return prenda.includes(lowercasedFilter) || referencia.includes(lowercasedFilter);
    });
  }, [items, filterText]);

  const groupedAndSortedData = useMemo(() => {
    if (!filteredItems || filteredItems.length === 0) {
      return {};
    }

    const sorted = [...filteredItems].sort((a, b) => {
      const refA = a.design?.reference || '';
      const refB = b.design?.reference || '';
      const prendaA = a.design?.clothing?.name || '';
      const prendaB = b.design?.clothing?.name || '';
      const colorA = a.color?.name || '';
      const colorB = b.color?.name || '';

      return (
        refA.localeCompare(refB) ||
        prendaA.localeCompare(prendaB) ||
        colorA.localeCompare(colorB)
      );
    });

    return sorted.reduce((acc, item) => {
      const groupKey = `${item.design?.clothing?.name || 'N/A'} - Ref: ${item.design?.reference || 'N/A'}`;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          name: item.design?.clothing?.name || 'N/A',
          reference: item.design?.reference || 'N/A',
          gender: item.design?.clothing?.gender?.name || 'N/A',
          items: []
        };
      }
      acc[groupKey].items.push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
        <FiTag style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
        <p>No hay colores de prendas registrados.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
        <input
          type="text"
          placeholder="Filter by clothing or reference..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            width: '100%',
            padding: '0.8rem 1rem 0.8rem 3.2rem',
            borderRadius: '50px',
            background: 'var(--surface-color)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
            color: 'var(--text-primary)',
            transition: 'all 0.3s ease',
            fontSize: '0.95rem'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary-color)';
            e.target.style.boxShadow = '0 4px 20px rgba(212,175,55,0.15)';
            e.target.style.outline = 'none';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)';
            e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
          }}
        />
      </div>

      {Object.keys(groupedAndSortedData).length === 0 && filterText ? (
        <p>No items match your filter.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {Object.entries(groupedAndSortedData).map(([groupKey, group]) => (
            <div
              key={groupKey}
              style={{
                background: 'var(--surface-color)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
              }}
              className="group hover:border-[#d4af37]/40 hover:shadow-[0_8px_25px_rgba(212,175,55,0.08)] hover:-translate-y-1"
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.1)', color: 'var(--primary-hover-color)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    REF: #{group.reference}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'rgba(0,0,0,0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                    {group.gender}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.3 }}>
                  {group.name}
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}>
                <h5 style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Colores Disponibles</h5>

                {group.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.color?.hex_code || '#ccc', border: '1px solid rgba(0,0,0,0.1)' }}></div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>{item.color?.name || 'N/A'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        onClick={() => onEdit(item)}
                        title="Editar"
                        style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <FiEdit2 size={12} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Eliminar"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClothingColorList;