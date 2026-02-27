import React from 'react';
import { DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const DesignProviderList = ({ items, onDelete }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <span>
            Design: <strong>{item.masterDesign?.reference || 'N/A'}</strong>
            <br />
            Provider: <small>{item.provider?.company_name || 'N/A'}</small>
          </span>
          <div>
            <ActionButton onClick={() => onDelete(item.id)} className="button-delete" title="Eliminar"><DeleteIcon /></ActionButton>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DesignProviderList;