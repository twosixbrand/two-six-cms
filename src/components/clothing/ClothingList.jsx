import React from 'react';

const ClothingList = ({ clothingItems, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Clothing Inventory</h2>
      {clothingItems.length > 0 ? (<ul>
        {clothingItems.map(item => (
          <li key={item.id}>
            <span>{item.name} - Stock: {item.stock}</span>
            <div>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No clothing items found.</p>)}
    </div>
  );
};

export default ClothingList;