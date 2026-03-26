import React, { useState, useEffect } from 'react';
import locationApi from '../../services/locationApi';

const CustomerForm = ({ currentItem, onSave, onCancel }) => {
  const [item, setItem] = useState({
    name: '',
    email: '',
    current_phone_number: '',
    shipping_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Load departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await locationApi.getDepartments();
        setDepartments(data);
      } catch (err) {
        console.error('Error loading departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  // When currentItem changes, set form values and resolve the department/city
  useEffect(() => {
    if (currentItem) {
      setItem({
        name: currentItem.name || '',
        email: currentItem.email || '',
        current_phone_number: currentItem.current_phone_number || '',
        shipping_address: currentItem.shipping_address || '',
        city: currentItem.city || '',
        state: currentItem.state || '',
        postal_code: currentItem.postal_code || '',
        country: currentItem.country || '',
      });

      // Find the department ID that matches the customer's state name
      if (currentItem.state && departments.length > 0) {
        const dept = departments.find(d => d.name === currentItem.state);
        if (dept) {
          setSelectedDeptId(String(dept.id));
        } else {
          setSelectedDeptId('');
          setCities([]);
        }
      } else {
        setSelectedDeptId('');
        setCities([]);
      }
    } else {
      setItem({
        name: '', email: '', current_phone_number: '', shipping_address: '',
        city: '', state: '', postal_code: '', country: '',
      });
      setSelectedDeptId('');
      setCities([]);
    }
  }, [currentItem, departments]);

  // Load cities when selectedDeptId changes
  useEffect(() => {
    if (!selectedDeptId) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      try {
        const data = await locationApi.getCities(selectedDeptId);
        setCities(data);
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    };
    fetchCities();
  }, [selectedDeptId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setSelectedDeptId(deptId);
    const dept = departments.find(d => String(d.id) === deptId);
    setItem({ ...item, state: dept ? dept.name : '', city: '' });
  };

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setItem({ ...item, city: cityName });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(item);
  };

  if (!currentItem) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '0.95rem' }}>Selecciona un cliente de la lista para editar su información.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        Editar Cliente
      </h3>

      {currentItem.document_number && (
        <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', background: 'rgba(212,175,55,0.08)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <strong>Documento:</strong> {currentItem.document_number}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Nombre</label>
        <input id="name" name="name" type="text" value={item.name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo Electrónico</label>
        <input id="email" name="email" type="email" value={item.email} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="current_phone_number">Teléfono</label>
        <input id="current_phone_number" name="current_phone_number" type="text" value={item.current_phone_number} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="shipping_address">Dirección de Envío</label>
        <input id="shipping_address" name="shipping_address" type="text" value={item.shipping_address} onChange={handleChange} />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="state">Departamento</label>
          <select
            id="state"
            name="state"
            value={selectedDeptId}
            onChange={handleDepartmentChange}
          >
            <option value="">Seleccionar departamento...</option>
            {departments.map(dept => (
              <option key={dept.id} value={String(dept.id)}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="city">Ciudad</label>
          <select
            id="city"
            name="city"
            value={item.city}
            onChange={handleCityChange}
            disabled={!selectedDeptId}
          >
            <option value="">Seleccionar ciudad...</option>
            {cities.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="postal_code">Código Postal</label>
          <input id="postal_code" name="postal_code" type="text" value={item.postal_code} onChange={handleChange} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label htmlFor="country">País</label>
          <input id="country" name="country" type="text" value={item.country} onChange={handleChange} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          Actualizar
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;
