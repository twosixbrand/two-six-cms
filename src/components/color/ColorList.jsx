import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';

const ColorList = ({ colors, onEdit, onDelete }) => {
  return (
    <ul>
      {colors.map((color) => (
        <li key={color.id}>
          <div className="item-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{ width: '20px', height: '20px', backgroundColor: color.hex, borderRadius: '50%', border: '1px solid var(--border-color)' }}
                title={color.hex}
              ></div>
              <span>{color.name}</span>
            </div>
          </div>
          <div className="item-actions">
            <button onClick={() => onEdit(color)} className="action-button button-edit" title="Editar">
              <EditIcon />
            </button>
            <button onClick={() => onDelete(color.id)} className="action-button button-delete" title="Eliminar">
              <DeleteIcon />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ColorList;