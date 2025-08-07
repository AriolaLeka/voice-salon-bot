#!/usr/bin/env node

const https = require('https');

// Test configuration
const BASE_URL = 'https://voice-salon-bot.onrender.com';

// Test functions
const tests = [
  {
    name: 'getServices (English)',
    url: `${BASE_URL}/api/services?lang=en`,
    method: 'GET'
  },
  {
    name: 'getServices (Spanish)',
    url: `${BASE_URL}/api/services?lang=es`,
    method: 'GET'
  },
  {
    name: 'searchServices - manicure (English)',
    url: `${BASE_URL}/api/services/search?query=manicure&lang=en`,
    method: 'GET'
  },
  {
    name: 'searchServices - manicure (Spanish)',
    url: `${BASE_URL}/api/services/search?query=manicura&lang=es`,
    method: 'GET'
  },
  {
    name: 'getServiceCategory - manicuras (English)',
    url: `${BASE_URL}/api/services/category?category=manicuras&lang=en`,
    method: 'GET'
  },
  {
    name: 'getBusinessHours (English)',
    url: `${BASE_URL}/api/hours/status?lang=en`,
    method: 'GET'
  },
  {
    name: 'getLocation (English)',
    url: `${BASE_URL}/api/location?lang=en`,
    method: 'GET'
  },
  {
    name: 'parseAppointmentDateTime (English)',
    url: `${BASE_URL}/api/appointments/parse-datetime`,
    method: 'POST',
    data: JSON.stringify({
      text: 'tomorrow at 2 PM',
      lang: 'en'
    })
  }
];

function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(test.url);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script'
      }
    };

    if (test.data) {
      options.headers['Content-Length'] = Buffer.byteLength(test.data);
    }

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: jsonData.success,
            hasVoiceResponse: !!jsonData.voice_response,
            response: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            success: false,
            error: 'Invalid JSON response',
            response: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (test.data) {
      req.write(test.data);
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing All APIs...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const result = await makeRequest(test);
      
      if (result.status === 200 && result.success) {
        console.log(`✅ PASSED - Status: ${result.status}, Has voice_response: ${result.hasVoiceResponse}`);
        passed++;
      } else {
        console.log(`❌ FAILED - Status: ${result.status}, Success: ${result.success}`);
        console.log(`   Response: ${JSON.stringify(result.response, null, 2)}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All APIs are working perfectly!');
    console.log('Your Vapi.ai agent should work great once you update the configuration.');
  } else {
    console.log('\n⚠️  Some APIs failed. Check the deployment and try again.');
  }
}

// Run the tests
runTests().catch(console.error); 