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
      <h3>Assign Role to User</h3>
      <select name="id_user_app" value={formData.id_user_app} onChange={handleChange} required>
        <option value="">Select User</option>
        {allUsers.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>

      <select name="id_role" value={formData.id_role} onChange={handleChange} required>
        <option value="">Select Role</option>
        {allRoles.map(role => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>

      <div>
        <button type="submit">Assign Role</button>
        <button type="button" onClick={() => setFormData(getInitialState())}>Clear</button>
      </div>
    </form>
  );
};

export default UserRoleForm;