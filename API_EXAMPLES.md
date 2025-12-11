# API Testing Examples

This file contains example requests for testing all API endpoints using **PowerShell** (Windows) and **curl** (Linux/Mac).

## 🔑 Current API Keys

```bash
# Admin API Key
ADMIN_API_KEY=749e7429863be89d1d4e013d67a2ef6feaf453240af60a6c670218d72f8857e5

# Member API Key (John Member - 50 credits)
MEMBER_API_KEY=a7e7de01e1a276d2ab036d1fb44a27e123b61817caae7cc2fc4c3d1c4c924ac3

# Base URL
BASE_URL=http://localhost:3000
```

---

## ⚡ Quick Test - Complete Workflow

**PowerShell (Windows):**
```powershell
# 1. Member submits command
$memberKey = 'a7e7de01e1a276d2ab036d1fb44a27e123b61817caae7cc2fc4c3d1c4c924ac3'
Invoke-RestMethod -Uri 'http://localhost:3000/commands/submit' -Method Post -Headers @{'x-api-key'=$memberKey; 'Content-Type'='application/json'} -Body '{"command_text":"pwd"}'

# 2. Admin views pending commands
$adminKey = '749e7429863be89d1d4e013d67a2ef6feaf453240af60a6c670218d72f8857e5'
Invoke-RestMethod -Uri 'http://localhost:3000/commands/all?status=pending' -Headers @{'x-api-key'=$adminKey}

# 3. Admin approves command (replace 1 with actual command ID)
Invoke-RestMethod -Uri 'http://localhost:3000/commands/1/approve' -Method Put -Headers @{'x-api-key'=$adminKey}

# 4. Member views history with real-time timestamps
Invoke-RestMethod -Uri 'http://localhost:3000/commands/history' -Headers @{'x-api-key'=$memberKey}
```

---

## 🔥 ADMIN WORKFLOW - Manage Member Commands

**Admin can see ALL member commands and approve/reject them in real-time:**

```powershell
$adminKey = '749e7429863be89d1d4e013d67a2ef6feaf453240af60a6c670218d72f8857e5'

# 1. View ALL commands from ALL members (real-time)
Invoke-RestMethod -Uri 'http://localhost:3000/commands/all' -Headers @{'x-api-key'=$adminKey}

# 2. View ONLY pending commands waiting for approval
Invoke-RestMethod -Uri 'http://localhost:3000/commands/all?status=pending' -Headers @{'x-api-key'=$adminKey}

# 3. View executed commands
Invoke-RestMethod -Uri 'http://localhost:3000/commands/all?status=executed' -Headers @{'x-api-key'=$adminKey}

# 4. Approve a pending command (executes it and deducts 1 credit)
Invoke-RestMethod -Uri 'http://localhost:3000/commands/3/approve' -Method Put -Headers @{'x-api-key'=$adminKey}

# 5. Reject a pending command with reason
$rejectBody = '{"reason":"Not authorized for this command"}'
Invoke-RestMethod -Uri 'http://localhost:3000/commands/3/reject' -Method Put -Headers @{'x-api-key'=$adminKey; 'Content-Type'='application/json'} -Body $rejectBody

# 6. View all members and their credits
Invoke-RestMethod -Uri 'http://localhost:3000/users' -Headers @{'x-api-key'=$adminKey}

# 7. Update member credits (give more credits)
$updateCredits = '{"credits":150}'
Invoke-RestMethod -Uri 'http://localhost:3000/users/2' -Method Put -Headers @{'x-api-key'=$adminKey; 'Content-Type'='application/json'} -Body $updateCredits
```

**Expected Response - Admin Views All Commands:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "command_text": "git status",
      "status": "pending",
      "output": "Awaiting admin approval",
      "timestamp": "2025-12-11 07:11:44",
      "user_name": "John Member",
      "user_id": 2
    },
    {
      "id": 2,
      "command_text": "ls -la",
      "status": "rejected",
      "output": "Not authorized for git commands",
      "timestamp": "2025-12-11 07:05:09",
      "user_name": "John Member",
      "user_id": 2
    },
    {
      "id": 1,
      "command_text": "pwd",
      "status": "executed",
      "output": "/home/user/workspace",
      "timestamp": "2025-12-11 07:02:40",
      "user_name": "John Member",
      "user_id": 2
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "count": 3
  }
}
```

---

## 👥 MEMBER API EXAMPLES

**Member users can submit commands and view their history:**

```powershell
$memberKey = 'a7e7de01e1a276d2ab036d1fb44a27e123b61817caae7cc2fc4c3d1c4c924ac3'

# 1. Check my credits and info
Invoke-RestMethod -Uri 'http://localhost:3000/auth/me' -Headers @{'x-api-key'=$memberKey}

# 2. Submit a command (goes to PENDING, waits for admin approval)
$cmdBody = '{"command_text":"ls -la"}'
Invoke-RestMethod -Uri 'http://localhost:3000/commands/submit' -Method Post -Headers @{'x-api-key'=$memberKey; 'Content-Type'='application/json'} -Body $cmdBody

# 3. Submit another command
$cmdBody2 = '{"command_text":"pwd"}'
Invoke-RestMethod -Uri 'http://localhost:3000/commands/submit' -Method Post -Headers @{'x-api-key'=$memberKey; 'Content-Type'='application/json'} -Body $cmdBody2

# 4. View my command history (real-time with timestamps)
Invoke-RestMethod -Uri 'http://localhost:3000/commands/history' -Headers @{'x-api-key'=$memberKey}

# 5. View recent 10 commands only
Invoke-RestMethod -Uri 'http://localhost:3000/commands/history?limit=10' -Headers @{'x-api-key'=$memberKey}
```

---

## 👑 ADMIN MEMBER MANAGEMENT

**Admin can view and manage all members, update credits:**

```powershell
$adminKey = '749e7429863be89d1d4e013d67a2ef6feaf453240af60a6c670218d72f8857e5'

# 1. View all members (see who's in the system)
Invoke-RestMethod -Uri 'http://localhost:3000/users' -Headers @{'x-api-key'=$adminKey}

# 2. Create a new member
$newMember = '{"name":"Sarah Developer","role":"member","credits":100}'
Invoke-RestMethod -Uri 'http://localhost:3000/users' -Method Post -Headers @{'x-api-key'=$adminKey; 'Content-Type'='application/json'} -Body $newMember

# 3. Update member credits (give more credits)
$updateCredits = '{"credits":200}'
Invoke-RestMethod -Uri 'http://localhost:3000/users/2' -Method Put -Headers @{'x-api-key'=$adminKey; 'Content-Type'='application/json'} -Body $updateCredits

# 4. Delete a member
Invoke-RestMethod -Uri 'http://localhost:3000/users/3' -Method Delete -Headers @{'x-api-key'=$adminKey}
```

**Expected Response - View All Members:**
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
      "name": "John Member",
      "role": "member",
      "credits": 99
    },
    {
      "id": 3,
      "name": "Sarah Developer",
      "role": "member",
      "credits": 100
    }
  ]
}
```

**Expected Response - Member History:**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "command_text": "pwd",
      "status": "pending",
      "output": "Awaiting admin approval",
      "timestamp": "2025-12-11 07:11:44"
    },
    {
      "id": 2,
      "command_text": "ls -la",
      "status": "executed",
      "output": "file1.txt\nfile2.txt\nfolder1/",
      "timestamp": "2025-12-11 07:05:09"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 2
  }
}
```

---

## Testing with curl (if available)

### 1. Health Check (No Auth Required)
```bash
curl http://localhost:3000/health
```

### 2. Get Current User Info
```bash
curl -H "x-api-key: YOUR_ADMIN_API_KEY" \
  http://localhost:3000/auth/me
```

### 3. Submit a Safe Command
```bash
curl -X POST http://localhost:3000/commands/submit \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"command_text\": \"ls -la\"}"
```

### 4. Submit a Dangerous Command (Will be rejected)
```bash
curl -X POST http://localhost:3000/commands/submit \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"command_text\": \"rm -rf /\"}"
```

### 5. Get Command History
```bash
curl -H "x-api-key: YOUR_ADMIN_API_KEY" \
  http://localhost:3000/commands/history
```

### 6. List All Rules (Admin)
```bash
curl -H "x-api-key: YOUR_ADMIN_API_KEY" \
  http://localhost:3000/rules
```

### 7. Create a New Rule (Admin)
```bash
curl -X POST http://localhost:3000/rules \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"pattern\": \"^docker\\\\s+ps\", \"action\": \"AUTO_ACCEPT\"}"
```

### 8. Update a Rule (Admin)
```bash
curl -X PUT http://localhost:3000/rules/11 \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"pattern\": \"^docker\\\\s+(ps|images)\", \"action\": \"AUTO_ACCEPT\"}"
```

### 9. Delete a Rule (Admin)
```bash
curl -X DELETE http://localhost:3000/rules/11 \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

### 10. List All Users (Admin)
```bash
curl -H "x-api-key: YOUR_ADMIN_API_KEY" \
  http://localhost:3000/users
```

### 11. Create a New User (Admin)
```bash
curl -X POST http://localhost:3000/users \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"John Doe\", \"role\": \"member\", \"credits\": 100}"
```

### 12. Update User Credits (Admin)
```bash
curl -X PUT http://localhost:3000/users/2 \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"credits\": 200}"
```

### 13. Delete a User (Admin)
```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

### 14. Regenerate User API Key (Admin)
```bash
curl -X POST http://localhost:3000/users/2/regenerate-key \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

### 15. Get Audit Logs (Admin)
```bash
curl -H "x-api-key: YOUR_ADMIN_API_KEY" \
  "http://localhost:3000/logs?limit=20"
```

### 16. Get Audit Log Statistics (Admin)
```bash
curl -H "x-api-key: YOUR_ADMIN_API_KEY" \
  http://localhost:3000/logs/stats
```

### 17. Test Invalid API Key (Should return 401)
```bash
curl -H "x-api-key: invalid_key_12345" \
  http://localhost:3000/auth/me
```

---

## Testing with PowerShell (Windows)

### 1. Health Check
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET | Select-Object -Expand Content
```

### 2. Get Current User Info
```powershell
$headers = @{ "x-api-key" = "YOUR_ADMIN_API_KEY" }
Invoke-WebRequest -Uri "http://localhost:3000/auth/me" -Method GET -Headers $headers | Select-Object -Expand Content
```

### 3. Submit a Safe Command
```powershell
$headers = @{ 
    "x-api-key" = "YOUR_ADMIN_API_KEY"
    "Content-Type" = "application/json"
}
$body = @{ command_text = "ls -la" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/commands/submit" -Method POST -Headers $headers -Body $body | Select-Object -Expand Content
```

### 4. Submit a Dangerous Command
```powershell
$headers = @{ 
    "x-api-key" = "YOUR_ADMIN_API_KEY"
    "Content-Type" = "application/json"
}
$body = @{ command_text = "rm -rf /" } | ConvertTo-Json
try {
    Invoke-WebRequest -Uri "http://localhost:3000/commands/submit" -Method POST -Headers $headers -Body $body
} catch {
    $_.Exception.Response
}
```

### 5. Get Command History
```powershell
$headers = @{ "x-api-key" = "YOUR_ADMIN_API_KEY" }
Invoke-WebRequest -Uri "http://localhost:3000/commands/history" -Method GET -Headers $headers | Select-Object -Expand Content
```

### 6. Create a New User
```powershell
$headers = @{ 
    "x-api-key" = "YOUR_ADMIN_API_KEY"
    "Content-Type" = "application/json"
}
$body = @{ 
    name = "Test User"
    role = "member"
    credits = 100
} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/users" -Method POST -Headers $headers -Body $body | Select-Object -Expand Content
```

### 7. Create a New Rule
```powershell
$headers = @{ 
    "x-api-key" = "YOUR_ADMIN_API_KEY"
    "Content-Type" = "application/json"
}
$body = @{ 
    pattern = "^npm\s+install"
    action = "AUTO_ACCEPT"
} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/rules" -Method POST -Headers $headers -Body $body | Select-Object -Expand Content
```

---

## Testing with JavaScript (Browser Console or Node.js)

### Setup
```javascript
const API_KEY = 'YOUR_ADMIN_API_KEY';
const BASE_URL = 'http://localhost:3000';

async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
}
```

### 1. Get Current User
```javascript
apiCall('GET', '/auth/me').then(console.log);
```

### 2. Submit Command
```javascript
apiCall('POST', '/commands/submit', { command_text: 'ls -la' }).then(console.log);
```

### 3. Get Command History
```javascript
apiCall('GET', '/commands/history').then(console.log);
```

### 4. Create User
```javascript
apiCall('POST', '/users', {
  name: 'New Member',
  role: 'member',
  credits: 100
}).then(console.log);
```

### 5. Create Rule
```javascript
apiCall('POST', '/rules', {
  pattern: '^git\\s+status',
  action: 'AUTO_ACCEPT'
}).then(console.log);
```

### 6. Get Audit Logs
```javascript
apiCall('GET', '/logs?limit=10').then(console.log);
```

---

## Testing with Postman

### Setup Environment Variables
1. Create a new environment in Postman
2. Add variable: `api_key` = `YOUR_ADMIN_API_KEY`
3. Add variable: `base_url` = `http://localhost:3000`

### Import Collection

Create a new collection with these requests:

#### Authentication
- **GET** `{{base_url}}/auth/me`
  - Headers: `x-api-key: {{api_key}}`

#### Commands
- **POST** `{{base_url}}/commands/submit`
  - Headers: `x-api-key: {{api_key}}`, `Content-Type: application/json`
  - Body (JSON):
    ```json
    {
      "command_text": "ls -la"
    }
    ```

- **GET** `{{base_url}}/commands/history`
  - Headers: `x-api-key: {{api_key}}`

#### Rules
- **GET** `{{base_url}}/rules`
  - Headers: `x-api-key: {{api_key}}`

- **POST** `{{base_url}}/rules`
  - Headers: `x-api-key: {{api_key}}`, `Content-Type: application/json`
  - Body (JSON):
    ```json
    {
      "pattern": "^docker\\s+ps",
      "action": "AUTO_ACCEPT"
    }
    ```

#### Users
- **GET** `{{base_url}}/users`
  - Headers: `x-api-key: {{api_key}}`

- **POST** `{{base_url}}/users`
  - Headers: `x-api-key: {{api_key}}`, `Content-Type: application/json`
  - Body (JSON):
    ```json
    {
      "name": "Test Member",
      "role": "member",
      "credits": 100
    }
    ```

#### Logs
- **GET** `{{base_url}}/logs`
  - Headers: `x-api-key: {{api_key}}`

- **GET** `{{base_url}}/logs/stats`
  - Headers: `x-api-key: {{api_key}}`

---

## Expected Responses

### Successful Command Execution
```json
{
  "success": true,
  "message": "Command executed successfully",
  "data": {
    "command_id": 1,
    "status": "executed",
    "output": "file1.txt\nfile2.txt\nfolder1/",
    "credits_remaining": 99,
    "matched_rule": "^(ls|cat|pwd|echo)"
  }
}
```

### Rejected Command
```json
{
  "success": false,
  "error": "Command rejected by security rule",
  "status": "rejected",
  "matched_rule": "rm\\s+-rf\\s+/",
  "credits": 100
}
```

### Authentication Error
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

### Insufficient Credits
```json
{
  "success": false,
  "error": "Insufficient credits. Please contact admin to add more credits.",
  "credits": 0
}
```

### Permission Denied
```json
{
  "success": false,
  "error": "Admin access required"
}
```

---

## Test Scenarios

### Scenario 1: New Member User Flow
1. Admin creates a new member user
2. Save the returned API key
3. Login with member API key
4. Check credits (should be 100)
5. Submit safe commands (ls, pwd, etc.)
6. Check credits decrease
7. View command history

### Scenario 2: Rule Testing
1. Submit command that doesn't match any rule (should reject)
2. Create new rule to accept that command
3. Submit same command again (should execute)
4. Update rule to reject
5. Submit command (should now reject)

### Scenario 3: Credit Management
1. Create user with 5 credits
2. Execute 5 commands
3. Try to execute 6th command (should fail with insufficient credits)
4. Admin updates user credits to 10
5. User can now execute more commands

### Scenario 4: Admin Operations
1. View all users
2. View all rules
3. View audit logs
4. Check audit log statistics
5. Filter logs by user or action type

---

## Troubleshooting

### Connection Refused
- **Problem**: Cannot connect to server
- **Solution**: Ensure server is running (`npm start`)

### 401 Unauthorized
- **Problem**: Invalid API key
- **Solution**: Check API key in request header

### 403 Forbidden
- **Problem**: Insufficient permissions or credits
- **Solution**: 
  - Check user role (admin vs member)
  - Check credit balance

### 500 Internal Server Error
- **Problem**: Server error
- **Solution**: Check server console logs for details

---

## Notes

- Replace `YOUR_ADMIN_API_KEY` with actual key from server console
- All POST/PUT requests require `Content-Type: application/json` header
- Admin-only routes: `/rules`, `/users`, `/logs`
- Commands cost 1 credit each when executed
- First matching rule wins in command validation
