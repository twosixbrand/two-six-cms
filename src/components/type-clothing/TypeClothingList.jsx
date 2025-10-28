import React from 'react';

const TypeClothingList = ({ items, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Type Clothing</h2>
      {items.length > 0 ? (<ul>
        {items.map(item => (
          <li key={item.code}>
            <span>{item.name} ({item.code})</span>
            <div>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.code)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No type clothing items found.</p>)}
    </div>
  );
};

export default TypeClothingList;