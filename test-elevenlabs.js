const axios = require('axios');
require('dotenv').config();

class ElevenLabsTester {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    this.elevenLabsUrl = `${this.baseUrl}/api/elevenlabs`;
  }

  async testHealthCheck() {
    console.log('🏥 Testing health check...');
    try {
      const response = await axios.get(`${this.elevenLabsUrl}/health`);
      console.log('✅ Health check passed:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return false;
    }
  }

  async testWebhook() {
    console.log('🔗 Testing webhook endpoint...');
    try {
      const testData = {
        conversation_id: 'test-conversation-123',
        function_calls: [
          {
            name: 'getServices',
            arguments: { lang: 'en' }
          }
        ]
      };

      const response = await axios.post(`${this.elevenLabsUrl}/webhook`, testData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Webhook test passed:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Webhook test failed:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }

  async testFunctionExecution() {
    console.log('🔧 Testing function execution...');
    
    const functions = [
      {
        name: 'getBusinessHours',
        arguments: { lang: 'en' }
      },
      {
        name: 'getLocation',
        arguments: { lang: 'en' }
      },
      {
        name: 'getWelcomeMessage',
        arguments: { lang: 'en' }
      }
    ];

    for (const func of functions) {
      try {
        console.log(`   Testing ${func.name}...`);
        const testData = {
          conversation_id: `test-${Date.now()}`,
          function_calls: [func]
        };

        const response = await axios.post(`${this.elevenLabsUrl}/webhook`, testData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          console.log(`   ✅ ${func.name} passed`);
        } else {
          console.log(`   ⚠️  ${func.name} returned success: false`);
        }
      } catch (error) {
        console.error(`   ❌ ${func.name} failed:`, error.message);
      }
    }
  }

  async testEnvironmentVariables() {
    console.log('🔑 Testing environment variables...');
    
    const requiredVars = ['ELEVENLABS_API_KEY', 'ELEVENLABS_AGENT_ID'];
    let allPresent = true;

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        console.log(`   ✅ ${varName} is set`);
      } else {
        console.log(`   ❌ ${varName} is missing`);
        allPresent = false;
      }
    }

    return allPresent;
  }

  async testMainAPIEndpoints() {
    console.log('🌐 Testing main API endpoints...');
    
    const endpoints = [
      '/health',
      '/api/services',
      '/api/hours/status',
      '/api/location',
      '/api/general/welcome'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseUrl}${endpoint}`);
        console.log(`   ✅ ${endpoint} - Status: ${response.status}`);
      } catch (error) {
        console.error(`   ❌ ${endpoint} - Error: ${error.message}`);
      }
    }
  }

  async runAllTests() {
    console.log('🧪 Starting ElevenLabs Integration Tests\n');
    
    const results = {
      environment: await this.testEnvironmentVariables(),
      health: await this.testHealthCheck(),
      webhook: await this.testWebhook(),
      mainAPI: true // Will be tested separately
    };

    console.log('\n📋 Test Results:');
    console.log('================');
    console.log(`Environment Variables: ${results.environment ? '✅' : '❌'}`);
    console.log(`Health Check: ${results.health ? '✅' : '❌'}`);
    console.log(`Webhook: ${results.webhook ? '✅' : '❌'}`);

    console.log('\n🔧 Testing function execution...');
    await this.testFunctionExecution();

    console.log('\n🌐 Testing main API endpoints...');
    await this.testMainAPIEndpoints();

    console.log('\n🎯 Summary:');
    if (results.environment && results.health && results.webhook) {
      console.log('✅ All critical tests passed! ElevenLabs integration is ready.');
      console.log('\n📞 Next steps:');
      console.log('1. Configure your ElevenLabs agent with the functions from elevenlabs-config.json');
      console.log('2. Set up the webhook URL in your ElevenLabs agent');
      console.log('3. Test with a real phone call or ElevenLabs dashboard');
    } else {
      console.log('❌ Some tests failed. Please check the errors above.');
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID are set');
      console.log('2. Verify the server is running on the correct port');
      console.log('3. Check that all API endpoints are accessible');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new ElevenLabsTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ElevenLabsTester;
