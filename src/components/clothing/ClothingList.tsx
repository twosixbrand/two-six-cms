import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const ClothingList = ({ items, onEdit, onDelete }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} className="clothing-list-item">
          <span>
            <strong>{item.name}</strong> ({item.genderClothing?.map(gc => gc.gender.name).join(', ') || 'N/A'})
            <br />
            <small>
              Type: {item.typeClothing?.name || 'N/A'} | Category: {item.category?.name || 'N/A'}
            </small>
          </span>
          <div>
            <ActionButton onClick={() => onEdit(item)} title="Editar" className="button-edit"><EditIcon /></ActionButton>
            <ActionButton onClick={() => onDelete(item.id)} title="Eliminar" className="button-delete"><DeleteIcon /></ActionButton>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ClothingList;