# Command Gateway Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React/Web/CLI)                     │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Login Page   │  │ Dashboard    │  │ Admin Panel              │ │
│  │ (API Key)    │  │ - Submit Cmd │  │ - Rules Management       │ │
│  └──────────────┘  │ - View Hist  │  │ - Users Management       │ │
│                    │ - See Credits│  │ - Audit Logs             │ │
│                    └──────────────┘  └──────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP + x-api-key header
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Middleware Layer                           │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐   │  │
│  │  │ CORS           │  │ Auth Check   │  │ Error Handler  │   │  │
│  │  │ (Allow Origin) │  │ (Verify Key) │  │ (Catch Errors) │   │  │
│  │  └────────────────┘  └──────────────┘  └────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       API Routes                              │  │
│  │                                                               │  │
│  │  /auth/me         → Get current user info                    │  │
│  │  /commands/submit → Validate, match rules, execute, log      │  │
│  │  /commands/history→ Get user's command history               │  │
│  │  /rules/*         → CRUD operations (admin only)             │  │
│  │  /users/*         → CRUD operations (admin only)             │  │
│  │  /logs/*          → View audit logs (admin only)             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE (SQLite)                                │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │   Users     │  │   Rules     │  │  Commands   │  │  Logs    │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├──────────┤ │
│  │ id          │  │ id          │  │ id          │  │ id       │ │
│  │ name        │  │ pattern     │  │ user_id     │  │ user_id  │ │
│  │ api_key     │  │ action      │  │ command_text│  │ action   │ │
│  │ role        │  └─────────────┘  │ status      │  │ details  │ │
│  │ credits     │                   │ output      │  │ timestamp│ │
│  └─────────────┘                   │ timestamp   │  └──────────┘ │
│                                    └─────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Command Submission Flow

```
USER                  FRONTEND              BACKEND                DATABASE
 │                       │                     │                      │
 │  1. Enter Command     │                     │                      │
 ├──────────────────────►│                     │                      │
 │                       │  2. POST /commands/ │                      │
 │                       │     submit          │                      │
 │                       ├────────────────────►│                      │
 │                       │  + x-api-key header │  3. Verify API Key   │
 │                       │                     ├─────────────────────►│
 │                       │                     │◄─────────────────────┤
 │                       │                     │  User found          │
 │                       │                     │                      │
 │                       │                     │  4. Check Credits    │
 │                       │                     │     (credits > 0?)   │
 │                       │                     │                      │
 │                       │                     │  5. Get Rules        │
 │                       │                     ├─────────────────────►│
 │                       │                     │◄─────────────────────┤
 │                       │                     │  Rules list          │
 │                       │                     │                      │
 │                       │                     │  6. Match Command    │
 │                       │                     │     against Regex    │
 │                       │                     │                      │
 │                       │                     │  IF AUTO_REJECT:     │
 │                       │  ❌ Rejected        │  - Log rejection     │
 │                       │◄────────────────────┤  - Return error      │
 │  ❌ Show Error        │                     │                      │
 │◄──────────────────────┤                     │                      │
 │                       │                     │                      │
 │                       │                     │  IF AUTO_ACCEPT:     │
 │                       │                     │  BEGIN TRANSACTION   │
 │                       │                     │  7. Insert Command   │
 │                       │                     ├─────────────────────►│
 │                       │                     │  8. Deduct Credits   │
 │                       │                     ├─────────────────────►│
 │                       │                     │  9. Create Log       │
 │                       │                     ├─────────────────────►│
 │                       │                     │  COMMIT TRANSACTION  │
 │                       │                     │                      │
 │                       │  ✅ Success +       │                      │
 │                       │     Output          │                      │
 │                       │◄────────────────────┤                      │
 │  ✅ Show Output       │                     │                      │
 │  + New Balance        │                     │                      │
 │◄──────────────────────┤                     │                      │
```

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User has API Key (from admin or registration)           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend stores API Key in localStorage                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Every API request includes header:                      │
│     x-api-key: {stored_api_key}                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Backend middleware checks:                              │
│     - Is x-api-key present?                                 │
│     - Does it exist in database?                            │
│     - Attach user object to request                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
    ┌───────────────────┐   ┌──────────────────┐
    │  Valid Key        │   │  Invalid Key     │
    │  → Continue       │   │  → 401 Error     │
    └───────────────────┘   └──────────────────┘
```

## Role-Based Access Control

```
┌──────────────────────────────────────────────────────────────┐
│                    Incoming Request                           │
│                  with x-api-key header                        │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │  Auth Check    │
                │  - Verify Key  │
                │  - Get User    │
                └────────┬───────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌──────────────┐
    │  ADMIN ROLE   │         │ MEMBER ROLE  │
    └───────┬───────┘         └──────┬───────┘
            │                         │
            │ Can Access:             │ Can Access:
            │ ✓ All Member Routes     │ ✓ /auth/me
            │ ✓ /rules (CRUD)         │ ✓ /commands/submit
            │ ✓ /users (CRUD)         │ ✓ /commands/history
            │ ✓ /logs                 │
            │                         │ Cannot Access:
            │                         │ ✗ /rules
            │                         │ ✗ /users
            │                         │ ✗ /logs
            │                         │ (Returns 403)
            └─────────────────────────┘
```

## Credit System Flow

```
┌─────────────────────────────────────────────────────────────┐
│  User Account Created                                        │
│  Initial Credits: 100                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Command Submitted                                           │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
                ┌───────────────┐
                │ Check Credits │
                └───────┬───────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐       ┌──────────────┐
    │ Credits > 0   │       │ Credits = 0  │
    │ ✓ Continue    │       │ ✗ Reject     │
    └───────┬───────┘       └──────────────┘
            │                       │
            ▼                       ▼
    ┌───────────────┐       ┌──────────────────────┐
    │ Match Rules   │       │ Return Error:        │
    └───────┬───────┘       │ "Insufficient        │
            │               │  credits"            │
            ▼               └──────────────────────┘
    ┌───────────────┐
    │ Execute       │
    │ - Mock Run    │
    │ - Deduct 1    │
    │   Credit      │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ New Balance:  │
    │ 99 credits    │
    └───────────────┘
```

## Rule Matching Algorithm

```
┌─────────────────────────────────────────────────────────────┐
│  Command Submitted: "rm -rf /"                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Get All Rules from Database (ordered by ID)                 │
│  [Rule 1, Rule 2, Rule 3, ...]                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
                ┌───────────────┐
                │  Test Rule 1  │
                │  Pattern: ... │
                └───────┬───────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐       ┌──────────────┐
    │ MATCH Found   │       │ No Match     │
    │ → Use This    │       │ → Next Rule  │
    │   Rule        │       └──────┬───────┘
    └───────┬───────┘              │
            │                      ▼
            │              ┌───────────────┐
            │              │  Test Rule 2  │
            │              └───────┬───────┘
            │                      │
            │                      ... (continue)
            │                      │
            │              ┌───────────────┐
            │              │ No Match on   │
            │              │ Any Rule      │
            │              │ → Reject      │
            │              └───────────────┘
            │
            ▼
    ┌───────────────────────────┐
    │  Apply Rule Action:       │
    │  - AUTO_ACCEPT → Execute  │
    │  - AUTO_REJECT → Reject   │
    └───────────────────────────┘
```

## Transaction Safety

```
┌──────────────────────────────────────────────────────────────┐
│  Command Execution Request                                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │ BEGIN          │
                │ TRANSACTION    │
                └────────┬───────┘
                         │
                         ▼
                ┌────────────────┐
                │ Step 1:        │
                │ Insert Command │
                │ Record         │
                └────────┬───────┘
                         │
            ┌────────────┴────────────┐
            │ Success               │ Error
            ▼                       ▼
    ┌────────────────┐      ┌──────────────┐
    │ Step 2:        │      │  ROLLBACK    │
    │ Deduct Credits │      │  No changes  │
    └────────┬───────┘      │  applied     │
             │              └──────────────┘
             │
┌────────────┴────────────┐
│ Success               │ Error
▼                       ▼
┌────────────────┐  ┌──────────────┐
│ Step 3:        │  │  ROLLBACK    │
│ Create Log     │  │  Credits not │
└────────┬───────┘  │  deducted    │
         │          └──────────────┘
         │
┌────────┴────────────┐
│ Success           │ Error
▼                   ▼
┌────────────┐  ┌──────────────┐
│  COMMIT    │  │  ROLLBACK    │
│  All OK!   │  │  All undone  │
└────────────┘  └──────────────┘
```

## Database Schema Relationships

```
┌───────────────────┐
│      Users        │
│                   │
│  PK: id           │
│      name         │
│      api_key      │
│      role         │
│      credits      │
└─────────┬─────────┘
          │
          │ 1:N (One user, many commands)
          │
          ▼
┌───────────────────┐
│    Commands       │
│                   │
│  PK: id           │
│  FK: user_id      │───┐
│      command_text │   │
│      status       │   │
│      output       │   │
│      timestamp    │   │
└───────────────────┘   │
                        │
                        │ 1:N (One user, many logs)
                        │
                        ▼
┌───────────────────┐  ┌──────────────────┐
│   Audit_Logs      │  │      Rules       │
│                   │  │                  │
│  PK: id           │  │  PK: id          │
│  FK: user_id      │  │      pattern     │
│      action_type  │  │      action      │
│      details      │  │                  │
│      timestamp    │  │  (No FK)         │
└───────────────────┘  └──────────────────┘
```

## API Error Flow

```
┌─────────────────────────────────────────────────────────────┐
│  API Request                                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
                ┌───────────────┐
                │  Middleware   │
                │  Layer        │
                └───────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│ No API Key │  │ Invalid    │  │ Valid Key  │
│ → 401      │  │ API Key    │  │ → Continue │
└────────────┘  │ → 401      │  └─────┬──────┘
                └────────────┘        │
                                      ▼
                              ┌────────────┐
                              │ Route      │
                              │ Handler    │
                              └─────┬──────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌────────────┐  ┌────────────┐  ┌────────────┐
            │ Success    │  │ Not Found  │  │ Forbidden  │
            │ → 200/201  │  │ → 404      │  │ → 403      │
            └────────────┘  └────────────┘  └────────────┘
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
                                    ▼
                            ┌────────────────┐
                            │ Error Handler  │
                            │ Middleware     │
                            │ → JSON Error   │
                            └────────────────┘
```

---

## Key Takeaways

1. **Frontend** sends requests with API key in header
2. **Backend** verifies key, checks permissions, processes request
3. **Database** stores all data with referential integrity
4. **Rules** are matched in order (first match wins)
5. **Transactions** ensure data consistency
6. **Audit Logs** track all actions
7. **Credits** control command execution
8. **Roles** determine access levels
