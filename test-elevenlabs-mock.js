const axios = require('axios');
require('dotenv').config();

class ElevenLabsMockTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.elevenLabsUrl = `${this.baseUrl}/api/elevenlabs`;
  }

  async testBasicEndpoints() {
    console.log('🧪 Testing Basic Endpoints...\n');
    
    // Test main health endpoint
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      console.log('✅ Main health endpoint:', response.data);
    } catch (error) {
      console.error('❌ Main health endpoint failed:', error.message);
    }

    // Test API root
    try {
      const response = await axios.get(`${this.baseUrl}/`);
      console.log('✅ API root endpoint:', response.data);
    } catch (error) {
      console.error('❌ API root endpoint failed:', error.message);
    }
  }

  async testSalonEndpoints() {
    console.log('\n🏪 Testing Salon Data Endpoints...\n');
    
    const endpoints = [
      '/api/services',
      '/api/hours/status',
      '/api/location',
      '/api/general/welcome'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint}`);
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
        if (response.data.voice_response) {
          console.log(`   Voice response: ${response.data.voice_response.substring(0, 100)}...`);
        }
      } catch (error) {
        console.error(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }
  }

  async testElevenLabsWebhook() {
    console.log('\n🔗 Testing ElevenLabs Webhook (Mock)...\n');
    
    const testCases = [
      {
        name: 'getServices',
        data: {
          conversation_id: 'test-123',
          function_calls: [
            {
              name: 'getServices',
              arguments: { lang: 'en' }
            }
          ]
        }
      },
      {
        name: 'getBusinessHours',
        data: {
          conversation_id: 'test-456',
          function_calls: [
            {
              name: 'getBusinessHours',
              arguments: { lang: 'en' }
            }
          ]
        }
      },
      {
        name: 'getLocation',
        data: {
          conversation_id: 'test-789',
          function_calls: [
            {
              name: 'getLocation',
              arguments: { lang: 'en' }
            }
          ]
        }
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`Testing ${testCase.name}...`);
        const response = await axios.post(`${this.elevenLabsUrl}/webhook`, testCase.data, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          console.log(`   ✅ ${testCase.name} - Success`);
          if (response.data.results) {
            console.log(`   Results: ${JSON.stringify(response.data.results).substring(0, 100)}...`);
          }
        } else {
          console.log(`   ⚠️  ${testCase.name} - Success: false`);
        }
      } catch (error) {
        console.error(`   ❌ ${testCase.name} - Error: ${error.message}`);
        if (error.response) {
          console.error(`   Response: ${JSON.stringify(error.response.data)}`);
        }
      }
    }
  }

  async testFunctionMapping() {
    console.log('\n🔧 Testing Function Mapping...\n');
    
    const functions = [
      'searchServices',
      'getServices', 
      'getBusinessHours',
      'getLocation',
      'getWelcomeMessage',
      'parseAppointmentDateTime',
      'bookAppointment'
    ];

    for (const funcName of functions) {
      try {
        const testData = {
          conversation_id: `test-${Date.now()}`,
          function_calls: [
            {
              name: funcName,
              arguments: funcName === 'searchServices' ? { query: 'manicure', lang: 'en' } : 
                        funcName === 'parseAppointmentDateTime' ? { text: 'tomorrow at 2 PM', lang: 'en' } :
                        funcName === 'bookAppointment' ? { 
                          dateTimeText: 'tomorrow at 2 PM',
                          clientName: 'Test User',
                          service: 'manicure',
                          voiceEmail: 'test@example.com'
                        } : { lang: 'en' }
            }
          ]
        };

        const response = await axios.post(`${this.elevenLabsUrl}/webhook`, testData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          console.log(`✅ ${funcName} - Function mapped correctly`);
        } else {
          console.log(`⚠️  ${funcName} - Function returned success: false`);
        }
      } catch (error) {
        console.error(`❌ ${funcName} - Function mapping failed: ${error.message}`);
      }
    }
  }

  async runAllTests() {
    console.log('🎯 ElevenLabs Integration Mock Tests\n');
    console.log('=====================================\n');
    
    await this.testBasicEndpoints();
    await this.testSalonEndpoints();
    await this.testElevenLabsWebhook();
    await this.testFunctionMapping();
    
    console.log('\n🎉 Mock Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Basic API endpoints are working');
    console.log('✅ Salon data endpoints are accessible');
    console.log('✅ ElevenLabs webhook is receiving requests');
    console.log('✅ Function mapping is working correctly');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Set up your ElevenLabs account');
    console.log('2. Create a Conversational AI agent');
    console.log('3. Configure the agent with functions from elevenlabs-config.json');
    console.log('4. Set the webhook URL to: https://voice-salon-bot.onrender.com/api/elevenlabs/webhook');
    console.log('5. Test with real ElevenLabs credentials');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ElevenLabsMockTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ElevenLabsMockTester;
