#  COMMAND GATEWAY - COMPLETE SYSTEM SPECIFICATION

##  **1. User Authentication Model (API Key Based)**

### Single API Key Per User
- Each user has **ONE unique API key**
- API key identifies the user and determines their role & permissions
- API keys cannot be shared between users
- Regenerating a key immediately invalidates the old one

### Authentication Flow
1. User includes API key in `x-api-key` header
2. Backend validates the key
3. System determines:
   - User identity
   - Role (member/admin)
   - Permissions
   - Credit balance

---

##  **2. Roles and Permissions**

### A. Member Role

**What Members CAN Do:**
-  View their current credit balance
-  Submit commands for execution
-  View command status (pending/accepted/rejected/executed)
-  View their complete command history
-  See their own audit logs

**What Members CANNOT Do:**
-  Approve or reject commands
-  Modify credits (theirs or others)
-  Change system rules
-  Access full audit logs
-  Create/regenerate API keys
-  Modify users
-  View other users commands

---

### B. Admin Role

**Admins Have Complete Authority:**
-  Everything members can do
-  **Approve commands** - Execute pending commands
-  **Reject commands** - Deny with reason
-  **Modify credit balances** - Add/deduct credits
-  **User management** - Create/delete/modify users
-  **API key management** - Regenerate keys for any user
-  **Rule configuration** - Add/modify/delete security rules
-  **Regex validation** - Test patterns before saving
-  **Full audit logs** - View ALL system activity
-  **System capacity** - Modify limits and quotas
-  **Override behavior** - Emergency system control

---

##  **3. Credit Management System**

### Credit Rules
- Each user has a credit balance (integer)
- Submitting a command **does NOT** immediately deduct credits
- Credits are **only deducted when admin approves** the command
- If user has 0 credits  command submission is blocked
- Only admins can modify credit balances

### Admin Credit Actions
- Add credits to any user
- Deduct credits from any user
- Reset credit balance
- Set credit warnings/limits
- View credit usage history

### Member Credit Actions
- View only (read-only access to their balance)

---

##  **4. Command Processing Workflow**

### STEP 1: Member Submits Command
```
Member sends command  System records:
  - User ID
  - Command text
  - Timestamp
  - Current credit balance
  
Status: PENDING
```

### STEP 2: Rule Engine Evaluation
```
Rule Engine checks command against patterns:

   Matches FORBIDDEN pattern (AUTO_REJECT)
     Immediately REJECT
     Save as "rejected"
     Credits NOT checked/deducted
  
   Matches WARN pattern
     Flag for admin review
     Status: PENDING (flagged)
     Admin sees warning icon
  
   Matches ALLOW pattern
     Status: PENDING (safe)
     Awaits admin approval
  
   No pattern match
      Status: PENDING
      Awaits admin approval
```

### STEP 3: Admin Reviews Commands
```
Admin sees all PENDING commands in dashboard

Admin can:
  1. ACCEPT  Executes command
     - Credits deducted
     - Command runs
     - Output saved
     - Status: EXECUTED
  
  2. REJECT  Denies command
     - Credits NOT deducted
     - Optional rejection reason
     - Status: REJECTED
  
  3. MODIFY (optional)
     - Edit command text
     - Then accept/reject
```

### STEP 4: Member Views Results
```
Member checks their history:
  - Command status (accepted/rejected/executed)
  - Execution output (if executed)
  - Rejection reason (if rejected)
  - Timestamp of action
  - Credits deducted
```

---

##  **5. Rule Configuration System**

### Rule Structure
Each rule has:
- **Pattern** - Regular expression (regex)
- **Description** - Human-readable explanation
- **Action** - What happens when pattern matches

### Rule Actions

**AUTO_REJECT**
- Immediately blocks command
- No admin review needed
- Used for dangerous patterns
- Examples: `rm -rf`, `fork bomb`, `dd if=`

**WARN**
- Flags command for careful review
- Still requires admin approval
- Shows warning icon in UI
- Examples: `sudo`, `docker rm`, `npm install`

**ALLOW**
- Marks as safe but still requires approval
- No warning shown
- Normal admin review process
- Examples: `ls`, `pwd`, `git status`

### Regex Validation
When admin creates/modifies a rule:
1. System tests if regex is valid
2. If invalid  rule NOT saved
3. Error message shows what's wrong
4. Admin can test pattern against sample commands

### Example Rules
```
Pattern: ^rm -rf.*        Action: AUTO_REJECT
Pattern: ^sudo.*          Action: WARN
Pattern: ^ls.*            Action: ALLOW
Pattern: ^git status      Action: ALLOW
```

---

##  **6. Audit Logging System**

### What Gets Logged
**EVERYTHING** is recorded:
- User ID and name
- API key used
- Action type
- Timestamp (precise to millisecond)
- Command/rule involved
- Result of action
- Role (member/admin)
- IP address (optional)

### Log Entry Types
- `COMMAND_SUBMITTED` - Member submits command
- `COMMAND_REJECTED` - Auto-rejected by rule
- `COMMAND_APPROVED` - Admin accepts command
- `COMMAND_EXECUTED` - Command runs successfully
- `RULE_CREATED` - Admin adds new rule
- `RULE_MODIFIED` - Admin changes rule
- `RULE_DELETED` - Admin removes rule
- `CREDITS_MODIFIED` - Admin changes balance
- `USER_CREATED` - New user added
- `API_KEY_REGENERATED` - Key changed

### Access Levels
**Members:**
- View logs related to their commands only
- See their credit changes
- See their command submissions

**Admins:**
- View ALL logs from all users
- Filter by user, action type, date
- Export logs for auditing
- Search logs by keyword

---

##  **7. Complete Permission Matrix**

| Action                     | Member | Admin |
|----------------------------|--------|-------|
| View own credits           |      |     |
| Submit commands            |      |     |
| View command status        |      |     |
| View own history           |      |     |
| View own audit logs        |      |     |
| **Approve commands**       |      |     |
| **Reject commands**        |      |     |
| **Modify credits**         |      |     |
| **View all commands**      |      |     |
| **Configure rules**        |      |     |
| **Validate regex**         |      |     |
| **View all audit logs**    |      |     |
| **Manage users**           |      |     |
| **Create users**           |      |     |
| **Delete users**           |      |     |
| **Regenerate API keys**    |      |     |
| **Modify system limits**   |      |     |
| **Override rules**         |      |     |

---

##  **8. Admin-Only Capabilities**

### Command Management
- View ALL pending commands from ALL users
- Approve commands  executes & deducts credits
- Reject commands  denies & logs reason
- Modify commands before approval
- View complete execution history
- Filter by user, status, date

### Credit Management
- View all user balances
- Add credits to any user
- Deduct credits from any user
- Set credit limits per user
- Track credit usage statistics
- Generate credit reports

### Rule Configuration
- Create new security rules
- Modify existing rules
- Delete obsolete rules
- Test regex patterns
- Validate pattern syntax
- View rule match statistics

### User Administration
- Create new users (member/admin)
- Delete users
- Modify user roles
- Regenerate API keys
- View user activity
- Suspend/activate users

### System Oversight
- View complete audit log
- Filter logs by any criteria
- Export logs for compliance
- Monitor system health
- View usage statistics
- Configure system limits

---

##  **9. Security Principles**

### No Command Executes Without Admin Approval
- ALL commands wait in PENDING status
- Only AUTO_REJECT rules bypass this (for safety)
- Admin must explicitly approve
- Credits only deducted after approval

### API Key Security
- Keys are 64-character hex strings
- Stored securely in database
- Transmitted via HTTPS only
- Cannot be retrieved (only regenerated)
- Immediate invalidation on regeneration

### Role Separation
- Members have ZERO administrative access
- Clear boundary between member/admin
- No privilege escalation possible
- All actions logged for accountability

### Audit Trail
- Immutable log of all actions
- Cannot be modified or deleted
- Timestamps are precise
- Complete context for each action

---

##  **This is your complete system specification.**

Feed this to AI as documentation for:
- Training
- System understanding  
- Implementation reference
- Compliance documentation
- Security auditing

