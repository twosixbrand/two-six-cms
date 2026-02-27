import React, { useState, useEffect } from 'react';
import '../../styles/MasterDesign.css';

const MasterDesignForm = ({
  onSubmit,
  initialData = {} as any,
  clothings = [] as any[],
  collections = [] as any[],
  years = [] as any[],
}) => {
  const [formData, setFormData] = useState<any>({
    manufactured_cost: '',
    description: '',
    id_clothing: '',
    id_collection: '',
  });

  useEffect(() => {
    if (initialData.id) {
      setFormData({
        reference: initialData.reference || '',
        manufactured_cost: initialData.manufactured_cost || '',
        description: initialData.description || '',
        id_clothing: initialData.id_clothing || '',
        id_collection: initialData.id_collection || '',
      });
    } else {
      // Limpiar el formulario para el modo creación
      setFormData({ manufactured_cost: '', description: '', id_clothing: '', id_collection: '' });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {initialData.id && (
        <div className="form-group">
          <label htmlFor="reference">Referencia</label>
          <input type="text" id="reference" name="reference" value={formData.reference || ''} readOnly />
        </div>
      )}
      <div className="form-group">
        <label htmlFor="id_clothing">Prenda</label>
        <select id="id_clothing" name="id_clothing" value={formData.id_clothing} onChange={handleChange} required>
          <option value="">Seleccione una prenda</option>
          {clothings.map((clothing) => (
            <option key={clothing.id} value={clothing.id}>{clothing.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="id_collection">Colección</label>
        <select id="id_collection" name="id_collection" value={formData.id_collection} onChange={handleChange} required>
          <option value="">Seleccione una colección</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>{collection.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="manufactured_cost">Costo de Fabricación</label>
        <input type="number" step="0.01" id="manufactured_cost" name="manufactured_cost" value={formData.manufactured_cost} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="file">Imagen Representativa</label>
        <input
          type="file"
          id="file"
          name="file"
          accept="image/*"
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="button-primary">
        {initialData.id ? 'Actualizar Diseño' : 'Crear Diseño'}
      </button>
    </form>
  );
};

export default MasterDesignForm;