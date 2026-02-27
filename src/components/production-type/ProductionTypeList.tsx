import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const ProductionTypeList = ({ items, onEdit, onDelete }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <span>
            <strong>{item.name}</strong>
            {item.description && <p style={{ margin: '0.25rem 0 0', fontSize: '0.9em', color: '#666' }}>{item.description}</p>}
          </span>
          <div>
            <ActionButton onClick={() => onEdit(item)} className="button-edit" title="Editar"><EditIcon /></ActionButton>
            <ActionButton onClick={() => onDelete(item.id)} className="button-delete" title="Eliminar"><DeleteIcon /></ActionButton>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProductionTypeList;