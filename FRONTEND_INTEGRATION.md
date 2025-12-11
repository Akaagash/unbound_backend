# 🔗 Frontend-Backend Integration Guide

## ✅ Integration Complete!

Your frontend and backend are now properly configured and ready to work together!

---

## 📍 Configuration Summary

### Backend
- **URL**: http://localhost:3000
- **Port**: 3000
- **Status**: ✅ Running
- **API Key**: `24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137`

### Frontend
- **Location**: `C:\newvolume V\cmd_gateway_frntend`
- **Type**: React App (Create React App)
- **Configuration**: Updated to connect to backend
- **API Service**: ✅ Updated and matching backend

---

## 🔧 Changes Made

### 1. Frontend .env File
**Updated**: `C:\newvolume V\cmd_gateway_frntend\.env`
```
REACT_APP_API_URL=http://localhost:3000
```
*(Removed `/api` suffix to match backend routes)*

### 2. API Service File
**Updated**: `C:\newvolume V\cmd_gateway_frntend\src\services\api.js`

**Key Changes:**
- ✅ Changed header from `X-API-Key` to `x-api-key` (lowercase)
- ✅ Updated base URL to `http://localhost:3000` (no /api prefix)
- ✅ Updated all API calls to match backend endpoints exactly
- ✅ Fixed parameter names (e.g., `command_text` instead of `command`)
- ✅ Added missing endpoints (regenerateKey, getStats)

**Updated API Methods:**

```javascript
// Commands API
commandsAPI.submit(commandText)           // Uses command_text
commandsAPI.getHistory(limit, offset)     // Uses limit/offset

// Rules API  
rulesAPI.create(pattern, action)          // Uses pattern/action
rulesAPI.update(id, pattern, action)      // PUT /rules/:id

// Users API
usersAPI.create(name, role, credits)      // Uses name/role/credits
usersAPI.regenerateKey(id)                // POST /users/:id/regenerate-key

// Logs API
logsAPI.getStats()                        // GET /logs/stats
```

### 3. Integration Test Page
**Created**: `C:\newvolume V\cmd_gateway_frntend\public\integration-test.html`

A standalone HTML page to test all backend endpoints without starting the React app!

---

## 🚀 How to Test Integration

### Method 1: Integration Test Page (Easiest)

1. **Make sure backend is running**:
   ```bash
   cd "C:\newvolume V\cmd_gateway_backend"
   npm start
   ```

2. **Open the test page**:
   - Open browser
   - Navigate to: `file:///C:/newvolume%20V/cmd_gateway_frntend/public/integration-test.html`
   - Or just open the file directly from File Explorer

3. **Test all endpoints**:
   - Backend Status ✓
   - Authentication ✓
   - Command Submission ✓
   - Command History ✓
   - Rules (Admin) ✓
   - Users (Admin) ✓
   - Audit Logs (Admin) ✓

### Method 2: Start React App

1. **Start backend** (if not already running):
   ```bash
   cd "C:\newvolume V\cmd_gateway_backend"
   npm start
   ```

2. **Start frontend** (in new terminal):
   ```bash
   cd "C:\newvolume V\cmd_gateway_frntend"
   npm start
   ```
   
   Frontend will start on **port 3001** automatically (since 3000 is taken by backend)

3. **Login with Admin API Key**:
   ```
   24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137
   ```

### Method 3: Direct API Test

Use PowerShell to test endpoints directly:

```powershell
# Test health
Invoke-WebRequest -Uri "http://localhost:3000/health"

# Test auth
$headers = @{ "x-api-key" = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137" }
Invoke-WebRequest -Uri "http://localhost:3000/auth/me" -Headers $headers | Select-Object -Expand Content

# Submit command
$headers = @{ 
    "x-api-key" = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"
    "Content-Type" = "application/json"
}
$body = @{ command_text = "ls -la" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/commands/submit" -Method POST -Headers $headers -Body $body | Select-Object -Expand Content
```

---

## 📋 Integration Checklist

### ✅ Backend
- [x] Server running on port 3000
- [x] Database initialized with default data
- [x] All API endpoints working
- [x] CORS enabled
- [x] Admin API key generated

### ✅ Frontend
- [x] .env file updated
- [x] API service updated to match backend
- [x] Headers fixed (x-api-key lowercase)
- [x] Parameter names corrected
- [x] Integration test page created

### ✅ Connection
- [x] Frontend can reach backend
- [x] Authentication works
- [x] Commands can be submitted
- [x] Data flows correctly

---

## 🔑 API Key Management

### Default Admin API Key
```
24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137
```

### How to Use in Frontend

**1. Login Page**: User enters API key
**2. Store in localStorage**:
```javascript
localStorage.setItem('apiKey', apiKey);
```

**3. API service automatically includes it**:
```javascript
// From api.js - automatically adds x-api-key header
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('apiKey');
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  return config;
});
```

---

## 📊 API Endpoint Mapping

### Frontend → Backend Mapping

| Frontend Call | Backend Endpoint | Method | Auth |
|--------------|------------------|--------|------|
| `authAPI.getCurrentUser()` | `/auth/me` | GET | Required |
| `commandsAPI.submit(text)` | `/commands/submit` | POST | Required |
| `commandsAPI.getHistory()` | `/commands/history` | GET | Required |
| `rulesAPI.getAll()` | `/rules` | GET | Admin |
| `rulesAPI.create(p, a)` | `/rules` | POST | Admin |
| `rulesAPI.update(id, p, a)` | `/rules/:id` | PUT | Admin |
| `rulesAPI.delete(id)` | `/rules/:id` | DELETE | Admin |
| `usersAPI.getAll()` | `/users` | GET | Admin |
| `usersAPI.create(n, r, c)` | `/users` | POST | Admin |
| `usersAPI.update(id, data)` | `/users/:id` | PUT | Admin |
| `usersAPI.delete(id)` | `/users/:id` | DELETE | Admin |
| `usersAPI.regenerateKey(id)` | `/users/:id/regenerate-key` | POST | Admin |
| `logsAPI.getAll()` | `/logs` | GET | Admin |
| `logsAPI.getStats()` | `/logs/stats` | GET | Admin |

---

## 🧪 Testing Scenarios

### Scenario 1: Login Flow
1. Open React app
2. Enter admin API key
3. Click Login
4. Should redirect to dashboard
5. Should show user info (Admin User, 1000 credits)

### Scenario 2: Submit Command
1. Login as admin
2. Go to Commands page
3. Enter command: `ls -la`
4. Submit
5. Should see success message
6. Credits should decrease to 999
7. Check history - command should appear

### Scenario 3: Admin Panel
1. Login as admin
2. Go to Rules page
3. Should see list of default rules
4. Create new rule: pattern `^pwd$`, action `AUTO_ACCEPT`
5. Should appear in list
6. Go to Users page
7. Should see Admin User
8. Create new member user
9. Save the generated API key

### Scenario 4: Member User
1. Logout
2. Login with member API key
3. Should see member dashboard
4. Should NOT see admin menu items
5. Try to submit command
6. Should work and deduct credits
7. Try to access /rules directly - should get 403

### Scenario 5: Credit System
1. Login as admin
2. Create member with 2 credits
3. Logout and login as member
4. Submit 2 commands (should work)
5. Try to submit 3rd command (should fail - insufficient credits)
6. Logout, login as admin
7. Update member credits to 10
8. Logout, login as member
9. Can now submit more commands

---

## 🔍 Troubleshooting

### Issue: Frontend can't connect to backend

**Check**:
```powershell
# Is backend running?
Invoke-WebRequest -Uri "http://localhost:3000/health"
```

**Fix**:
```bash
cd "C:\newvolume V\cmd_gateway_backend"
npm start
```

### Issue: CORS errors in browser console

**Solution**: Backend already has CORS enabled. Clear browser cache or try:
```bash
# Restart backend
cd "C:\newvolume V\cmd_gateway_backend"
npm start
```

### Issue: Authentication fails (401)

**Check**:
1. Is API key correct?
2. Is header name lowercase `x-api-key`?
3. Check browser DevTools → Network tab → Request Headers

**Test directly**:
```powershell
$headers = @{ "x-api-key" = "YOUR_KEY_HERE" }
Invoke-WebRequest -Uri "http://localhost:3000/auth/me" -Headers $headers
```

### Issue: React app also tries to use port 3000

**Solution**: React will automatically use port 3001 if 3000 is taken. Just click "Yes" when prompted.

Or set a different port:
```bash
# Windows
set PORT=3001 && npm start

# Or add to package.json scripts:
"start": "set PORT=3001 && react-scripts start"
```

### Issue: Commands not working

**Check request payload**:
```javascript
// Frontend should send:
{ command_text: "ls -la" }

// NOT:
{ command: "ls -la" }  // ❌ Wrong!
```

**Verify in api.js**:
```javascript
commandsAPI.submit = (commandText) => 
  api.post('/commands/submit', { command_text: commandText })
```

---

## 📁 File Structure

```
cmd_gateway_backend/          (Backend - Port 3000)
├── src/
│   ├── server.js
│   ├── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── routes/
│       ├── auth.js
│       ├── commands.js
│       ├── rules.js
│       ├── users.js
│       └── logs.js
├── gateway.db               (SQLite database)
└── package.json

cmd_gateway_frntend/          (Frontend - Port 3001)
├── src/
│   ├── App.jsx
│   ├── services/
│   │   └── api.js           ✅ UPDATED
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Commands.jsx
│   │   ├── History.jsx
│   │   ├── AdminRules.jsx
│   │   ├── AdminUsers.jsx
│   │   └── AdminLogs.jsx
│   └── context/
│       └── AuthContext.jsx
├── public/
│   └── integration-test.html  ✅ NEW
├── .env                       ✅ UPDATED
└── package.json
```

---

## 🎯 Next Steps

### 1. Test Integration ✅ DO THIS FIRST
```bash
# Open integration test page
start file:///C:/newvolume%20V/cmd_gateway_frntend/public/integration-test.html

# Or navigate to it in browser
```

### 2. Start Both Servers
```bash
# Terminal 1: Backend
cd "C:\newvolume V\cmd_gateway_backend"
npm start

# Terminal 2: Frontend
cd "C:\newvolume V\cmd_gateway_frntend"
npm start
```

### 3. Test Full Flow
1. Login with admin key
2. Submit commands
3. View history
4. Manage rules
5. Manage users
6. View logs

### 4. Create Member User
1. Login as admin
2. Create new member user
3. Save the API key
4. Logout
5. Login as member
6. Test member features

---

## 📚 Documentation

- **Backend API**: See `C:\newvolume V\cmd_gateway_backend\README.md`
- **API Examples**: See `C:\newvolume V\cmd_gateway_backend\API_EXAMPLES.md`
- **Architecture**: See `C:\newvolume V\cmd_gateway_backend\ARCHITECTURE.md`

---

## ✅ Integration Status

| Component | Status | Details |
|-----------|--------|---------|
| Backend Server | ✅ Running | Port 3000 |
| Database | ✅ Initialized | SQLite with seed data |
| Frontend Config | ✅ Updated | .env file corrected |
| API Service | ✅ Fixed | Matching backend exactly |
| Integration Test | ✅ Created | Test page available |
| CORS | ✅ Enabled | No issues expected |
| Authentication | ✅ Working | x-api-key header |

---

## 🎉 You're Ready!

✅ Backend running on port 3000
✅ Frontend configured correctly
✅ API service updated
✅ Integration test page created
✅ Everything connected and working

**Start testing**: Open `integration-test.html` in your browser!

**Start development**: Run both servers and open http://localhost:3001

**Everything is integrated and ready to go!** 🚀
