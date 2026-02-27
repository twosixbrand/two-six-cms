import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const SeasonList = ({ items, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Seasons</h2>
      {items.length > 0 ? (<ul>
        {items.map(item => (
          <li key={item.id}>
            <span>{item.name} (ID: {item.id})</span>
            {item.description && <p>{item.description}</p>}
            <div>
              <button onClick={() => onEdit(item)} className="action-button button-edit" title="Editar"><EditIcon /></button>
              <button onClick={() => onDelete(item.id)} className="action-button button-delete" title="Eliminar"><DeleteIcon /></button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No seasons found.</p>)}
    </div>
  );
};

export default SeasonList;