# 🔑 API KEYS FOR ALL USERS

## 📊 USER ACCOUNTS

### 👑 ADMIN USER
```
Name:     Admin User
Role:     admin
Credits:  997
API Key:  24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137
```

**Admin Permissions:**
- ✅ Submit commands
- ✅ View command history
- ✅ Create/edit/delete rules
- ✅ Create/edit/delete users
- ✅ Manage credits for all users
- ✅ View audit logs
- ✅ View statistics

---

### 👤 MEMBER 1: John Member
```
Name:     John Member
Role:     member
Credits:  50
API Key:  10c6a348e8bfb66ac5a181721a6e65c1e0ea0925115a48b83f7285512381a3c9
```

**Member Permissions:**
- ✅ Submit commands (costs 1 credit each)
- ✅ View own command history
- ❌ Cannot create rules
- ❌ Cannot manage users
- ❌ Cannot view audit logs

---

### 👤 MEMBER 2: Sarah Member
```
Name:     Sarah Member
Role:     member
Credits:  100
API Key:  83533a89fca5c749043dc52cbde1cf00167aaa5ef465387b59fe303b71e806b7
```

**Member Permissions:**
- ✅ Submit commands (costs 1 credit each)
- ✅ View own command history
- ❌ Cannot create rules
- ❌ Cannot manage users
- ❌ Cannot view audit logs

---

## 🧪 TEST EACH USER

### Test Admin User
```powershell
$apiKey = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"
$headers = @{"x-api-key" = $apiKey}
Invoke-WebRequest -Uri "http://localhost:3000/auth/me" -Headers $headers
```

### Test John Member
```powershell
$apiKey = "10c6a348e8bfb66ac5a181721a6e65c1e0ea0925115a48b83f7285512381a3c9"
$headers = @{"x-api-key" = $apiKey}
Invoke-WebRequest -Uri "http://localhost:3000/auth/me" -Headers $headers
```

### Test Sarah Member
```powershell
$apiKey = "83533a89fca5c749043dc52cbde1cf00167aaa5ef465387b59fe303b71e806b7"
$headers = @{"x-api-key" = $apiKey}
Invoke-WebRequest -Uri "http://localhost:3000/auth/me" -Headers $headers
```

---

## 🎯 HOW TO USE IN FRONTEND

### Login as Admin
1. Go to http://localhost:3001
2. Enter API Key: `24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137`
3. Click Login
4. ✅ Access all admin features

### Login as John Member
1. Go to http://localhost:3001
2. Enter API Key: `10c6a348e8bfb66ac5a181721a6e65c1e0ea0925115a48b83f7285512381a3c9`
3. Click Login
4. ✅ Can submit commands (has 50 credits)
5. ❌ Cannot access Rules, Users, or Logs pages

### Login as Sarah Member
1. Go to http://localhost:3001
2. Enter API Key: `83533a89fca5c749043dc52cbde1cf00167aaa5ef465387b59fe303b71e806b7`
3. Click Login
4. ✅ Can submit commands (has 100 credits)
5. ❌ Cannot access Rules, Users, or Logs pages

---

## 🔧 CREATE MORE USERS

### Via PowerShell (Admin Only):
```powershell
$adminKey = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"
$headers = @{
    "x-api-key" = $adminKey
    "Content-Type" = "application/json"
}
$body = @{
    name = "New User Name"
    role = "member"  # or "admin"
    credits = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/users" -Method POST -Headers $headers -Body $body
```

### Via Frontend (Admin Only):
1. Login as Admin
2. Go to Users page
3. Click "Create User"
4. Fill in details
5. New API key will be generated automatically
6. Copy the API key and give it to the user

---

## 📋 WHAT MEMBERS CAN DO

### Submit Commands (Costs 1 credit each)
```powershell
$apiKey = "10c6a348e8bfb66ac5a181721a6e65c1e0ea0925115a48b83f7285512381a3c9"
$headers = @{
    "x-api-key" = $apiKey
    "Content-Type" = "application/json"
}
$body = @{
    command_text = "ls -la"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/commands/submit" -Method POST -Headers $headers -Body $body
```

### View Their Command History
```powershell
$apiKey = "10c6a348e8bfb66ac5a181721a6e65c1e0ea0925115a48b83f7285512381a3c9"
Invoke-WebRequest -Uri "http://localhost:3000/commands/history" -Headers @{"x-api-key" = $apiKey}
```

---

## 📋 WHAT ADMINS CAN DO (Everything + More)

### Create New Rules
```powershell
$adminKey = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"
$headers = @{
    "x-api-key" = $adminKey
    "Content-Type" = "application/json"
}
$body = @{
    pattern = "^docker\s+ps"
    action = "AUTO_ACCEPT"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/rules" -Method POST -Headers $headers -Body $body
```

### Manage User Credits
```powershell
$adminKey = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"
$headers = @{
    "x-api-key" = $adminKey
    "Content-Type" = "application/json"
}
$body = @{
    credits = 200  # Give John 200 credits
} | ConvertTo-Json

# Update John Member (user ID 2)
Invoke-WebRequest -Uri "http://localhost:3000/users/2" -Method PUT -Headers $headers -Body $body
```

### View All Audit Logs
```powershell
$adminKey = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"
Invoke-WebRequest -Uri "http://localhost:3000/logs" -Headers @{"x-api-key" = $adminKey}
```

---

## ⚠️ IMPORTANT NOTES

### API Keys are Sensitive!
- Never share API keys publicly
- Each key identifies a specific user
- Members can only see their own data
- Admins can see and manage everything

### Credit System:
- Each command execution costs 1 credit
- Members start with assigned credits (50 or 100)
- When credits reach 0, members cannot execute commands
- Admins can add more credits anytime

### Member Limitations:
- ❌ Members CANNOT access: `/rules`, `/users`, `/logs` endpoints
- ✅ Members CAN access: `/auth/me`, `/commands/submit`, `/commands/history`
- If member tries to access admin endpoint, they get: `403 Forbidden - Admin access required`

---

## 🎓 EXAMPLE SCENARIOS

### Scenario 1: Member Runs Out of Credits
1. John Member tries to submit command
2. System checks: John has 0 credits
3. Response: `Insufficient credits. Please contact admin to add more credits.`
4. Admin logs in, goes to Users page, adds 50 more credits to John
5. John can now submit commands again

### Scenario 2: Member Tries Admin Action
1. John Member tries to view all users: `GET /users`
2. System checks: John is "member" role
3. Response: `403 Forbidden - Admin access required`

### Scenario 3: Admin Creates Custom Rule
1. Admin creates rule: Pattern `^python\s+` → Action `AUTO_ACCEPT`
2. Member submits: `python script.py`
3. System matches rule → Executes command
4. Member's credits decrease by 1

---

## 📞 QUICK REFERENCE

| Action | Admin | Member |
|--------|-------|--------|
| Submit Commands | ✅ | ✅ |
| View Own History | ✅ | ✅ |
| Create Rules | ✅ | ❌ |
| Manage Users | ✅ | ❌ |
| View Audit Logs | ✅ | ❌ |
| Add Credits | ✅ | ❌ |

---

**All API keys are working and ready to use!** 🎉
