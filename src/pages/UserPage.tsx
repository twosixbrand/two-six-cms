import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userApi';
import { logError } from '../services/errorApi';
import { EditIcon, DeleteIcon } from '../components/common/Icons.jsx';
import ActionButton from '../components/common/ActionButton.jsx';
import '../styles/MasterDesign.css';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState({
    id: null,
    name: '',
    login: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users.');
      logError(err, '/user');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser({ ...currentUser, [name]: value });
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentUser({ id: null, name: '', login: '', email: '', phone: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = { ...currentUser };
      // No enviar el ID en el cuerpo de la solicitud
      delete userData.id;
      // No enviar la contraseña si está vacía durante la actualización
      if (isEditing && !userData.password) {
        delete userData.password;
      }

      if (isEditing) {
        await updateUser(currentUser.id, userData);
      } else {
        await createUser(userData);
      }
      resetForm();
      fetchUsers(); // Recargar la lista
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} user: ${err.message}`);
      logError(err, '/user');
    }
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser({ ...user, password: '' }); // Limpiar campo de contraseña al editar
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        fetchUsers(); // Recargar la lista
      } catch (err) {
        setError('Failed to delete user.');
        logError(err, '/user');
      }
    }
  };

  return (
    <div className="master-design-container">
      <h1>User Management</h1>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      <div className="master-design-content">
        <div className="form-container">
          <h2>{isEditing ? 'Edit User' : 'Add User'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={currentUser.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Login</label>
              <input type="text" name="login" value={currentUser.login} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={currentUser.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={currentUser.phone} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={currentUser.password} onChange={handleInputChange} placeholder={isEditing ? 'Leave blank to keep current password' : ''} required={!isEditing} />
            </div>
            <button type="submit" className="button-primary">{isEditing ? 'Update' : 'Create'}</button>
            {isEditing && <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>Cancel</button>}
          </form>
        </div>
        <div className="table-container">
          <h2>User List</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Login</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.login}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    <button onClick={() => handleEdit(user)} className="action-button button-edit" title="Editar"><EditIcon /></button>
                    <button onClick={() => handleDelete(user.id)} className="action-button button-delete" title="Eliminar"><DeleteIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserPage;