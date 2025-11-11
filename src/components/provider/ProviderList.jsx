import React from 'react';

const ProviderList = ({ items, onEdit, onDelete }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <span>
            <strong>{item.company_name}</strong> ({item.id})
            <br />
            <small>{item.email} | {item.phone}</small>
          </span>
          <div>
            <button onClick={() => onEdit(item)} className="button-edit">
              Edit
            </button>
            <button onClick={() => onDelete(item.id)} className="button-delete">
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProviderList;