import React, { useEffect, useState } from 'react';
import '../styles/AdminMembers.css';

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editCredits, setEditCredits] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', credits: 50 });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          'x-api-key': apiKey
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Filter to show only members (not admin)
        const memberUsers = data.data.filter(user => user.role === 'member');
        setMembers(memberUsers);
      } else {
        showMessage('Failed to load members', 'error');
      }
    } catch (error) {
      console.error('Error loading members:', error);
      showMessage('Error loading members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredits = async (userId) => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PUT',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credits: parseInt(editCredits) })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage(`Credits updated successfully for ${data.data.name}`, 'success');
        setEditingId(null);
        setEditCredits('');
        loadMembers();
      } else {
        showMessage('Failed to update credits', 'error');
      }
    } catch (error) {
      console.error('Error updating credits:', error);
      showMessage('Error updating credits', 'error');
    }
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    
    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newMember.name,
          role: 'member',
          credits: parseInt(newMember.credits)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage(`Member created! API Key: ${data.data.api_key}`, 'success');
        setShowCreateForm(false);
        setNewMember({ name: '', credits: 50 });
        loadMembers();
      } else {
        showMessage('Failed to create member', 'error');
      }
    } catch (error) {
      console.error('Error creating member:', error);
      showMessage('Error creating member', 'error');
    }
  };

  const handleDeleteMember = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const apiKey = localStorage.getItem('apiKey');
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': apiKey
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage(`Member ${userName} deleted successfully`, 'success');
        loadMembers();
      } else {
        showMessage('Failed to delete member', 'error');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      showMessage('Error deleting member', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const startEditing = (userId, currentCredits) => {
    setEditingId(userId);
    setEditCredits(currentCredits.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditCredits('');
  };

  if (loading) {
    return <div className="loading">Loading members...</div>;
  }

  return (
    <div className="admin-members">
      <div className="header">
        <h2>👥 Member Management</h2>
        <button 
          className="btn-create"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✖ Cancel' : '➕ Create New Member'}
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {showCreateForm && (
        <div className="create-form">
          <h3>Create New Member</h3>
          <form onSubmit={handleCreateMember}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Enter member name"
                required
              />
            </div>
            <div className="form-group">
              <label>Initial Credits:</label>
              <input
                type="number"
                value={newMember.credits}
                onChange={(e) => setNewMember({ ...newMember, credits: e.target.value })}
                min="0"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">Create Member</button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="members-count">
        <p>Total Members: <strong>{members.length}</strong></p>
      </div>

      <div className="members-table-container">
        <table className="members-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  No members found. Create your first member!
                </td>
              </tr>
            ) : (
              members.map(member => (
                <tr key={member.id}>
                  <td>#{member.id}</td>
                  <td>
                    <div className="member-name">
                      <span className="name">{member.name}</span>
                      <span className="role-badge">{member.role}</span>
                    </div>
                  </td>
                  <td>
                    {editingId === member.id ? (
                      <div className="edit-credits">
                        <input
                          type="number"
                          value={editCredits}
                          onChange={(e) => setEditCredits(e.target.value)}
                          min="0"
                          className="credits-input"
                        />
                        <button 
                          className="btn-save-small"
                          onClick={() => handleUpdateCredits(member.id)}
                        >
                          ✓
                        </button>
                        <button 
                          className="btn-cancel-small"
                          onClick={cancelEditing}
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <div className="credits-display">
                        <span className={`credits ${member.credits <= 10 ? 'low' : ''}`}>
                          {member.credits}
                        </span>
                        <button 
                          className="btn-edit"
                          onClick={() => startEditing(member.id, member.credits)}
                          title="Edit credits"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      title="Delete member"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="refresh-section">
        <button 
          className="btn-refresh"
          onClick={loadMembers}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
}

export default AdminMembers;
