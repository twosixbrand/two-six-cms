import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiLink, FiSearch } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import UserRoleList from '../components/user-role/UserRoleList';
import UserRoleForm from '../components/user-role/UserRoleForm';
import * as userRoleApi from '../services/userRoleApi';
import * as userApi from '../services/userApi';
import * as roleApi from '../services/roleApi';
import { logError } from '../services/errorApi';

const UserRolePage = () => {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [assignmentsData, usersData, rolesData] = await Promise.all([
        userRoleApi.getUserRoles(),
        userApi.getUsers(),
        roleApi.getRoles(),
      ]);
      setAssignments(assignmentsData);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      logError(err, '/user-role');
      setError('Failed to fetch data. ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments;
    const lowerTerm = searchTerm.toLowerCase();
    return assignments.filter(item =>
      item.user?.name?.toLowerCase().includes(lowerTerm) ||
      item.role?.name?.toLowerCase().includes(lowerTerm) ||
      item.user?.email?.toLowerCase().includes(lowerTerm) ||
      item.user?.login?.toLowerCase().includes(lowerTerm)
    );
  }, [assignments, searchTerm]);

  const handleSave = async (assignmentData) => {
    try {
      await userRoleApi.createUserRole(assignmentData);
      fetchData(); // Refresh the list
    } catch (err) {
      logError(err, '/user-role');
      setError('Failed to assign role. ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role assignment?')) {
      try {
        await userRoleApi.deleteUserRole(id);
        fetchData(); // Refresh the list
      } catch (err) {
        logError(err, '/user-role');
        setError('Failed to delete assignment. ' + err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <PageHeader title="User Role Management" icon={<FiLink />}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <FiSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.2rem', zIndex: 2 }} />
          <input
            type="text"
            placeholder="Search by user, email or role..."
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
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <UserRoleForm
            onSave={handleSave}
            onCancel={() => { }}
            allUsers={users}
            allRoles={roles}
          />
        </div>
        <div className="list-card">
          {loading ? (
            <p>Loading assignments...</p>
          ) : (
            <UserRoleList
              items={filteredAssignments}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRolePage;