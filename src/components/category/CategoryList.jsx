import React from 'react';

const CategoryList = ({ categories, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Categories</h2>
      {categories.length > 0 ? (<ul>
        {categories.map(item => (
          <li key={item.code_cat}>
            <span>{item.name} ({item.code_cat})</span>
            <div>
              <button onClick={() => onEdit(item)}>Edit</button>
              <button onClick={() => onDelete(item.code_cat)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No categories found.</p>)}
    </div>
  );
};

export default CategoryList;