# 🚀 QUICK START GUIDE

## ✅ Backend is Ready!

Your Command Gateway backend is **fully implemented and running** on `http://localhost:3000`

---

## 🔑 Default Admin Credentials

**API Key**: `24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137`

**⚠️ SAVE THIS KEY!** You'll need it for all API requests.

---

## 🎯 What's Implemented

✅ **Authentication System** (API key-based)
✅ **User Management** (Admin & Member roles)
✅ **Command Submission & Execution** (Mock execution, no real commands)
✅ **Credit System** (Track and deduct credits)
✅ **Rule Engine** (Regex pattern matching with AUTO_ACCEPT/AUTO_REJECT)
✅ **Command History** (Per-user history tracking)
✅ **Audit Logging** (Complete audit trail)
✅ **Transaction Safety** (Database transactions for consistency)
✅ **Error Handling** (Consistent JSON error responses)
✅ **CORS Enabled** (Ready for frontend integration)

---

## 📦 Files Created

### Core Backend Files
- `src/server.js` - Main Express server
- `src/database.js` - Database setup & seeding
- `src/middleware/auth.js` - Authentication middleware
- `src/middleware/errorHandler.js` - Error handling
- `src/routes/auth.js` - Auth endpoints
- `src/routes/commands.js` - Command endpoints
- `src/routes/rules.js` - Rule management (admin)
- `src/routes/users.js` - User management (admin)
- `src/routes/logs.js` - Audit logs (admin)

### Documentation Files
- `README.md` - Complete API documentation (📖 **START HERE**)
- `INTEGRATION_GUIDE.md` - Frontend integration guide
- `API_EXAMPLES.md` - Testing examples for all endpoints
- `PROJECT_SUMMARY.md` - Project overview
- `ARCHITECTURE.md` - System architecture diagrams
- `QUICKSTART.md` - This file!

### Configuration Files
- `package.json` - Dependencies & scripts
- `.gitignore` - Git ignore rules

### Test Files
- `test-api.js` - JavaScript test script
- `test-api.ps1` - PowerShell test script

---

## 🚀 Start the Server

### First Time Setup
```bash
cd cmd_gateway_backend
npm install
npm start
```

### Already Installed
```bash
npm start
```

Server will start on: `http://localhost:3000`

---

## 🧪 Test the API

### Method 1: Browser
Open your browser and visit:
```
http://localhost:3000/health
```

### Method 2: PowerShell
```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:3000/health" | Select-Object -Expand Content

# Test authentication
$headers = @{ "x-api-key" = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137" }
Invoke-WebRequest -Uri "http://localhost:3000/auth/me" -Headers $headers | Select-Object -Expand Content

# Submit a command
$headers = @{ 
    "x-api-key" = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"
    "Content-Type" = "application/json"
}
$body = @{ command_text = "ls -la" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/commands/submit" -Method POST -Headers $headers -Body $body | Select-Object -Expand Content
```

### Method 3: Run Test Script
```powershell
.\test-api.ps1
```

---

## 📚 API Endpoints Quick Reference

### Public Endpoints (No Auth)
- `GET /health` - Health check
- `GET /` - API info

### Authentication
- `GET /auth/me` - Get current user info

### Commands (All Users)
- `POST /commands/submit` - Submit command for execution
- `GET /commands/history` - Get command history

### Rules (Admin Only)
- `GET /rules` - List all rules
- `POST /rules` - Create rule
- `GET /rules/:id` - Get specific rule
- `PUT /rules/:id` - Update rule
- `DELETE /rules/:id` - Delete rule

### Users (Admin Only)
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:id` - Get specific user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/regenerate-key` - Regenerate API key

### Audit Logs (Admin Only)
- `GET /logs` - Get audit logs
- `GET /logs/stats` - Get statistics

**📖 For detailed API documentation, see [README.md](README.md)**

---

## 🔌 Frontend Integration Steps

### 1. Configure API Base URL
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

### 2. Create API Service
Use the examples in [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

### 3. Build UI Components
- Login page (API key input)
- Member dashboard (command submission, history)
- Admin panel (rules, users, logs management)

### 4. Add Authentication Flow
- Store API key in localStorage
- Add `x-api-key` header to all requests
- Handle 401/403 errors

**📖 For complete integration guide, see [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)**

---

## 🎨 Example Frontend Request

```javascript
// Example: Submit a command
async function submitCommand(commandText, apiKey) {
  const response = await fetch('http://localhost:3000/commands/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      command_text: commandText
    })
  });
  
  return response.json();
}

// Usage
const result = await submitCommand('ls -la', 'YOUR_API_KEY');
console.log(result);
```

---

## 🔐 Default Seeded Data

### Admin User
- Name: Admin User
- API Key: `24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137`
- Role: admin
- Credits: 1000

### Default Rules
**Dangerous Commands (AUTO_REJECT):**
- Fork bomb: `:(){ :|:& };:`
- Delete root: `rm\s+-rf\s+/`
- Format disk: `mkfs\.`
- Wipe disk: `dd\s+if=/dev/(zero|random)\s+of=/dev/`

**Safe Commands (AUTO_ACCEPT):**
- Git read: `git\s+(status|log|diff)`
- Basic: `^(ls|cat|pwd|echo)`
- Date: `^date$`
- User: `^whoami$`
- Host: `^hostname$`

---

## 📂 Database

**Type**: SQLite
**Location**: `./gateway.db` (auto-created)
**Tables**: Users, Rules, Commands, AuditLogs

---

## 🛠️ Common Tasks

### Create a New Member User (Admin)
```bash
POST /users
{
  "name": "John Doe",
  "role": "member",
  "credits": 100
}
```

### Submit a Command
```bash
POST /commands/submit
{
  "command_text": "ls -la"
}
```

### Add a New Rule (Admin)
```bash
POST /rules
{
  "pattern": "^npm\\s+install",
  "action": "AUTO_ACCEPT"
}
```

---

## 🐛 Troubleshooting

### Server won't start
**Check**: Is port 3000 already in use?
**Fix**: Kill the process or use a different port:
```bash
PORT=5000 npm start
```

### 401 Unauthorized
**Check**: Is the API key correct?
**Fix**: Verify the API key matches the one in the console output

### 403 Forbidden
**Check**: Does your user have the right permissions?
**Fix**: 
- Admin routes require admin role
- Member trying to access admin route = 403

### Database errors
**Check**: Is the database corrupted?
**Fix**: Delete `gateway.db` and restart the server

---

## 📈 Next Steps

1. ✅ **Backend is running** ← YOU ARE HERE
2. 🎨 **Build your frontend** in `cmd_gateway_frontend`
3. 🔗 **Integrate** frontend with backend (use INTEGRATION_GUIDE.md)
4. 🧪 **Test** all features
5. 🎥 **Create demo video**
6. 📤 **Submit** to GitHub

---

## 📖 Documentation Index

| File | Description |
|------|-------------|
| [README.md](README.md) | Complete API documentation |
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | Frontend integration guide with code examples |
| [API_EXAMPLES.md](API_EXAMPLES.md) | Testing examples for all endpoints |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | High-level project overview |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture & flow diagrams |
| [QUICKSTART.md](QUICKSTART.md) | This quick start guide |

---

## 🎉 You're Ready!

✅ Backend is complete and running
✅ All features implemented
✅ Comprehensive documentation provided
✅ Ready for frontend integration

**Start with:** [README.md](README.md) for complete API documentation

**Then:** [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) to integrate with your frontend

**Good luck with your project!** 🚀

---

## 📞 Need Help?

All documentation is in this folder:
- Read [README.md](README.md) for API details
- Read [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for frontend integration
- Read [API_EXAMPLES.md](API_EXAMPLES.md) for testing examples
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design

**Everything you need is documented!** 📚
