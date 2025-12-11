# Frontend-Backend Integration Guide

This guide explains how to integrate the Command Gateway Backend with your `cmd_gateway_frontend`.

## 🔗 Backend API Information

**Base URL**: `http://localhost:3000`

**Authentication**: All requests (except `/health` and `/`) require the `x-api-key` header.

---

## 📝 Step-by-Step Integration

### 1. Configure API Base URL

In your frontend, create a configuration file or constants:

```javascript
// config.js or constants.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  HEADERS: {
    'Content-Type': 'application/json'
  }
};
```

### 2. Create an API Service

Create a centralized API service to handle all backend requests:

```javascript
// services/api.js
import { API_CONFIG } from './config';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.apiKey = this.getApiKey();
  }

  // Get API key from localStorage
  getApiKey() {
    return localStorage.getItem('apiKey') || '';
  }

  // Set API key in localStorage
  setApiKey(key) {
    localStorage.setItem('apiKey', key);
    this.apiKey = key;
  }

  // Clear API key
  clearApiKey() {
    localStorage.removeItem('apiKey');
    this.apiKey = '';
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...API_CONFIG.HEADERS,
      'x-api-key': this.apiKey,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Authentication
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Commands
  async submitCommand(commandText) {
    return this.post('/commands/submit', { command_text: commandText });
  }

  async getCommandHistory(limit = 50, offset = 0) {
    return this.get(`/commands/history?limit=${limit}&offset=${offset}`);
  }

  // Rules (Admin only)
  async getRules() {
    return this.get('/rules');
  }

  async createRule(pattern, action) {
    return this.post('/rules', { pattern, action });
  }

  async updateRule(id, pattern, action) {
    return this.put(`/rules/${id}`, { pattern, action });
  }

  async deleteRule(id) {
    return this.delete(`/rules/${id}`);
  }

  // Users (Admin only)
  async getUsers() {
    return this.get('/users');
  }

  async createUser(name, role, credits) {
    return this.post('/users', { name, role, credits });
  }

  async updateUser(id, updates) {
    return this.put(`/users/${id}`, updates);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  async regenerateApiKey(id) {
    return this.post(`/users/${id}/regenerate-key`);
  }

  // Audit Logs (Admin only)
  async getAuditLogs(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.get(`/logs?${params}`);
  }

  async getAuditStats() {
    return this.get('/logs/stats');
  }
}

export default new ApiService();
```

### 3. Authentication Flow

#### Login Component Example

```javascript
// components/Login.jsx
import React, { useState } from 'react';
import apiService from '../services/api';

function Login({ onLoginSuccess }) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Set the API key
      apiService.setApiKey(apiKey);

      // Verify the API key by getting user info
      const response = await apiService.getCurrentUser();
      
      if (response.success) {
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError('Invalid API key. Please try again.');
      apiService.clearApiKey();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Command Gateway</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>API Key:</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

### 4. User Dashboard Example

```javascript
// components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import apiService from '../services/api';

function Dashboard({ user }) {
  const [credits, setCredits] = useState(user.credits);
  const [commandText, setCommandText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitCommand = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput('');

    try {
      const response = await apiService.submitCommand(commandText);
      
      if (response.success) {
        setOutput(`✓ ${response.message}\n\nOutput:\n${response.data.output}`);
        setCredits(response.data.credits_remaining);
        setCommandText('');
      }
    } catch (err) {
      setOutput(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="user-info">
        <h2>Welcome, {user.name}</h2>
        <p>Role: {user.role}</p>
        <p>Credits: {credits}</p>
      </div>

      <div className="command-form">
        <h3>Submit Command</h3>
        <form onSubmit={handleSubmitCommand}>
          <input
            type="text"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            placeholder="Enter command (e.g., ls -la)"
            required
          />
          <button type="submit" disabled={loading || credits <= 0}>
            {loading ? 'Executing...' : 'Execute'}
          </button>
        </form>
        {output && <pre className="output">{output}</pre>}
      </div>
    </div>
  );
}

export default Dashboard;
```

### 5. Command History Component

```javascript
// components/CommandHistory.jsx
import React, { useEffect, useState } from 'react';
import apiService from '../services/api';

function CommandHistory() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await apiService.getCommandHistory();
      if (response.success) {
        setCommands(response.data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="command-history">
      <h3>Command History</h3>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {commands.map((cmd) => (
            <tr key={cmd.id}>
              <td>{cmd.command_text}</td>
              <td className={`status-${cmd.status}`}>{cmd.status}</td>
              <td>{new Date(cmd.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CommandHistory;
```

### 6. Admin Panel - Rules Management

```javascript
// components/admin/RulesManagement.jsx
import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';

function RulesManagement() {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ pattern: '', action: 'AUTO_ACCEPT' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const response = await apiService.getRules();
      if (response.success) {
        setRules(response.data);
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.createRule(newRule.pattern, newRule.action);
      if (response.success) {
        setRules([...rules, response.data]);
        setNewRule({ pattern: '', action: 'AUTO_ACCEPT' });
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    try {
      await apiService.deleteRule(id);
      setRules(rules.filter(r => r.id !== id));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="rules-management">
      <h3>Rules Management</h3>
      
      <form onSubmit={handleCreateRule}>
        <h4>Create New Rule</h4>
        <input
          type="text"
          placeholder="Regex pattern (e.g., ^ls)"
          value={newRule.pattern}
          onChange={(e) => setNewRule({ ...newRule, pattern: e.target.value })}
          required
        />
        <select
          value={newRule.action}
          onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
        >
          <option value="AUTO_ACCEPT">AUTO_ACCEPT</option>
          <option value="AUTO_REJECT">AUTO_REJECT</option>
        </select>
        <button type="submit">Create Rule</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pattern</th>
            <th>Action</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td>{rule.id}</td>
              <td><code>{rule.pattern}</code></td>
              <td className={`action-${rule.action.toLowerCase()}`}>
                {rule.action}
              </td>
              <td>
                <button onClick={() => handleDeleteRule(rule.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RulesManagement;
```

### 7. Admin Panel - Users Management

```javascript
// components/admin/UsersManagement.jsx
import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', role: 'member', credits: 100 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.createUser(
        newUser.name,
        newUser.role,
        newUser.credits
      );
      if (response.success) {
        alert(`User created!\n\nAPI Key: ${response.data.api_key}\n\nSave this key - it will not be shown again!`);
        loadUsers();
        setShowCreateForm(false);
        setNewUser({ name: '', role: 'member', credits: 100 });
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateCredits = async (userId) => {
    const newCredits = prompt('Enter new credit amount:');
    if (!newCredits) return;

    try {
      await apiService.updateUser(userId, { credits: parseInt(newCredits) });
      loadUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="users-management">
      <h3>Users Management</h3>
      
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel' : 'Create New User'}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreateUser}>
          <h4>Create New User</h4>
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <input
            type="number"
            placeholder="Credits"
            value={newUser.credits}
            onChange={(e) => setNewUser({ ...newUser, credits: parseInt(e.target.value) })}
            required
          />
          <button type="submit">Create User</button>
        </form>
      )}

      <table>
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
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>{user.credits}</td>
              <td>
                <button onClick={() => handleUpdateCredits(user.id)}>
                  Update Credits
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersManagement;
```

---

## 🔒 Security Considerations

1. **API Key Storage**: Store API keys in localStorage (for web) or secure storage (for mobile)
2. **HTTPS**: In production, use HTTPS for all API calls
3. **API Key Display**: Only show API keys once during user creation
4. **Logout**: Clear API key from storage on logout

---

## 🎨 UI/UX Recommendations

### Member Dashboard
- Display current credit balance prominently
- Show command input with autocomplete
- Display command output in a terminal-like interface
- Show recent command history
- Visual indicators for command status (executed/rejected)

### Admin Dashboard
- Tabs or sidebar navigation for:
  - Rules Management
  - Users Management
  - Audit Logs
  - Statistics
- Confirmation dialogs for destructive actions
- Real-time updates for credit balance changes
- Search and filter capabilities for logs

---

## 📊 Error Handling

```javascript
// Example error handling wrapper
function ErrorBoundary({ error }) {
  const errorMessages = {
    401: 'Invalid API key. Please login again.',
    403: 'You do not have permission to perform this action.',
    404: 'Resource not found.',
    500: 'Server error. Please try again later.'
  };

  return (
    <div className="error-message">
      <p>{errorMessages[error.status] || error.message}</p>
    </div>
  );
}
```

---

## 🚀 Getting Started Checklist

- [ ] Backend server is running (`npm start` in backend directory)
- [ ] Copy admin API key from console output
- [ ] Test authentication with admin API key
- [ ] Create API service in frontend
- [ ] Implement login/authentication flow
- [ ] Build member dashboard with command submission
- [ ] Build admin panel with rules and users management
- [ ] Test all API endpoints
- [ ] Add error handling and loading states
- [ ] Style the UI

---

## 📞 API Reference Quick Links

- Health Check: `GET /health`
- Authentication: `GET /auth/me`
- Submit Command: `POST /commands/submit`
- Command History: `GET /commands/history`
- List Rules: `GET /rules` (admin)
- Create Rule: `POST /rules` (admin)
- List Users: `GET /users` (admin)
- Create User: `POST /users` (admin)
- Audit Logs: `GET /logs` (admin)

For complete API documentation, see the main [README.md](README.md).
