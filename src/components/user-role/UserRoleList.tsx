import React from 'react';
import { DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const UserRoleList = ({ items, onDelete }) => {
  return (
    <div>
      <h2>Current Assignments</h2>
      {items.length > 0 ? (
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <span>User: <strong>{item.user.name}</strong> &rarr; Role: <strong>{item.role.name}</strong></span>
              <div>
                <button onClick={() => onDelete(item.id)} className="action-button button-delete" title="Eliminar"><DeleteIcon /></button>
              </div>
            </li>
          ))}
        </ul>
      ) : (<p>No role assignments found.</p>)}
    </div>
  );
};

export default UserRoleList;