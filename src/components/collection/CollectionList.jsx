import React from 'react';

const CollectionList = ({ items, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Collections</h2>
      {items.length > 0 ? (<ul>
        {items.map(item => (
          <li key={item.id}>
            <span>
              <strong>{item.name}</strong> (Season: {item.season?.name}, Year: {item.yearProduction?.year})
            </span>
            <div>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No collections found.</p>)}
    </div>
  );
};

export default CollectionList;