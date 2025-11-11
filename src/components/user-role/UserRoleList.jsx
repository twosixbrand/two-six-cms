import React from 'react';

const UserRoleList = ({ items, onDelete }) => {
  return (
    <div>
      <h2>Current Assignments</h2>
      {items.length > 0 ? (
        <ul>
          {items.map(item => (
            // The key should be unique for each assignment
            <li key={item.id}>
              <span>User: <strong>{item.user.name}</strong> &rarr; Role: <strong>{item.role.name}</strong></span>
              <div>
                <button onClick={() => onDelete(item.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (<p>No role assignments found.</p>)}
    </div>
  );
};

export default UserRoleList;