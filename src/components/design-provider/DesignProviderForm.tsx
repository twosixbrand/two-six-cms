import React, { useState } from 'react';

const DesignProviderForm = ({ onSave, masterDesigns, providers }) => {
  const getInitialState = () => ({ id_master_design: '', id_provider: '' });
  const [formData, setFormData] = useState(getInitialState());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id_master_design || !formData.id_provider) {
      alert('Please select both a design and a provider.');
      return;
    }
    onSave(formData);
    setFormData(getInitialState()); // Reset form
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        Asignar Proveedor a Diseño
      </h3>

      <div className="form-group">
        <label htmlFor="id_master_design">Master Design</label>
        <select id="id_master_design" name="id_master_design" value={formData.id_master_design} onChange={handleChange} required>
          <option value="">Seleccione Diseño</option>
          {masterDesigns.map(design => (
            <option key={design.id} value={design.id}>{design.reference}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="id_provider">Proveedor</label>
        <select id="id_provider" name="id_provider" value={formData.id_provider} onChange={handleChange} required>
          <option value="">Seleccione Proveedor</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>{provider.company_name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          Asignar Proveedor
        </button>
      </div>
    </form>
  );
};

export default DesignProviderForm;