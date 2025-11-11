import React, { useState, useEffect, useCallback } from 'react';
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
      <h1>User Role Management</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="grid-container">
        <div className="form-card">
          <UserRoleForm
            onSave={handleSave}
            allUsers={users}
            allRoles={roles}
          />
        </div>
        <div className="list-card">
          {loading ? (
            <p>Loading assignments...</p>
          ) : (
            <UserRoleList
              items={assignments}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRolePage;