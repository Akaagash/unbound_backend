@echo off
echo ========================================
echo  BACKEND INTEGRATION VERIFICATION
echo ========================================
echo.

echo Testing Backend Health...
curl -s http://localhost:3000/health
echo.
echo.

echo Testing Authentication...
curl -s -H "x-api-key: 24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137" http://localhost:3000/auth/me
echo.
echo.

echo Testing Command Submission...
curl -s -X POST -H "x-api-key: 24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137" -H "Content-Type: application/json" -d "{\"command_text\": \"pwd\"}" http://localhost:3000/commands/submit
echo.
echo.

echo ========================================
echo If all tests show "success":true
echo YOUR INTEGRATION IS WORKING PERFECTLY!
echo ========================================
pause
