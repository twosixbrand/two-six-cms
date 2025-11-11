import React from 'react';

const YearProductionList = ({ items, onEdit, onDelete }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <span>
            <strong>{item.name}</strong> ({item.id})
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

export default YearProductionList;