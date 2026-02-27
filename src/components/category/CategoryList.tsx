import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const CategoryList = ({ categories, onEdit, onDelete }) => {
  return (
    <div>
      <h2>Categories</h2>
      {categories.length > 0 ? (<ul>
        {categories.map(category => (
          <li key={category.id}>
            <span>{category.name} (ID: {category.id})</span>
            <div>
              <button onClick={() => onEdit(category)} className="action-button button-edit" title="Editar"><EditIcon /></button>
              <button onClick={() => onDelete(category.id)} className="action-button button-delete" title="Eliminar"><DeleteIcon /></button>
            </div>
          </li>
        ))}
      </ul>) : (<p>No categories found.</p>)}
    </div>
  );
};

export default CategoryList;