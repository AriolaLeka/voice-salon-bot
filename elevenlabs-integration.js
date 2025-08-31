const axios = require('axios');
const express = require('express');
const cors = require('cors');

class ElevenLabsIntegration {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.agentId = process.env.ELEVENLABS_AGENT_ID;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    
    if (!this.apiKey || !this.agentId) {
      console.error('❌ Missing required environment variables:');
      console.error('   ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must be set');
      process.exit(1);
    }
  }

  // Initialize ElevenLabs agent with our salon functions
  async initializeAgent() {
    try {
      console.log('🤖 Initializing ElevenLabs Conversational AI Agent...');
      
      // Get agent details using the correct Conversational AI endpoint
      const agentResponse = await axios.get(`${this.baseUrl}/convai/agents/${this.agentId}`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      console.log('✅ ElevenLabs Agent initialized successfully');
      console.log(`   Agent Name: ${agentResponse.data.name}`);
      console.log(`   Agent ID: ${this.agentId}`);
      
      return agentResponse.data;
    } catch (error) {
      console.error('❌ Error initializing ElevenLabs agent:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  // Generate signed URL for WebSocket connection
  async generateSignedUrl() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/convai/conversation/get-signed-url?agent_id=${this.agentId}`,
        {
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );

      return response.data.signed_url;
    } catch (error) {
      console.error('❌ Error generating signed URL:', error.message);
      throw error;
    }
  }

  // Generate conversation token for WebRTC connection
  async generateConversationToken() {
    try {
      const response = await axios.post(
        `${this.baseUrl}/convai/conversation/get-conversation-token`,
        {
          agent_id: this.agentId
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.conversation_token;
    } catch (error) {
      console.error('❌ Error generating conversation token:', error.message);
      throw error;
    }
  }

  // Handle webhook from ElevenLabs when function calls are needed
  async handleWebhook(req, res) {
    try {
      const { message, conversation_id, function_calls, tools } = req.body;
      
      console.log('📞 Received webhook from ElevenLabs:', {
        message: message?.text,
        conversation_id,
        function_calls: function_calls?.length || 0,
        tools: tools?.length || 0
      });

      // Handle both function_calls and tools (newer API)
      const calls = function_calls || tools || [];
      
      if (calls.length > 0) {
        const results = await this.executeFunctionCalls(calls);
        
        // Send results back to ElevenLabs
        const webhookResponse = await this.sendFunctionResults(conversation_id, results);
        
        res.json({
          success: true,
          results: webhookResponse
        });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      console.error('❌ Error handling webhook:', error.message);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Execute function calls from ElevenLabs
  async executeFunctionCalls(functionCalls) {
    const results = [];
    
    for (const funcCall of functionCalls) {
      try {
        console.log(`🔧 Executing function: ${funcCall.name}`);
        
        const result = await this.executeFunction(funcCall.name, funcCall.arguments || funcCall.parameters);
        results.push({
          function_name: funcCall.name,
          success: true,
          result: result
        });
      } catch (error) {
        console.error(`❌ Error executing function ${funcCall.name}:`, error.message);
        results.push({
          function_name: funcCall.name,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Execute individual function
  async executeFunction(functionName, args) {
    const baseUrl = process.env.API_BASE_URL || 'https://voice-salon-bot.onrender.com';
    
    // Map function names to API endpoints
    const functionMap = {
      'searchServices': `${baseUrl}/api/services/search`,
      'getServices': `${baseUrl}/api/services`,
      'getServiceCategory': `${baseUrl}/api/services/category`,
      'getPopularServices': `${baseUrl}/api/services/popular`,
      'getServicesByPrice': `${baseUrl}/api/services/price-range`,
      'getBusinessHours': `${baseUrl}/api/hours/status`,
      'getWeeklyHours': `${baseUrl}/api/hours/week`,
      'getTodayHours': `${baseUrl}/api/hours/today`,
      'getAllHours': `${baseUrl}/api/hours`,
      'getLocation': `${baseUrl}/api/location`,
      'getAddress': `${baseUrl}/api/location/address`,
      'getDirections': `${baseUrl}/api/location/directions`,
      'getTransportInfo': `${baseUrl}/api/location/transport`,
      'getParkingInfo': `${baseUrl}/api/location/parking`,
      'getLocationSummary': `${baseUrl}/api/location/summary`,
      'parseAppointmentDateTime': `${baseUrl}/api/appointments/parse-datetime`,
      'bookAppointment': `${baseUrl}/api/appointments/book`,
      'getAvailableTimes': `${baseUrl}/api/appointments/available-times`,
      'getWelcomeMessage': `${baseUrl}/api/general/welcome`,
      'getAboutInfo': `${baseUrl}/api/general/about`,
      'getServicesOverview': `${baseUrl}/api/general/services-overview`,
      'getContactInfo': `${baseUrl}/api/general/contact`,
      'getBusinessStatus': `${baseUrl}/api/general/status`
    };

    const endpoint = functionMap[functionName];
    if (!endpoint) {
      throw new Error(`Unknown function: ${functionName}`);
    }

    // Determine HTTP method based on function
    const isPostMethod = ['parseAppointmentDateTime', 'bookAppointment'].includes(functionName);
    const method = isPostMethod ? 'POST' : 'GET';

    const config = {
      method: method,
      url: endpoint,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (method === 'POST') {
      config.data = args;
    } else if (method === 'GET' && args) {
      config.params = args;
    }

    const response = await axios(config);
    return response.data;
  }

  // Send function results back to ElevenLabs
  async sendFunctionResults(conversationId, results) {
    try {
      const payload = {
        conversation_id: conversationId,
        function_results: results
      };

      const response = await axios.post(`${this.baseUrl}/convai/conversation/function-results`, payload, {
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error sending function results to ElevenLabs:', error.message);
      throw error;
    }
  }

  // Create Express router for webhook handling
  createRouter() {
    const router = express.Router();
    
    // Webhook endpoint for ElevenLabs
    router.post('/webhook', (req, res) => {
      this.handleWebhook(req, res);
    });

    // Health check for ElevenLabs integration
    router.get('/health', async (req, res) => {
      try {
        const agentInfo = await this.initializeAgent();
        res.json({
          status: 'OK',
          service: 'ElevenLabs Integration',
          agent: {
            id: this.agentId,
            name: agentInfo.name,
            status: 'connected'
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          status: 'ERROR',
          error: error.message
        });
      }
    });

    // Generate signed URL endpoint
    router.get('/signed-url', async (req, res) => {
      try {
        const signedUrl = await this.generateSignedUrl();
        res.json({
          success: true,
          signed_url: signedUrl
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Generate conversation token endpoint
    router.get('/conversation-token', async (req, res) => {
      try {
        const token = await this.generateConversationToken();
        res.json({
          success: true,
          conversation_token: token
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    return router;
  }
}

module.exports = ElevenLabsIntegration;
