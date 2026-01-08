import React from 'react';
import '../../styles/MasterDesign.css';
import { ViewIcon, EditIcon, DeleteIcon } from '../common/Icons.jsx';
import ActionButton from '../common/ActionButton.jsx';

const MasterDesignList = ({ designs, onEdit, onDelete, onViewProviders }) => {
  return (
    <div className="list-card">
      <ul>
        {designs.map((design) => (
          <li key={design.id}>
            <div className="design-info">
              <span className="design-reference">Ref: {design.reference}</span>
              <span>Prenda: {design.clothing?.name || design.id_clothing}</span>
              <span>Colección: {design.collection?.name || design.id_collection}</span>
              <span>Costo: ${design.manufactured_cost}</span>
            </div>
            <div className="design-actions">
              <ActionButton onClick={() => onViewProviders(design)} className="button-info" title="Ver Proveedores">
                <ViewIcon />
              </ActionButton>
              <ActionButton onClick={() => onEdit(design)} className="button-edit" title="Editar">
                <EditIcon />
              </ActionButton>
              <ActionButton onClick={() => onDelete(design.id)} className="button-delete" title="Eliminar">
                <DeleteIcon />
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MasterDesignList;