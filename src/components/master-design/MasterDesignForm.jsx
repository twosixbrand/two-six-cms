import React, { useState, useEffect } from 'react';
import '../../styles/MasterDesign.css';

const MasterDesignForm = ({
  onSubmit,
  initialData = {},
  providers = [],
  clothings = [],
  collections = [],
  years = [],
}) => {
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    manufactured_cost: '',
    id_provider: '',
    id_clothing: '',
    id_collection: '',
    id_year_production: '',
  });

  useEffect(() => {
    if (initialData.id) {
      setFormData({
        name: initialData.name || '',
        reference: initialData.reference || '',
        manufactured_cost: initialData.manufactured_cost || '',
        id_provider: initialData.id_provider || '',
        id_clothing: initialData.id_clothing || '',
        id_collection: initialData.id_collection || '',
        id_year_production: initialData.id_year_production || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      manufactured_cost: parseFloat(formData.manufactured_cost),
      id_clothing: parseInt(formData.id_clothing, 10),
      id_collection: parseInt(formData.id_collection, 10),
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="reference">Referencia</label>
        <input type="text" id="reference" name="reference" value={formData.reference} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="manufactured_cost">Costo de Fabricación</label>
        <input type="number" step="0.01" id="manufactured_cost" name="manufactured_cost" value={formData.manufactured_cost} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="id_provider">Proveedor</label>
        <select id="id_provider" name="id_provider" value={formData.id_provider} onChange={handleChange} required>
          <option value="">Seleccione un proveedor</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>{provider.name}</option>
          ))}
        </select>
      </div>
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
        <label htmlFor="id_year_production">Año de Producción</label>
        <select id="id_year_production" name="id_year_production" value={formData.id_year_production} onChange={handleChange} required>
          <option value="">Seleccione un año</option>
          {years.map((year) => (
            <option key={year.id} value={year.id}>{year.year}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="button-primary">
        {initialData.id ? 'Actualizar Diseño' : 'Crear Diseño'}
      </button>
    </form>
  );
};

export default MasterDesignForm;