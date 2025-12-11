// Integration Test Script
// This tests all backend endpoints to verify they work correctly

const API_URL = 'http://localhost:3000';
const API_KEY = '24e7a55257591e409ed6f3b06d90e6d90e8d0bd8752228ae072a3a6671d4b137';

async function testEndpoint(name, method, endpoint, body = null) {
  try {
    const options = {
      method,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${name}: SUCCESS`);
      console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200));
      return true;
    } else {
      console.log(`❌ ${name}: FAILED`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error:`, data);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR`);
    console.log(`   ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n🔍 BACKEND INTEGRATION TEST\n');
  console.log('API URL:', API_URL);
  console.log('API Key:', API_KEY.substring(0, 20) + '...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Health Check
  if (await testEndpoint('Health Check', 'GET', '/health')) passed++; else failed++;
  
  // Test 2: Authentication
  if (await testEndpoint('Authentication', 'GET', '/auth/me')) passed++; else failed++;
  
  // Test 3: Submit Command
  if (await testEndpoint('Submit Command', 'POST', '/commands/submit', { command_text: 'pwd' })) passed++; else failed++;
  
  // Test 4: Command History
  if (await testEndpoint('Command History', 'GET', '/commands/history')) passed++; else failed++;
  
  // Test 5: List Rules
  if (await testEndpoint('List Rules', 'GET', '/rules')) passed++; else failed++;
  
  // Test 6: List Users
  if (await testEndpoint('List Users', 'GET', '/users')) passed++; else failed++;
  
  // Test 7: Audit Logs
  if (await testEndpoint('Audit Logs', 'GET', '/logs')) passed++; else failed++;
  
  // Test 8: Log Statistics
  if (await testEndpoint('Log Statistics', 'GET', '/logs/stats')) passed++; else failed++;
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`📊 TEST RESULTS: ${passed}/${passed + failed} passed`);
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Integration is PERFECT!');
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Check the errors above.`);
  }
  console.log('='.repeat(50) + '\n');
}

// Run tests
runTests().catch(console.error);
