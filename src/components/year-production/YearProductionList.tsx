import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const YearProductionList = ({ items, onEdit, onDelete }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <span>
            <strong>{item.name}</strong> ({item.id})
          </span>
          <div>
            <button onClick={() => onEdit(item)} className="action-button button-edit" title="Editar"><EditIcon /></button>
            <button onClick={() => onDelete(item.id)} className="action-button button-delete" title="Eliminar"><DeleteIcon /></button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default YearProductionList;