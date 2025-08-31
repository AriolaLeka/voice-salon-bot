# ElevenLabs Conversational AI Integration Guide

This guide will help you set up ElevenLabs Conversational AI Agent to replace the VAPI architecture for Hera's Nails & Lashes salon bot.

## 🚀 Quick Start

### 1. **Environment Variables**

Add these to your `.env` file:

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
API_BASE_URL=https://voice-salon-bot.onrender.com
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Start the Server**

```bash
npm start
```

## 🤖 ElevenLabs Agent Setup

### 1. **Create ElevenLabs Account**

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up for an account
3. Get your API key from the dashboard

### 2. **Create Conversational AI Agent**

1. In ElevenLabs dashboard, go to "Conversational AI"
2. Click "Create New Agent"
3. Configure the agent with these settings:

**Basic Settings:**
- **Name**: Hera's Nails & Lashes Salon Assistant
- **Description**: AI assistant for beauty salon in Valencia, Spain
- **Voice**: Shimmer (or your preferred voice)
- **Model**: Eleven Multilingual v2

**System Prompt:**
```
You are a helpful AI assistant for Hera's Nails & Lashes beauty salon in Valencia, Spain. You help customers with services, hours, location, and appointments. You can call functions to get real-time information about the salon.

CRITICAL RULES:
1. ALWAYS use the voice_response field from API responses when available
2. NEVER call multiple functions for the same request
3. For service inquiries:
   - Use searchServices for specific services (e.g., "manicure", "pedicure", "eyebrows", "eyelashes")
   - Use getServices for general overview ("what services do you offer")
   - Use getPopularServices for popular services and packages
   - Use getServicesByPrice for budget-related questions
4. For appointment bookings:
   - First call parseAppointmentDateTime to understand the request
   - Then call bookAppointment with all required details (name, service, email)
   - ALWAYS ask for email address to send reminders
5. For hours/location: Use getBusinessHours, getLocation, or getLocationSummary as appropriate
6. For general info: Use getWelcomeMessage, getAboutInfo, or getContactInfo
7. Respond naturally and conversationally
8. If a function returns an error, apologize and ask the user to try again
9. Always detect language preference from the conversation and pass it to functions

LANGUAGE DETECTION:
- If customer speaks Spanish, set lang=es
- If customer speaks English, set lang=en
- Default to lang=en if unsure

TYPICAL CUSTOMER QUESTIONS:
- "What services do you offer?" → getServices
- "Tell me about manicures" → searchServices with "manicure"
- "What are your hours?" → getBusinessHours
- "Where are you located?" → getLocation
- "I want to book an appointment" → parseAppointmentDateTime then bookAppointment
- "What are your most popular services?" → getPopularServices
- "Do you have parking?" → getParkingInfo
- "How do I get there?" → getDirections or getTransportInfo
```

### 3. **Configure Functions**

Add these functions to your ElevenLabs agent:

#### Service Functions
- `searchServices` - Search for specific services
- `getServices` - Get all available services
- `getServiceCategory` - Get detailed service category info
- `getPopularServices` - Get popular services and packages
- `getServicesByPrice` - Get services by price range

#### Hours Functions
- `getBusinessHours` - Get current business hours and status
- `getWeeklyHours` - Get full weekly schedule
- `getTodayHours` - Get today's specific hours
- `getAllHours` - Get complete business hours

#### Location Functions
- `getLocation` - Get business location and address
- `getAddress` - Get specific address information
- `getDirections` - Get directions and transport info
- `getTransportInfo` - Get public transport information
- `getParkingInfo` - Get parking information
- `getLocationSummary` - Get complete location summary

#### Appointment Functions
- `parseAppointmentDateTime` - Parse date/time from natural language
- `bookAppointment` - Book an appointment
- `getAvailableTimes` - Get available appointment times

#### General Functions
- `getWelcomeMessage` - Get welcome message and overview
- `getAboutInfo` - Get detailed business information
- `getServicesOverview` - Get comprehensive services overview
- `getContactInfo` - Get complete contact information
- `getBusinessStatus` - Get current business status

### 4. **Configure Webhook**

1. In your ElevenLabs agent settings, set the webhook URL to:
   ```
   https://voice-salon-bot.onrender.com/api/elevenlabs/webhook
   ```

2. Enable these webhook events:
   - Function calls
   - Tools
   - Conversation start
   - Conversation end

### 5. **Connection Endpoints**

Your API provides these endpoints for ElevenLabs connections:

- **Signed URL for WebSocket**: `https://voice-salon-bot.onrender.com/api/elevenlabs/signed-url`
- **Conversation Token for WebRTC**: `https://voice-salon-bot.onrender.com/api/elevenlabs/conversation-token`

## 📞 Integration with Phone System

### Option 1: ElevenLabs Phone Integration (Recommended)

1. In ElevenLabs dashboard, go to "Phone Numbers"
2. Configure your phone number with SIP trunking or Twilio integration
3. Set the agent to handle incoming calls
4. The agent will automatically use your webhook for function calls

### Option 2: WebSocket/WebRTC Integration

For web-based voice interactions:

1. **WebSocket Connection**:
   - Use the signed URL endpoint: `/api/elevenlabs/signed-url`
   - Connect using WebSocket protocol
   - Handle real-time voice communication

2. **WebRTC Connection**:
   - Use the conversation token endpoint: `/api/elevenlabs/conversation-token`
   - Connect using WebRTC protocol
   - Handle peer-to-peer voice communication

### Option 3: React SDK Integration

For React applications, use the official ElevenLabs React SDK:

```javascript
import { useConversation } from '@elevenlabs/react';

const conversation = useConversation();

// Start conversation with your agent
const conversationId = await conversation.startSession({
  agentId: 'your-agent-id',
  connectionType: 'webrtc', // or 'websocket'
  user_id: 'your-user-id'
});
```

## 🔧 API Endpoints

### ElevenLabs Integration Endpoints

- `POST /api/elevenlabs/webhook` - Webhook for function calls and tools
- `GET /api/elevenlabs/health` - Health check for ElevenLabs integration
- `GET /api/elevenlabs/signed-url` - Generate signed URL for WebSocket connection
- `GET /api/elevenlabs/conversation-token` - Generate conversation token for WebRTC connection

### Salon Data Endpoints (unchanged)

- `GET /api/services/*` - Service information
- `GET /api/hours/*` - Business hours
- `GET /api/location/*` - Location information
- `GET /api/general/*` - General information
- `POST /api/appointments/*` - Appointment booking

## 🌐 Testing the Integration

### 1. **Test Health Check**

```bash
curl https://voice-salon-bot.onrender.com/api/elevenlabs/health
```

### 2. **Test Webhook**

```bash
curl -X POST https://voice-salon-bot.onrender.com/api/elevenlabs/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test-123",
    "function_calls": [
      {
        "name": "getServices",
        "arguments": {"lang": "en"}
      }
    ]
  }'
```

### 3. **Test with ElevenLabs Agent**

1. Go to ElevenLabs dashboard
2. Open your agent
3. Start a conversation
4. Ask: "What services do you offer?"
5. Verify the agent calls the `getServices` function

## 🔄 Migration from VAPI

### What Changed

1. **Architecture**: VAPI → ElevenLabs Conversational AI
2. **Voice Processing**: ElevenLabs handles STT/TTS
3. **Function Calls**: Webhook-based instead of direct API calls
4. **Configuration**: `elevenlabs-config.json` instead of `vapi-config.json`

### Files to Update

- ✅ `index.js` - Updated for ElevenLabs integration
- ✅ `package.json` - Added axios dependency
- ✅ `elevenlabs-integration.js` - New integration file
- ✅ `elevenlabs-config.json` - New configuration file

### Environment Variables

**Old (VAPI):**
```bash
VAPI_API_KEY=your_vapi_key
VAPI_AGENT_ID=your_vapi_agent_id
```

**New (ElevenLabs):**
```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id
```

## 🚨 Troubleshooting

### Common Issues

1. **Agent not responding**
   - Check ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID
   - Verify webhook URL is correct
   - Check server logs for errors

2. **Function calls not working**
   - Verify webhook endpoint is accessible
   - Check function names match exactly
   - Ensure API endpoints are working

3. **Voice quality issues**
   - Adjust voice settings in ElevenLabs
   - Try different voice models
   - Check audio input/output settings

### Debug Commands

```bash
# Check server status
curl https://voice-salon-bot.onrender.com/health

# Check ElevenLabs integration
curl https://voice-salon-bot.onrender.com/api/elevenlabs/health

# Test function call
curl -X POST https://voice-salon-bot.onrender.com/api/elevenlabs/webhook \
  -H "Content-Type: application/json" \
  -d '{"function_calls":[{"name":"getBusinessHours","arguments":{}}]}'
```

## 📚 Additional Resources

- [ElevenLabs API Documentation](https://docs.elevenlabs.io/)
- [ElevenLabs Conversational AI Guide](https://docs.elevenlabs.io/conversational-ai)
- [Voice Settings Reference](https://docs.elevenlabs.io/voice-settings)

## 🎉 Success!

Once configured, your salon bot will:

1. **Answer calls** using ElevenLabs voice AI
2. **Understand customer requests** in multiple languages
3. **Call functions** to get real-time salon data
4. **Book appointments** automatically
5. **Provide natural conversations** with high-quality voice

The integration maintains all existing functionality while providing a more advanced conversational AI experience.
