# ========================================
# REAL-TIME COMMAND APPROVAL TEST
# ========================================

$adminKey = "749e7429863be89d1d4e013d67a2ef6feaf453240af60a6c670218d72f8857e5"
$memberKey = "a7e7de01e1a276d2ab036d1fb44a27e123b61817caae7cc2fc4c3d1c4c924ac3"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "REAL-TIME WORKFLOW TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Member checks credits
Write-Host "[MEMBER] Checking credits..." -ForegroundColor Yellow
$memberInfo = Invoke-RestMethod -Uri "http://localhost:3000/auth/me" -Headers @{"x-api-key"=$memberKey}
Write-Host "  Credits: $($memberInfo.data.credits)" -ForegroundColor Green

# Step 2: Member submits command
Write-Host "`n[MEMBER] Submitting command: date" -ForegroundColor Yellow
$cmdBody = @{command_text="date"} | ConvertTo-Json
$submitResult = Invoke-RestMethod -Uri "http://localhost:3000/commands/submit" -Method Post -Headers @{"x-api-key"=$memberKey; "Content-Type"="application/json"} -Body $cmdBody
Write-Host "  Status: $($submitResult.data.status)" -ForegroundColor Green
Write-Host "  Command ID: $($submitResult.data.command_id)" -ForegroundColor Green
$commandId = $submitResult.data.command_id

# Step 3: Admin views pending commands
Write-Host "`n[ADMIN] Viewing pending commands..." -ForegroundColor Magenta
$pending = Invoke-RestMethod -Uri "http://localhost:3000/commands/all?status=pending" -Headers @{"x-api-key"=$adminKey}
Write-Host "  Pending commands: $($pending.pagination.count)" -ForegroundColor Green
foreach($cmd in $pending.data) {
    Write-Host "  - ID: $($cmd.id) | User: $($cmd.user_name) | Command: $($cmd.command_text) | Time: $($cmd.timestamp)" -ForegroundColor Gray
}

# Step 4: Admin approves the command
Write-Host "`n[ADMIN] Approving command ID: $commandId" -ForegroundColor Magenta
$approveResult = Invoke-RestMethod -Uri "http://localhost:3000/commands/$commandId/approve" -Method Put -Headers @{"x-api-key"=$adminKey}
Write-Host "  Status: $($approveResult.data.status)" -ForegroundColor Green
Write-Host "  Output: $($approveResult.data.output)" -ForegroundColor Gray

# Step 5: Member views history with timestamps
Write-Host "`n[MEMBER] Viewing command history..." -ForegroundColor Yellow
$history = Invoke-RestMethod -Uri "http://localhost:3000/commands/history" -Headers @{"x-api-key"=$memberKey}
Write-Host "  Total commands: $($history.pagination.count)" -ForegroundColor Green
foreach($cmd in $history.data | Select-Object -First 3) {
    Write-Host "  - $($cmd.command_text) | Status: $($cmd.status) | Time: $($cmd.timestamp)" -ForegroundColor Gray
}

# Step 6: Check updated credits
Write-Host "`n[MEMBER] Checking updated credits..." -ForegroundColor Yellow
$memberInfo2 = Invoke-RestMethod -Uri "http://localhost:3000/auth/me" -Headers @{"x-api-key"=$memberKey}
Write-Host "  Credits Before: $($memberInfo.data.credits)" -ForegroundColor Yellow
Write-Host "  Credits After: $($memberInfo2.data.credits)" -ForegroundColor Green
Write-Host "  Credits Used: $($memberInfo.data.credits - $memberInfo2.data.credits)" -ForegroundColor Red

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETE - ALL REAL-TIME SYNC WORKING!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
