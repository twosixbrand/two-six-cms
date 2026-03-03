import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiUsers, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import UserList from '../components/user/UserList';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userApi';
import { logError } from '../services/errorApi';
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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const lowerTerm = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name?.toLowerCase().includes(lowerTerm) ||
      user.email?.toLowerCase().includes(lowerTerm) ||
      user.login?.toLowerCase().includes(lowerTerm)
    );
  }, [users, searchTerm]);

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
    <div className="page-container">
      <PageHeader title="User Management" icon={<FiUsers />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Search by name, email or login..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 3.2rem',
              borderRadius: '50px',
              background: 'var(--surface-color)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              color: 'var(--text-primary)',
              transition: 'all 0.3s ease',
              fontSize: '0.95rem'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 4px 20px rgba(212,175,55,0.15)';
              e.target.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
            }}
          />
        </div>
      </PageHeader>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      <div className="grid-container">
        <div className="form-card">
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
        <div className="list-card">
          <UserList items={filteredUsers} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default UserPage;