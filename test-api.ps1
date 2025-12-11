# PowerShell test script for Command Gateway API

$API_BASE_URL = "http://localhost:3000"
$ADMIN_API_KEY = "24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137"

Write-Host "=== Command Gateway Backend API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/health" -Method GET
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Get Current User Info
Write-Host "2. Testing Authentication - GET /auth/me..." -ForegroundColor Yellow
try {
    $headers = @{ "x-api-key" = $ADMIN_API_KEY }
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/auth/me" -Method GET -Headers $headers
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Submit a Safe Command
Write-Host "3. Testing Command Submission (safe command: 'ls -la')..." -ForegroundColor Yellow
try {
    $headers = @{ 
        "x-api-key" = $ADMIN_API_KEY
        "Content-Type" = "application/json"
    }
    $body = @{ command_text = "ls -la" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/commands/submit" -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Submit a Dangerous Command
Write-Host "4. Testing Command Submission (dangerous command: 'rm -rf /')..." -ForegroundColor Yellow
try {
    $headers = @{ 
        "x-api-key" = $ADMIN_API_KEY
        "Content-Type" = "application/json"
    }
    $body = @{ command_text = "rm -rf /" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/commands/submit" -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
} catch {
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        Write-Host ($responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 10)
    } else {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Get Command History
Write-Host "5. Testing Command History - GET /commands/history..." -ForegroundColor Yellow
try {
    $headers = @{ "x-api-key" = $ADMIN_API_KEY }
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/commands/history" -Method GET -Headers $headers
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Number of commands: $($json.data.Count)"
    Write-Host ($json | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: List Rules
Write-Host "6. Testing List Rules - GET /rules..." -ForegroundColor Yellow
try {
    $headers = @{ "x-api-key" = $ADMIN_API_KEY }
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/rules" -Method GET -Headers $headers
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Number of rules: $($json.data.Count)"
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Invalid API Key
Write-Host "7. Testing Invalid API Key..." -ForegroundColor Yellow
try {
    $headers = @{ "x-api-key" = "invalid_key_12345" }
    $response = Invoke-WebRequest -Uri "$API_BASE_URL/auth/me" -Method GET -Headers $headers
} catch {
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        Write-Host ($responseBody | ConvertFrom-Json | ConvertTo-Json -Depth 10)
    } else {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "=== All Tests Completed ===" -ForegroundColor Cyan
