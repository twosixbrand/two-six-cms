import React from 'react';

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
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No seasons found.</p>)}
    </div>
  );
};

export default SeasonList;