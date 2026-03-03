import React, { useState } from 'react';

const UserRoleForm = ({ onSave, onCancel, allUsers, allRoles }) => {
  const getInitialState = () => ({ id_user_app: '', id_role: '' });
  const [formData, setFormData] = useState(getInitialState());

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ensure values are numbers if they are not empty strings
    const parsedValue = value ? parseInt(value, 10) : '';
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id_user_app || !formData.id_role) {
      alert('Please select both a user and a role.');
      return;
    }
    onSave(formData);
    setFormData(getInitialState()); // Reset form after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
        Asignar Rol a Usuario
      </h3>

      <div className="form-group">
        <label htmlFor="id_user_app">Usuario</label>
        <select id="id_user_app" name="id_user_app" value={formData.id_user_app} onChange={handleChange} required>
          <option value="">Seleccione Usuario</option>
          {allUsers.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="id_role">Rol</label>
        <select id="id_role" name="id_role" value={formData.id_role} onChange={handleChange} required>
          <option value="">Seleccione Rol</option>
          {allRoles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
          Asignar Rol
        </button>
        <button type="button" className="btn-secondary" onClick={() => setFormData(getInitialState())} style={{ flex: 1 }}>
          Limpiar
        </button>
      </div>
    </form>
  );
};

export default UserRoleForm;