import React, { useState, useEffect } from 'react';

const UserForm = ({ onSave, currentItem, onCancel, allRoles }) => {
  const getInitialState = () => ({
    name: '',
    email: '',
    password: '',
    roles: [],
  });
  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (currentItem) {
      setFormData({
        name: currentItem.name,
        email: currentItem.email,
        password: '', // Password is not sent back, so it's cleared for editing
        roles: currentItem.roles.map(role => role.id), // Use the new numeric id
      });
    } else {
      setFormData(getInitialState());
    }
  }, [currentItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    const selectedRoles = Array.from(e.target.selectedOptions).map(option => parseInt((option as HTMLOptionElement).value, 10));
    setFormData(prev => ({ ...prev, roles: selectedRoles }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData, id: currentItem?.id };
    if (!dataToSend.password) {
      delete dataToSend.password; // Don't send empty password on update
    }
    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        {currentItem ? 'Editar Usuario' : 'Agregar Usuario'}
      </h3>

      <div className="form-group">
        <label htmlFor="name">Nombre Completo</label>
        <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Juan Pérez" required />
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo Electrónico</label>
        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="juan.perez@empresa.com" required />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={currentItem ? '(Opcional) Cambiar contraseña' : 'Password seguro'}
          required={!currentItem}
        />
      </div>

      <div className="form-group">
        <label htmlFor="roles">Roles Asignados</label>
        <select
          id="roles"
          name="roles"
          multiple
          value={formData.roles}
          onChange={handleRoleChange}
          required
          style={{ height: 'auto', minHeight: '100px' }}
        >
          {allRoles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar múltiples roles.</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          {currentItem ? 'Actualizar' : 'Guardar'}
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

export default UserForm;