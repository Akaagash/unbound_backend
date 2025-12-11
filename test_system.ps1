# ========================================
# COMPLETE SYSTEM TEST & SETUP
# ========================================

$adminKey = "4ddd6091cb8958efbba933e1fbac667a4592ca4c44b505c3f4f725e21d420ef6"

Write-Host "`n" -ForegroundColor Cyan
Write-Host "  COMMAND GATEWAY - COMPLETE SETUP & TEST    " -ForegroundColor Cyan
Write-Host "`n" -ForegroundColor Cyan

# Wait for server
Write-Host " Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`n`n" -ForegroundColor Gray

# Test 1: Admin Authentication
Write-Host "TEST 1: Admin Authentication" -ForegroundColor Yellow
try {
    $admin = Invoke-RestMethod -Uri "http://localhost:3000/auth/me" `
        -Headers @{"x-api-key"=$adminKey}
    Write-Host "    Admin login works!" -ForegroundColor Green
    Write-Host "      Name: $($admin.data.name)" -ForegroundColor White
    Write-Host "      Role: $($admin.data.role)" -ForegroundColor White
    Write-Host "      Credits: $($admin.data.credits)" -ForegroundColor White
} catch {
    Write-Host "    Admin login FAILED!" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n`n" -ForegroundColor Gray

# Test 2: Create Member User
Write-Host "TEST 2: Create Member User" -ForegroundColor Yellow
try {
    $newMember = Invoke-RestMethod -Uri "http://localhost:3000/users" `
        -Method POST `
        -Headers @{"x-api-key"=$adminKey; "Content-Type"="application/json"} `
        -Body '{"name":"John Member","role":"member","credits":50}'
    
    $memberKey = $newMember.data.api_key
    Write-Host "    Member created!" -ForegroundColor Green
    Write-Host "      Name: $($newMember.data.name)" -ForegroundColor White
    Write-Host "      API Key: $memberKey" -ForegroundColor Yellow
    Write-Host "      Credits: $($newMember.data.credits)" -ForegroundColor White
} catch {
    Write-Host "    Failed to create member!" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n`n" -ForegroundColor Gray

# Test 3: Member Authentication
Write-Host "TEST 3: Member Authentication" -ForegroundColor Yellow
try {
    $member = Invoke-RestMethod -Uri "http://localhost:3000/auth/me" `
        -Headers @{"x-api-key"=$memberKey}
    Write-Host "    Member login works!" -ForegroundColor Green
    Write-Host "      Name: $($member.data.name)" -ForegroundColor White
    Write-Host "      Credits: $($member.data.credits)" -ForegroundColor White
} catch {
    Write-Host "    Member login FAILED!" -ForegroundColor Red
    exit 1
}

Write-Host "`n`n" -ForegroundColor Gray

# Test 4: Member Submits Command
Write-Host "TEST 4: Member Submits Command" -ForegroundColor Yellow
try {
    $cmdResult = Invoke-RestMethod -Uri "http://localhost:3000/commands/submit" `
        -Method POST `
        -Headers @{"x-api-key"=$memberKey; "Content-Type"="application/json"} `
        -Body '{"command_text":"ls -la"}'
    
    Write-Host "    Command submitted!" -ForegroundColor Green
    Write-Host "      Command ID: $($cmdResult.data.command_id)" -ForegroundColor White
    Write-Host "      Status: $($cmdResult.data.status)" -ForegroundColor Yellow
    Write-Host "      Flagged: $($cmdResult.data.flagged)" -ForegroundColor White
    $cmdId = $cmdResult.data.command_id
} catch {
    Write-Host "    Command submission FAILED!" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n`n" -ForegroundColor Gray

# Test 5: Admin Views Pending Commands
Write-Host "TEST 5: Admin Views Pending Commands" -ForegroundColor Yellow
try {
    $pending = Invoke-RestMethod -Uri "http://localhost:3000/commands/all?status=pending" `
        -Headers @{"x-api-key"=$adminKey}
    
    Write-Host "    Pending commands: $($pending.data.Count)" -ForegroundColor Green
    $pending.data | ForEach-Object {
        Write-Host "      ID $($_.id): $($_.command_text) (by $($_.user_name))" -ForegroundColor White
    }
} catch {
    Write-Host "    Failed to get pending commands!" -ForegroundColor Red
}

Write-Host "`n`n" -ForegroundColor Gray

# Test 6: Admin Approves Command
Write-Host "TEST 6: Admin Approves Command" -ForegroundColor Yellow
try {
    $approve = Invoke-RestMethod -Uri "http://localhost:3000/commands/$cmdId/approve" `
        -Method PUT `
        -Headers @{"x-api-key"=$adminKey; "Content-Type"="application/json"}
    
    Write-Host "    Command approved and executed!" -ForegroundColor Green
    Write-Host "      Status: $($approve.data.status)" -ForegroundColor Green
    Write-Host "      Output: $($approve.data.output.Substring(0, [Math]::Min(50, $approve.data.output.Length)))..." -ForegroundColor White
} catch {
    Write-Host "    Approval FAILED!" -ForegroundColor Red
}

Write-Host "`n`n" -ForegroundColor Gray

# Test 7: Member Views History
Write-Host "TEST 7: Member Views History" -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "http://localhost:3000/commands/history" `
        -Headers @{"x-api-key"=$memberKey}
    
    Write-Host "    History retrieved: $($history.data.Count) commands" -ForegroundColor Green
    $history.data | ForEach-Object {
        Write-Host "      ID $($_.id): $($_.command_text) - $($_.status) @ $($_.timestamp)" -ForegroundColor White
    }
} catch {
    Write-Host "    History FAILED!" -ForegroundColor Red
}

Write-Host "`n`n" -ForegroundColor Gray

# Test 8: Admin Updates Member Credits
Write-Host "TEST 8: Admin Updates Member Credits" -ForegroundColor Yellow
try {
    $update = Invoke-RestMethod -Uri "http://localhost:3000/users/$($member.data.id)" `
        -Method PUT `
        -Headers @{"x-api-key"=$adminKey; "Content-Type"="application/json"} `
        -Body '{"credits":100}'
    
    Write-Host "    Credits updated!" -ForegroundColor Green
    Write-Host "      New balance: $($update.data.credits)" -ForegroundColor White
} catch {
    Write-Host "    Credit update FAILED!" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n`n" -ForegroundColor Gray

Write-Host " ALL TESTS COMPLETE!`n" -ForegroundColor Green

# Save credentials
@"
#  WORKING CREDENTIALS

## Admin
- API Key: $adminKey
- Role: admin
- Credits: 1000

## Member (John)
- API Key: $memberKey
- Role: member
- Credits: 100 (updated)

## Usage
Login to frontend (http://localhost:3001) with either key.
"@ | Set-Content "WORKING_KEYS.txt"

Write-Host " Credentials saved to WORKING_KEYS.txt`n" -ForegroundColor Cyan
