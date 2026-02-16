import React, { useMemo, useState } from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

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

    // 1. Ordenar los datos
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

    // 2. Agrupar los datos ya ordenados
    return sorted.reduce((acc, item) => {
      const groupKey = `${item.design?.clothing?.name || 'N/A'} - Ref: ${item.design?.reference || 'N/A'}`;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {});
  }, [filteredItems]);

  if (Object.keys(groupedAndSortedData).length === 0) {
    return <p>No clothing color items found.</p>;
  }

  return (
    <div className="list-container with-filter">
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filter by clothing or reference..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="filter-input"
        />
      </div>
      {Object.entries(groupedAndSortedData).map(([groupName, groupItems]) => (
        <div key={groupName} className="group-card">
          <h3 className="group-header">{groupName}</h3>
          <ul>
            {groupItems.map((item) => (
              <li key={item.id}>
                <div className="item-info">
                  <span>Gender: {item.design?.clothing?.gender?.name || 'N/A'}</span><br />
                  <span>Color: {item.color?.name || 'N/A'}</span><br />

                </div>
                <div className="item-actions">
                  <ActionButton onClick={() => onEdit(item)} className="button-edit" title="Editar"><EditIcon /></ActionButton>
                  <ActionButton onClick={() => onDelete(item.id)} className="button-delete" title="Eliminar"><DeleteIcon /></ActionButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {Object.keys(groupedAndSortedData).length === 0 && filterText && (
        <p>No items match your filter.</p>
      )}
    </div>
  );
};

export default ClothingColorList;