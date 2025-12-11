# ========================================
# ADMIN MEMBER MANAGEMENT TEST
# ========================================

$adminKey = "749e7429863be89d1d4e013d67a2ef6feaf453240af60a6c670218d72f8857e5"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ADMIN MEMBER MANAGEMENT TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: View all members
Write-Host "[ADMIN] Viewing all members..." -ForegroundColor Magenta
$members = Invoke-RestMethod -Uri "http://localhost:3000/users" -Headers @{"x-api-key"=$adminKey}
Write-Host "  Total users: $($members.data.Count)" -ForegroundColor Green
foreach($user in $members.data) {
    $roleColor = if($user.role -eq "admin") { "Yellow" } else { "White" }
    Write-Host "  - $($user.name) ($($user.role)) - Credits: $($user.credits)" -ForegroundColor $roleColor
}

# Step 2: Create new member
Write-Host "`n[ADMIN] Creating new member..." -ForegroundColor Magenta
$newMemberBody = @{
    name = "Test Member $(Get-Date -Format 'HHmmss')"
    role = "member"
    credits = 75
} | ConvertTo-Json

$createResult = Invoke-RestMethod -Uri "http://localhost:3000/users" -Method Post -Headers @{"x-api-key"=$adminKey; "Content-Type"="application/json"} -Body $newMemberBody
Write-Host "  Created: $($createResult.data.name)" -ForegroundColor Green
Write-Host "  Credits: $($createResult.data.credits)" -ForegroundColor Green
Write-Host "  API Key: $($createResult.data.api_key)" -ForegroundColor Yellow
$newMemberId = $createResult.data.id

# Step 3: Update member credits
Write-Host "`n[ADMIN] Updating credits for member ID: $newMemberId" -ForegroundColor Magenta
$updateBody = @{credits = 150} | ConvertTo-Json
$updateResult = Invoke-RestMethod -Uri "http://localhost:3000/users/$newMemberId" -Method Put -Headers @{"x-api-key"=$adminKey; "Content-Type"="application/json"} -Body $updateBody
Write-Host "  Credits updated: $($updateResult.data.credits)" -ForegroundColor Green

# Step 4: View updated member list
Write-Host "`n[ADMIN] Viewing updated member list..." -ForegroundColor Magenta
$updatedMembers = Invoke-RestMethod -Uri "http://localhost:3000/users" -Headers @{"x-api-key"=$adminKey}
$membersList = $updatedMembers.data | Where-Object {$_.role -eq "member"}
Write-Host "  Total members: $($membersList.Count)" -ForegroundColor Green
foreach($member in $membersList) {
    Write-Host "  - $($member.name) - Credits: $($member.credits)" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MEMBER MANAGEMENT TEST COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
