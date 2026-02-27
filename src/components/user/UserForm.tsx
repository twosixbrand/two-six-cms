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
      <h3>{currentItem ? 'Edit' : 'Add'} User</h3>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder={currentItem ? 'New Password (optional)' : 'Password'}
        required={!currentItem}
      />
      <div>
        <label htmlFor="roles">Roles</label>
        <select
          id="roles"
          name="roles"
          multiple
          value={formData.roles}
          onChange={handleRoleChange}
          required
        >
          {allRoles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Save</button>
      {currentItem && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
};

export default UserForm;