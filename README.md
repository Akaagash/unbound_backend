# Command Gateway Backend

A secure Node.js backend API for executing system commands with API key authentication, credit management, rule-based validation, and comprehensive audit logging.

## 📋 Features

- **API Key Authentication**: Secure authentication using x-api-key header
- **Role-Based Access**: Admin and Member roles with different permissions
- **Command Credits**: Credit-based system for command execution
- **Rule Engine**: Pattern matching with AUTO_ACCEPT/AUTO_REJECT actions
- **Audit Logging**: Complete audit trail for all actions
- **Transaction Safety**: Database transactions ensure data consistency
- **Mock Execution**: Safe command mocking without real system execution

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd cmd_gateway_backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` and automatically:
- Create the SQLite database
- Set up all required tables
- Seed default admin user and rules
- Display the admin API key in the console

**Important**: Save the admin API key shown in the console - you'll need it for all admin operations!

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## 📁 Project Structure

```
cmd_gateway_backend/
├── src/
│   ├── database.js              # Database setup and seeding
│   ├── server.js                # Main Express server
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js     # Error handling middleware
│   └── routes/
│       ├── auth.js              # Authentication routes
│       ├── commands.js          # Command submission & history
│       ├── rules.js             # Rule management (admin)
│       ├── users.js             # User management (admin)
│       └── logs.js              # Audit log routes (admin)
├── package.json
├── .gitignore
└── README.md
```

## 🔐 Authentication

All API requests (except `/health` and `/`) require an `x-api-key` header:

```bash
curl -H "x-api-key: YOUR_API_KEY_HERE" http://localhost:3000/auth/me
```

### Default Credentials

After starting the server, check the console output for the default admin API key:
```
=== DEFAULT ADMIN CREATED ===
Name: Admin User
API Key: [64-character hex string]
Role: admin
Credits: 1000
==============================
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Health Check

#### GET /health
Check if the API is running (no authentication required).

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "success": true,
  "message": "Command Gateway API is running",
  "timestamp": "2025-12-11T10:00:00.000Z"
}
```

---

### Authentication

#### GET /auth/me
Get current user details based on API key.

```bash
curl -H "x-api-key: YOUR_API_KEY" http://localhost:3000/auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "role": "admin",
    "credits": 1000
  }
}
```

---

### Commands

#### POST /commands/submit
Submit a command for execution.

```bash
curl -X POST http://localhost:3000/commands/submit \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"command_text": "ls -la"}'
```

**Request Body:**
```json
{
  "command_text": "ls -la"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Command executed successfully",
  "data": {
    "command_id": 1,
    "status": "executed",
    "output": "file1.txt\nfile2.txt\nfolder1/\nfolder2/",
    "credits_remaining": 99,
    "matched_rule": "^(ls|cat|pwd|echo)"
  }
}
```

**Rejection Response:**
```json
{
  "success": false,
  "error": "Command rejected by security rule",
  "status": "rejected",
  "matched_rule": "rm\\s+-rf\\s+/",
  "credits": 100
}
```

**Flow:**
1. Validates user has credits > 0
2. Matches command against rules (first match wins)
3. If AUTO_REJECT: rejects and logs
4. If AUTO_ACCEPT: executes (mocked), deducts credits, logs
5. All operations use a transaction for consistency

#### GET /commands/history
Get command history for the authenticated user.

```bash
curl -H "x-api-key: YOUR_API_KEY" http://localhost:3000/commands/history
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "command_text": "ls -la",
      "status": "executed",
      "output": "file1.txt\nfile2.txt\n...",
      "timestamp": "2025-12-11 10:00:00"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

---

### Rules (Admin Only)

#### GET /rules
List all rules.

```bash
curl -H "x-api-key: ADMIN_API_KEY" http://localhost:3000/rules
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "pattern": "rm\\s+-rf\\s+/",
      "action": "AUTO_REJECT"
    },
    {
      "id": 2,
      "pattern": "^(ls|cat|pwd|echo)",
      "action": "AUTO_ACCEPT"
    }
  ]
}
```

#### POST /rules
Create a new rule.

```bash
curl -X POST http://localhost:3000/rules \
  -H "x-api-key: ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "^docker\\s+ps",
    "action": "AUTO_ACCEPT"
  }'
```

**Request Body:**
```json
{
  "pattern": "^docker\\s+ps",
  "action": "AUTO_ACCEPT"
}
```

**Validation:**
- Pattern must be valid regex
- Action must be AUTO_ACCEPT or AUTO_REJECT

**Response:**
```json
{
  "success": true,
  "message": "Rule created successfully",
  "data": {
    "id": 11,
    "pattern": "^docker\\s+ps",
    "action": "AUTO_ACCEPT"
  }
}
```

#### PUT /rules/:id
Update an existing rule.

```bash
curl -X PUT http://localhost:3000/rules/11 \
  -H "x-api-key: ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "^docker\\s+(ps|images)",
    "action": "AUTO_ACCEPT"
  }'
```

#### DELETE /rules/:id
Delete a rule.

```bash
curl -X DELETE http://localhost:3000/rules/11 \
  -H "x-api-key: ADMIN_API_KEY"
```

---

### Users (Admin Only)

#### GET /users
List all users (without API keys).

```bash
curl -H "x-api-key: ADMIN_API_KEY" http://localhost:3000/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "role": "admin",
      "credits": 1000
    },
    {
      "id": 2,
      "name": "John Doe",
      "role": "member",
      "credits": 100
    }
  ]
}
```

#### POST /users
Create a new user.

```bash
curl -X POST http://localhost:3000/users \
  -H "x-api-key: ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "role": "member",
    "credits": 100
  }'
```

**Request Body:**
```json
{
  "name": "John Doe",
  "role": "member",
  "credits": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully. Save the API key - it will not be shown again!",
  "data": {
    "id": 2,
    "name": "John Doe",
    "role": "member",
    "credits": 100,
    "api_key": "a1b2c3d4e5f6..." 
  }
}
```

**Important**: The API key is only shown once during creation!

#### PUT /users/:id
Update a user's details.

```bash
curl -X PUT http://localhost:3000/users/2 \
  -H "x-api-key: ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "credits": 200
  }'
```

**Request Body (all optional):**
```json
{
  "name": "Jane Doe",
  "role": "admin",
  "credits": 200
}
```

#### DELETE /users/:id
Delete a user.

```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "x-api-key: ADMIN_API_KEY"
```

**Note**: Cannot delete your own account.

#### POST /users/:id/regenerate-key
Regenerate a user's API key.

```bash
curl -X POST http://localhost:3000/users/2/regenerate-key \
  -H "x-api-key: ADMIN_API_KEY"
```

**Response:**
```json
{
  "success": true,
  "message": "API key regenerated successfully. Save it - it will not be shown again!",
  "data": {
    "api_key": "new_generated_key_here..."
  }
}
```

---

### Audit Logs (Admin Only)

#### GET /logs
Fetch audit logs.

```bash
curl -H "x-api-key: ADMIN_API_KEY" http://localhost:3000/logs
```

**Query Parameters:**
- `limit` (optional): Number of records (default: 100)
- `offset` (optional): Offset for pagination (default: 0)
- `user_id` (optional): Filter by user ID
- `action_type` (optional): Filter by action type

**Example with filters:**
```bash
curl -H "x-api-key: ADMIN_API_KEY" \
  "http://localhost:3000/logs?user_id=2&action_type=COMMAND_EXECUTED&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "user_name": "John Doe",
      "action_type": "COMMAND_EXECUTED",
      "details": {
        "command": "ls -la",
        "command_id": 1,
        "matched_rule": "^(ls|cat|pwd|echo)",
        "credits_deducted": 1
      },
      "timestamp": "2025-12-11 10:00:00"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "count": 1
  }
}
```

#### GET /logs/stats
Get audit log statistics.

```bash
curl -H "x-api-key: ADMIN_API_KEY" http://localhost:3000/logs/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_logs": 150,
    "commands_executed": 80,
    "commands_rejected": 15,
    "recent_activity": [
      {
        "action_type": "COMMAND_EXECUTED",
        "count": 45
      },
      {
        "action_type": "COMMAND_REJECTED",
        "count": 8
      }
    ]
  }
}
```

---

## 🔒 Default Rules

The system comes pre-configured with these rules:

### AUTO_REJECT (Dangerous Commands)
- `:(){ :|:& };:` - Fork bomb
- `rm\s+-rf\s+/` - Recursive root deletion
- `mkfs\.` - File system formatting
- `dd\s+if=/dev/(zero|random)\s+of=/dev/` - Disk wiping
- `sudo\s+rm\s+-rf\s+/` - Privileged deletion

### AUTO_ACCEPT (Safe Commands)
- `git\s+(status|log|diff)` - Git read operations
- `^(ls|cat|pwd|echo)` - Basic file operations
- `^date$` - Date command
- `^whoami$` - User info
- `^hostname$` - Hostname

---

## 🧪 Testing Examples

### 1. Test Authentication
```bash
# Should work
curl -H "x-api-key: YOUR_API_KEY" http://localhost:3000/auth/me

# Should fail with 401
curl -H "x-api-key: invalid_key" http://localhost:3000/auth/me
```

### 2. Test Command Execution
```bash
# Safe command - should execute
curl -X POST http://localhost:3000/commands/submit \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"command_text": "ls -la"}'

# Dangerous command - should reject
curl -X POST http://localhost:3000/commands/submit \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"command_text": "rm -rf /"}'
```

### 3. Test Admin Operations
```bash
# Create a new member user
curl -X POST http://localhost:3000/users \
  -H "x-api-key: ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "role": "member",
    "credits": 50
  }'

# Create a new rule
curl -X POST http://localhost:3000/rules \
  -H "x-api-key: ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "^npm\\s+install",
    "action": "AUTO_ACCEPT"
  }'
```

### 4. Test Permission Denied
```bash
# Member trying to access admin route - should fail with 403
curl -H "x-api-key: MEMBER_API_KEY" http://localhost:3000/users
```

---

## 🛠️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'member')),
  credits INTEGER NOT NULL DEFAULT 100
);
```

### Rules Table
```sql
CREATE TABLE rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('AUTO_ACCEPT', 'AUTO_REJECT'))
);
```

### Commands Table
```sql
CREATE TABLE commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  command_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('accepted', 'rejected', 'executed')),
  output TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔄 Transaction Safety

All write operations that affect multiple tables use database transactions:

**Command Execution Transaction:**
1. Insert command record
2. Deduct user credits
3. Create audit log
4. Commit (or rollback if any step fails)

This ensures data consistency - credits are never deducted without a corresponding command record and audit log.

---

## ⚠️ Error Handling

All endpoints return consistent JSON error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing API key)
- `403` - Forbidden (insufficient permissions or credits)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Audit Log Action Types

- `COMMAND_EXECUTED` - Command was successfully executed
- `COMMAND_REJECTED` - Command was rejected
- `USER_CREATED` - New user was created
- `USER_UPDATED` - User details were updated
- `USER_DELETED` - User was deleted
- `API_KEY_REGENERATED` - User's API key was regenerated
- `RULE_CREATED` - New rule was created
- `RULE_UPDATED` - Rule was updated
- `RULE_DELETED` - Rule was deleted

---

## 🚀 Integration with Frontend

To integrate with your `cmd_gateway_frontend`, you'll need to:

1. **Configure API Base URL** in your frontend:
   ```javascript
   const API_BASE_URL = 'http://localhost:3000';
   ```

2. **Store API Key** securely (localStorage or sessionStorage):
   ```javascript
   localStorage.setItem('apiKey', 'your_api_key_here');
   ```

3. **Add API Key to all requests**:
   ```javascript
   fetch(`${API_BASE_URL}/auth/me`, {
     headers: {
       'x-api-key': localStorage.getItem('apiKey'),
       'Content-Type': 'application/json'
     }
   });
   ```

4. **Handle CORS**: The backend already has CORS enabled via `cors` middleware.

---

## 🔧 Configuration

### Port Configuration
Change the port by setting the `PORT` environment variable:
```bash
PORT=5000 npm start
```

### Database Location
The SQLite database is stored at `./gateway.db` (in the project root).

---

## 📦 Dependencies

- **express** - Web framework
- **sqlite3** - SQLite database driver
- **cors** - CORS middleware
- **crypto** - API key generation (built-in Node.js module)

---

## 🐛 Troubleshooting

### Issue: "Database locked" error
**Solution**: SQLite only allows one write operation at a time. This is handled by transactions, but if you see this error, ensure you're not running multiple instances of the server.

### Issue: "Cannot find module"
**Solution**: Run `npm install` to install all dependencies.

### Issue: Lost admin API key
**Solution**: Delete `gateway.db` and restart the server. A new admin user with a new API key will be created.

---

## 📖 Additional Notes

- **Command Execution**: Commands are mocked and not actually executed for security
- **Credit System**: Each command execution costs 1 credit
- **Rule Matching**: First matching rule wins (rules are evaluated in order by ID)
- **Regex Validation**: All rule patterns are validated before saving
- **API Key Security**: API keys are 64-character hexadecimal strings (256-bit entropy)

---

## 🎯 Next Steps

1. **Start the server**: `npm start`
2. **Copy the admin API key** from console
3. **Test basic authentication**: `curl -H "x-api-key: YOUR_KEY" http://localhost:3000/auth/me`
4. **Create a member user** for testing different permissions
5. **Submit test commands** to see the rule engine in action
6. **Integrate with frontend** in `cmd_gateway_frontend`

---

## 📞 Support

For issues or questions, please check:
1. Console logs for detailed error messages
2. API response error messages
3. This README for endpoint documentation

---

**Built with ❤️ for secure command execution**
