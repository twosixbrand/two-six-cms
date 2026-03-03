import React, { useState, useEffect } from 'react';

const ProviderForm = ({ onSave, currentItem, onCancel }) => {
  const [item, setItem] = useState({
    id: '',
    company_name: '',
    email: '',
    phone: '',
    account_number: '',
    account_type: '',
    bank_name: '',
  });

  useEffect(() => {
    if (currentItem) {
      setItem(currentItem);
    } else {
      setItem({
        id: '',
        company_name: '',
        email: '',
        phone: '',
        account_number: '',
        account_type: '',
        bank_name: '',
      });
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
    setItem({ id: '', company_name: '', email: '', phone: '', account_number: '', account_type: '', bank_name: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        {currentItem ? 'Editar Proveedor' : 'Agregar Proveedor'}
      </h3>

      <div className="form-group">
        <label htmlFor="id">NIT / Documento</label>
        <input
          id="id"
          name="id"
          type="text"
          placeholder="Ej: 900123456"
          value={item.id}
          onChange={handleChange}
          required
          disabled={!!currentItem}
        />
      </div>

      <div className="form-group">
        <label htmlFor="company_name">Nombre de Empresa</label>
        <input
          id="company_name"
          name="company_name"
          type="text"
          placeholder="Ej: Telas Premium SAS"
          value={item.company_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo Electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="contacto@empresa.com"
          value={item.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Teléfono</label>
        <input id="phone" name="phone" type="text" placeholder="Ej: 3001234567" value={item.phone} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="account_number">Número de Cuenta</label>
        <input
          id="account_number"
          name="account_number"
          type="text"
          placeholder="Ej: 1234567890"
          value={item.account_number}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="account_type">Tipo de Cuenta</label>
          <input id="account_type" name="account_type" type="text" placeholder="Ej: Ahorros" value={item.account_type} onChange={handleChange} required />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="bank_name">Banco</label>
          <input id="bank_name" name="bank_name" type="text" placeholder="Ej: Bancolombia" value={item.bank_name} onChange={handleChange} required />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          {currentItem ? 'Actualizar' : 'Crear'}
        </button>
        {currentItem && (
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default ProviderForm;