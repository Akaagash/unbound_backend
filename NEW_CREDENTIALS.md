# NEW API KEYS - DATABASE RECREATED

## Admin Credentials
- **Name:** Admin User
- **Role:** admin  
- **Credits:** 1000
- **API Key:** 4ddd6091cb8958efbba933e1fbac667a4592ca4c44b505c3f4f725e21d420ef6

##  Important Notes
- Old member API keys will NOT work
- Database was recreated with new schema
- You need to create member users again

## Start the System

### Terminal 1: Backend
`ash
cd "C:\newvolume V\cmd_gateway_backend"
npm start
`

### Terminal 2: Frontend
`ash
cd "C:\newvolume V\cmd_gateway_frntend"
npm start
`

### Browser
`
http://localhost:3001
`

**Login with:** 4ddd6091cb8958efbba933e1fbac667a4592ca4c44b505c3f4f725e21d420ef6

## Create Member Users

After starting the backend, run this in PowerShell:

`powershell
$adminKey = '4ddd6091cb8958efbba933e1fbac667a4592ca4c44b505c3f4f725e21d420ef6'

# Create John Member
Invoke-RestMethod -Uri 'http://localhost:3000/users' `
  -Method POST `
  -Headers @{'x-api-key'=$adminKey; 'Content-Type'='application/json'} `
  -Body '{"name":"John Member","role":"member","credits":100}'

# Create Sarah Member  
Invoke-RestMethod -Uri 'http://localhost:3000/users' `
  -Method POST `
  -Headers @{'x-api-key'=$adminKey; 'Content-Type'='application/json'} `
  -Body '{"name":"Sarah Member","role":"member","credits":100}'
`

This will return new API keys for the members.
