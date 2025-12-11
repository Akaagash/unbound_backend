// Test script to verify all API endpoints
// This script demonstrates all the API functionality

const API_BASE_URL = 'http://localhost:3000';

// Default admin API key (from console output)
const ADMIN_API_KEY = '24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137';

async function makeRequest(method, endpoint, data = null, apiKey = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (apiKey) {
    options.headers['x-api-key'] = apiKey;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    return { error: error.message };
  }
}

async function runTests() {
  console.log('=== Command Gateway Backend API Tests ===\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check (no auth required)...');
  const health = await makeRequest('GET', '/health');
  console.log('Status:', health.status);
  console.log('Response:', JSON.stringify(health.data, null, 2));
  console.log('');

  // Test 2: Get Current User Info
  console.log('2. Testing Authentication - GET /auth/me...');
  const authMe = await makeRequest('GET', '/auth/me', null, ADMIN_API_KEY);
  console.log('Status:', authMe.status);
  console.log('Response:', JSON.stringify(authMe.data, null, 2));
  console.log('');

  // Test 3: Create a New Member User
  console.log('3. Testing User Creation - POST /users...');
  const newUser = await makeRequest('POST', '/users', {
    name: 'Test Member',
    role: 'member',
    credits: 100
  }, ADMIN_API_KEY);
  console.log('Status:', newUser.status);
  console.log('Response:', JSON.stringify(newUser.data, null, 2));
  const MEMBER_API_KEY = newUser.data.data?.api_key;
  console.log('');

  // Test 4: List All Users
  console.log('4. Testing List Users - GET /users...');
  const users = await makeRequest('GET', '/users', null, ADMIN_API_KEY);
  console.log('Status:', users.status);
  console.log('Response:', JSON.stringify(users.data, null, 2));
  console.log('');

  // Test 5: List Rules
  console.log('5. Testing List Rules - GET /rules...');
  const rules = await makeRequest('GET', '/rules', null, ADMIN_API_KEY);
  console.log('Status:', rules.status);
  console.log('Number of rules:', rules.data.data?.length);
  console.log('');

  // Test 6: Create a New Rule
  console.log('6. Testing Create Rule - POST /rules...');
  const newRule = await makeRequest('POST', '/rules', {
    pattern: '^npm\\s+install',
    action: 'AUTO_ACCEPT'
  }, ADMIN_API_KEY);
  console.log('Status:', newRule.status);
  console.log('Response:', JSON.stringify(newRule.data, null, 2));
  console.log('');

  // Test 7: Submit a Safe Command (should execute)
  console.log('7. Testing Command Submission (safe) - POST /commands/submit...');
  const safeCmd = await makeRequest('POST', '/commands/submit', {
    command_text: 'ls -la'
  }, MEMBER_API_KEY || ADMIN_API_KEY);
  console.log('Status:', safeCmd.status);
  console.log('Response:', JSON.stringify(safeCmd.data, null, 2));
  console.log('');

  // Test 8: Submit a Dangerous Command (should reject)
  console.log('8. Testing Command Submission (dangerous) - POST /commands/submit...');
  const dangerousCmd = await makeRequest('POST', '/commands/submit', {
    command_text: 'rm -rf /'
  }, MEMBER_API_KEY || ADMIN_API_KEY);
  console.log('Status:', dangerousCmd.status);
  console.log('Response:', JSON.stringify(dangerousCmd.data, null, 2));
  console.log('');

  // Test 9: Get Command History
  console.log('9. Testing Command History - GET /commands/history...');
  const history = await makeRequest('GET', '/commands/history', null, MEMBER_API_KEY || ADMIN_API_KEY);
  console.log('Status:', history.status);
  console.log('Number of commands:', history.data.data?.length);
  console.log('');

  // Test 10: Get Audit Logs
  console.log('10. Testing Audit Logs - GET /logs...');
  const logs = await makeRequest('GET', '/logs', null, ADMIN_API_KEY);
  console.log('Status:', logs.status);
  console.log('Number of logs:', logs.data.data?.length);
  console.log('');

  // Test 11: Get Audit Log Stats
  console.log('11. Testing Audit Log Stats - GET /logs/stats...');
  const stats = await makeRequest('GET', '/logs/stats', null, ADMIN_API_KEY);
  console.log('Status:', stats.status);
  console.log('Response:', JSON.stringify(stats.data, null, 2));
  console.log('');

  // Test 12: Test Invalid API Key (should fail)
  console.log('12. Testing Invalid API Key...');
  const invalidAuth = await makeRequest('GET', '/auth/me', null, 'invalid_key');
  console.log('Status:', invalidAuth.status);
  console.log('Response:', JSON.stringify(invalidAuth.data, null, 2));
  console.log('');

  // Test 13: Test Member Accessing Admin Route (should fail)
  if (MEMBER_API_KEY) {
    console.log('13. Testing Member Accessing Admin Route (should fail)...');
    const memberFail = await makeRequest('GET', '/users', null, MEMBER_API_KEY);
    console.log('Status:', memberFail.status);
    console.log('Response:', JSON.stringify(memberFail.data, null, 2));
    console.log('');
  }

  console.log('=== All Tests Completed ===');
}

// Run tests
runTests().catch(console.error);
