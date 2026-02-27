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
      <h3>Assign Provider to Design</h3>
      <div className="form-group">
        <label>Master Design</label>
        <select name="id_master_design" value={formData.id_master_design} onChange={handleChange} required>
          <option value="">Select Design</option>
          {masterDesigns.map(design => (
            <option key={design.id} value={design.id}>{design.reference}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Provider</label>
        <select name="id_provider" value={formData.id_provider} onChange={handleChange} required>
          <option value="">Select Provider</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>{provider.company_name}</option>
          ))}
        </select>
      </div>
      <button type="submit">Assign Provider</button>
    </form>
  );
};

export default DesignProviderForm;