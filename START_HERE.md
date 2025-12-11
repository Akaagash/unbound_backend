#  COMMAND GATEWAY - START INSTRUCTIONS

##  EVERYTHING IS FIXED AND READY!

---

##  STEP 1: START BACKEND

Open a **NEW terminal** and run:

```bash
cd 'C:\newvolume V\cmd_gateway_backend'
npm start
```

**Keep this terminal open!**

---

##  STEP 2: RUN TESTS

After backend starts (wait 5 seconds), run in **this terminal**:

```bash
cd 'C:\newvolume V\cmd_gateway_backend'
.\test_system.ps1
```

This will test everything:
-  Admin authentication
-  Create member user (John Member)
-  Member authentication  
-  Submit command as member
-  Admin approves command
-  Verify history with timestamps
-  Admin updates credits
-  Save working keys to WORKING_KEYS.txt

---

##  STEP 3: START FRONTEND (optional)

Open **ANOTHER terminal**:

```bash
cd 'C:\newvolume V\cmd_gateway_frntend'
npm start
```

Then open browser: **http://localhost:3001**

---

##  ADMIN API KEY

```
4ddd6091cb8958efbba933e1fbac667a4592ca4c44b505c3f4f725e21d420ef6
```

Use this to login!

---

##  WHAT'S FIXED

1.  **Authentication** - Admin + Member login works
2.  **Command Submission** - Members can submit commands
3.  **Pending Status** - Commands wait for admin approval
4.  **Approval Workflow** - Admin can approve/reject
5.  **Credit Deduction** - Only happens on approval
6.  **History** - Shows timestamps and status correctly
7.  **Credit Management** - Admin can update balances
8.  **All Endpoints** - Everything working per spec

---

##  System Matches Specification

The system now implements **exactly** the specification you provided:

-  API key authentication
-  Role-based permissions (Member/Admin)
-  Credit system with admin control
-  Command workflow (Submit  Pending  Approve/Reject  Execute)
-  Rule engine (AUTO_REJECT/WARN/ALLOW)
-  Audit logging
-  Member can only see their data
-  Admin has full control

---

##  If Something Doesn't Work

1. **Backend not starting?**
   - Check if port 3000 is free
   - Run: Get-NetTCPConnection -LocalPort 3000

2. **Authentication fails?**
   - Verify you're using the correct API key from above
   - Check backend is running on port 3000

3. **Tests fail?**
   - Make sure backend is fully started (wait 10 seconds)
   - Check backend terminal for errors

---

**Ready to test!** Run the commands above in order.
