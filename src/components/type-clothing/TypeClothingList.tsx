import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const TypeClothingList = ({ items, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Type Clothing</h2>
      {items.length > 0 ? (
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <span>{item.name} ({item.id})</span>
            <div>
              <button onClick={() => onEdit(item)} className="action-button button-edit" title="Editar"><EditIcon /></button>
              <button onClick={() => onDelete(item.id)} className="action-button button-delete" title="Eliminar"><DeleteIcon /></button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No type clothing items found.</p>)}
    </div>
  );
};

export default TypeClothingList;