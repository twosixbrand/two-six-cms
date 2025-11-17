import React from 'react';
import { EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const ProductList = ({ items, onEdit, onDelete }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <span>
            <strong>{item.name}</strong> ({item.active ? 'Active' : 'Inactive'})
            <br />
            <small>
              Active: {item.active ? 'Sí' : 'No'} | Prenda: {item.clothing_name} | Price: ${item.price} | Color: {item.color_name} | Size: {item.size_name} | Consecutive: {item.consecutive_number} | isOutlet: {item.is_outlet ? 'Sí' : 'No'} | Image: {item.image_url} | SKU: {item.sku} | Desc %: {item.discount_percentage} | Desc $: {item.discount_price}
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