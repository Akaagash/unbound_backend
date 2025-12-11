import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alert, setAlert] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', role: 'member', credits: 50 });
  const [newCredits, setNewCredits] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showAlert('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!newUser.name.trim()) {
      showAlert('error', 'Name is required');
      return;
    }

    if (newUser.credits < 0) {
      showAlert('error', 'Credits must be non-negative');
      return;
    }

    try {
      setSubmitting(true);
      const response = await usersAPI.create(newUser.name, newUser.role, newUser.credits);
      const apiKey = response.data?.api_key || response.data?.apiKey;

      if (apiKey) {
        showAlert('success', `User created! API Key: ${apiKey} (SAVE THIS - shown once only!)`);
      } else {
        showAlert('success', 'User created successfully');
      }

      setShowCreateModal(false);
      setNewUser({ name: '', role: 'member', credits: 50 });
      fetchUsers();
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCredits = async (e) => {
    e.preventDefault();
    
    const credits = parseInt(newCredits);
    if (isNaN(credits) || credits < 0) {
      showAlert('error', 'Please enter a valid credits amount');
      return;
    }

    try {
      setSubmitting(true);
      await usersAPI.update(selectedUser.id, { credits });
      showAlert('success', `Credits updated to ${credits} for ${selectedUser.name}`);
      setShowCreditsModal(false);
      setSelectedUser(null);
      setNewCredits('');
      fetchUsers();
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to update credits');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === 'admin') {
      showAlert('error', 'Cannot delete admin users');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      await usersAPI.delete(user.id);
      showAlert('success', `User ${user.name} deleted successfully`);
      fetchUsers();
    } catch (error) {
      showAlert('error', error.response?.data?.error || 'Failed to delete user');
    }
  };

  const openCreditsModal = (user) => {
    setSelectedUser(user);
    setNewCredits(user.credits.toString());
    setShowCreditsModal(true);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>👥 User Management</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Create New User
          </button>
        </div>

        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}

        <div className="users-stats">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{users.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Members</div>
            <div className="stat-value">{users.filter(u => u.role === 'member').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Admins</div>
            <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
          </div>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Credits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No users found</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>
                      <div className="user-name">
                        {user.name}
                        {user.role === 'admin' && (
                          <span className="badge badge-admin">Admin</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`credits ${user.credits <= 10 ? 'low' : ''}`}>
                        {user.credits}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => openCreditsModal(user)}
                          title="Update credits"
                        >
                          💰 Credits
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete user"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New User</h2>
                <button className="modal-close" onClick={() => setShowCreateModal(false)}>✖</button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter user name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Credits *</label>
                  <input
                    type="number"
                    value={newUser.credits}
                    onChange={(e) => setNewUser({ ...newUser, credits: parseInt(e.target.value) || 0 })}
                    min="0"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create User'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Update Credits Modal */}
        {showCreditsModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowCreditsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Credits - {selectedUser.name}</h2>
                <button className="modal-close" onClick={() => setShowCreditsModal(false)}>✖</button>
              </div>
              <form onSubmit={handleUpdateCredits}>
                <div className="form-group">
                  <label>Current Credits</label>
                  <div className="current-credits">{selectedUser.credits}</div>
                </div>
                <div className="form-group">
                  <label>New Credits Amount *</label>
                  <input
                    type="number"
                    value={newCredits}
                    onChange={(e) => setNewCredits(e.target.value)}
                    placeholder="Enter new credits amount"
                    min="0"
                    required
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Credits'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreditsModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
