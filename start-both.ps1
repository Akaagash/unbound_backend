# Quick Start Script - Run Both Servers

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Command Gateway - Starting Both Servers" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Backend is already running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running. Starting backend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\newvolume V\cmd_gateway_backend'; npm start"
    Write-Host "✓ Backend starting in new window..." -ForegroundColor Green
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "Backend Information:" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:3000" -ForegroundColor White
Write-Host "  Admin API Key: 24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137" -ForegroundColor White
Write-Host ""

# Start frontend
Write-Host "Starting frontend..." -ForegroundColor Yellow
Write-Host "  Frontend will start on port 3001 (or next available)" -ForegroundColor White
Write-Host ""

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\newvolume V\cmd_gateway_frntend'; npm start"

Write-Host "✓ Frontend starting in new window..." -ForegroundColor Green
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Both servers are starting!" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "Test Page: file:///C:/newvolume%20V/cmd_gateway_frntend/public/integration-test.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open the integration test page in browser..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "C:\newvolume V\cmd_gateway_frntend\public\integration-test.html"
