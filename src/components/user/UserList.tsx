import React from 'react';

const UserList = ({ items, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Users</h2>
      {items.length > 0 ? (<ul>
        {items.map(item => (
          <li key={item.id}>
            <div>
              <span>{item.name} ({item.email})</span>
              <div className="role-tags">
                {item.roles.map(role => <span key={role.code_role} className="role-tag">{role.name}</span>)}
              </div>
            </div>
            <div>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No users found.</p>)}
    </div>
  );
};

export default UserList;