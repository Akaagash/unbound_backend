# COMMAND GATEWAY - COMPLETE APPROVAL WORKFLOW 

##  WHAT'S BEEN IMPLEMENTED

### Backend Changes (Port 3000)

1. **NEW: Pending Status Support**
   - Commands without specific rules now go to "pending" status
   - Rules can be set to `REQUIRE_APPROVAL` to force pending

2. **NEW: Admin Approval Endpoints**
   - `GET /commands/all` - View all commands from all users
   - `GET /commands/all?status=pending` - Filter by status
   - `PUT /commands/:id/approve` - Approve and execute
   - `PUT /commands/:id/reject` - Reject with reason

3. **Command Status Flow**
   ```
   Member Submits  Rule Check 
       AUTO_ACCEPT   Executed immediately
       AUTO_REJECT   Rejected immediately
       REQUIRE_APPROVAL  Pending (awaits admin)
   
   Pending  Admin Action 
       Approve  Executed + Credits Deducted
       Reject   Rejected + Reason logged
   ```

### Frontend Changes (Port 3001)

1. **NEW: Admin Commands Page** (`/admin/commands`)
   - View ALL user commands in a table
   - Filter by status (All/Pending/Executed/Rejected)
   - Approve/Reject buttons for pending commands
   - Shows user name, command, timestamp, output
   - Real-time refresh button

2. **Updated: Member History Page** (`/history`)
   - Now shows correct command status
   - Displays command_text, status badge, timestamp, output
   - Matches backend API response structure

3. **Updated: Commands Page** (`/commands`)
   - Submit command form
   - Shows recent commands with status
   - Polls for updates every 5 seconds

4. **Fixed: Navigation**
   - Admin navbar now includes "Commands" link
   - Routes to `/admin/commands`

5. **Fixed: User Display**
   - Dashboard shows `user.name` (not username)
   - Navbar shows `user.name`
   - Credits display correctly

##  HOW TO USE

### For Members:

1. **Login** with your API key
2. **Dashboard** - See your credits and stats
3. **Submit Command** - Enter command, click submit
4. **View Status** - Check History page for:
   -  Pending (waiting for admin)
   -  Executed (approved and run)
   -  Rejected (denied by admin or rule)

### For Admins:

1. **Login** with admin API key
2. **Admin Dashboard** - Overview of system
3. **Commands Page** (`/admin/commands`):
   - See ALL member commands
   - Filter to show only "Pending"
   - Click " Approve" to execute
   - Click " Reject" to deny
4. **Users Page** - Manage credits, create users
5. **Rules Page** - Configure auto-accept/reject patterns
6. **Logs Page** - View audit logs

##  TESTING GUIDE

### Test 1: Member Submits Command

```powershell
$memberKey = "10c6a348e8bfb66ac5a181721a6e65c1e0ea0925115a48b83f7285512381a3c9"

# Submit a command
Invoke-RestMethod -Uri "http://localhost:3000/commands/submit" `
  -Method POST `
  -Headers @{"x-api-key"=$memberKey; "Content-Type"="application/json"} `
  -Body '{"command_text":"test command"}'

# Expected: Status = "pending" or "executed" (depends on rules)
```

### Test 2: Admin Views All Commands

```powershell
$adminKey = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"

# Get all commands
$all = Invoke-RestMethod -Uri "http://localhost:3000/commands/all" `
  -Headers @{"x-api-key"=$adminKey}

$all.data | Format-Table id, user_name, command_text, status

# Get only pending
$pending = Invoke-RestMethod -Uri "http://localhost:3000/commands/all?status=pending" `
  -Headers @{"x-api-key"=$adminKey}

$pending.data | Format-Table id, user_name, command_text
```

### Test 3: Admin Approves Command

```powershell
$commandId = 8  # Replace with actual command ID

# Approve
Invoke-RestMethod -Uri "http://localhost:3000/commands/$commandId/approve" `
  -Method PUT `
  -Headers @{"x-api-key"=$adminKey; "Content-Type"="application/json"}

# Expected: Command executed, credits deducted, status = "executed"
```

### Test 4: Admin Rejects Command

```powershell
$commandId = 9  # Replace with actual command ID

# Reject
Invoke-RestMethod -Uri "http://localhost:3000/commands/$commandId/reject" `
  -Method PUT `
  -Headers @{"x-api-key"=$adminKey; "Content-Type"="application/json"} `
  -Body '{"reason":"Security risk"}'

# Expected: Command rejected, no credits deducted, status = "rejected"
```

##  START THE SYSTEM

### Terminal 1: Backend
```bash
cd "C:\newvolume V\cmd_gateway_backend"
npm start
```

### Terminal 2: Frontend
```bash
cd "C:\newvolume V\cmd_gateway_frntend"
npm start
```

### Browser
```
Open: http://localhost:3001
```

##  USER ACCOUNTS

### Admin
- **Name:** Admin User
- **API Key:** `24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137`
- **Credits:** 997
- **Can:** Everything + approve/reject commands

### Member 1 (John)
- **Name:** John Member
- **API Key:** `10c6a348e8bfb66ac5a181721a6e65c1e0ea0925115a48b83f7285512381a3c9`
- **Credits:** 49
- **Can:** Submit commands, view own history

### Member 2 (Sarah)
- **Name:** Sarah Member
- **API Key:** `83533a89fca5c749043dc52cbde1cf00167aaa5ef465387b59fe303b71e806b7`
- **Credits:** 100
- **Can:** Submit commands, view own history

##  DATABASE SCHEMA

### Commands Table
```
id INTEGER PRIMARY KEY
user_id INTEGER (foreign key)
command_text TEXT
status TEXT (pending/executed/rejected)
output TEXT
timestamp DATETIME
```

### Status Values:
- **pending** - Awaiting admin approval
- **executed** - Successfully run
- **rejected** - Denied by admin or rule

##  SUMMARY

 Backend has approval endpoints
 Frontend has admin commands page
 Members see their command status
 Admins can approve/reject
 Credits deducted only on approval
 All data stored in database
 Audit logs track all actions

Everything is ready to use! Just start both servers and refresh your browser.
