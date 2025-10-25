import React from 'react';

const ClothingList = ({ clothingItems, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Clothing Inventory</h2>
      <ul>
        {clothingItems.map(item => (
          <li key={item.id}>
            {item.name} - Stock: {item.stock}
            <div>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClothingList;