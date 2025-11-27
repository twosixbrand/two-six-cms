import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const ProductList = ({ items, onEdit, onDelete }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <span>
            <strong>(ID: {item.id}) {item.clothing_name}</strong> Active: {item.active ? 'Yes' : 'No'} | Outlet: {item.is_outlet ? 'Yes' : 'No'}
            <br />
            <small>
              SKU: {item.sku} | Price: ${item.price} | Color: {item.color_name} | Size: {item.size_name} | Collection: {item.collection_name} | Year: {item.year_production}
            </small>
            <br />
            <small>
              Desc: {item.description}
            </small>
          </span>
          <div>
            <ActionButton onClick={() => onEdit(item)} className="button-edit" title="Editar">
              <EditIcon />
            </ActionButton>
            <ActionButton onClick={() => onDelete(item.id)} className="button-delete" title="Eliminar">
              <DeleteIcon />
            </ActionButton>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ProductList;