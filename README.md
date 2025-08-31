# Hera's Nails & Lashes Voice Bot API (ElevenLabs)

A Node.js backend API for the Hera's Nails & Lashes voice-driven salon bot, designed to work with ElevenLabs Conversational AI for voice interactions.

## 🏗️ Architecture

```
[Caller] → ElevenLabs Phone Integration → ElevenLabs Conversational AI → Your Backend API → Salon Data
```

## 📁 Project Structure

```
voice-salon-bot/
├── data/
│   ├── salon_info.json        # Scraped JSON (your existing products.json)
│   └── schedule.json          # Business hours & location (your existing)
├── routes/
│   ├── services.js            # Service-related endpoints
│   ├── hours.js               # Business hours endpoints
│   ├── location.js            # Location & parking endpoints
│   └── general.js             # General info & welcome endpoints
├── index.js                   # Express server
├── package.json
├── env.example                # Environment variables template
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
PORT=3000
NODE_ENV=development
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
API_BASE_URL=https://voice-salon-bot.onrender.com
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Services
- `GET /api/services` - Get all services
- `GET /api/services/search?query=manicura` - Search services
- `GET /api/services/popular` - Get popular services
- `GET /api/services/:category` - Get service by category
- `GET /api/services/price-range/:min/:max` - Get services by price range

### Business Hours
- `GET /api/hours` - Get all business hours
- `GET /api/hours/today` - Get today's hours
- `GET /api/hours/status` - Check if currently open
- `GET /api/hours/week` - Get weekly schedule

### Location
- `GET /api/location` - Get full location info
- `GET /api/location/address` - Get address only
- `GET /api/location/directions` - Get directions & transport
- `GET /api/location/transport` - Get public transport info
- `GET /api/location/parking` - Get parking information
- `GET /api/location/summary` - Get location summary for voice

### General
- `GET /api/general/welcome` - Get welcome message
- `GET /api/general/about` - Get business information
- `GET /api/general/services-overview` - Get services overview
- `GET /api/general/contact` - Get contact information
- `GET /api/general/status` - Get current business status

### ElevenLabs Integration
- `POST /api/elevenlabs/webhook` - Webhook for function calls
- `GET /api/elevenlabs/health` - Health check for ElevenLabs integration

## 🤖 ElevenLabs Integration

### 1. Create ElevenLabs Agent

1. Go to [ElevenLabs](https://elevenlabs.io)
2. Create a new Conversational AI agent
3. Configure voice settings (Shimmer voice recommended)

### 2. Set Up Functions

In your ElevenLabs agent, configure these functions:

#### Welcome Function
```javascript
{
  "name": "getWelcomeMessage",
  "description": "Get welcome message and business overview",
  "parameters": {
    "type": "object",
    "properties": {
      "lang": {
        "type": "string",
        "enum": ["en", "es"]
      }
    }
  }
}
```

#### Services Function
```javascript
{
  "name": "getServices",
  "description": "Get all available services and categories",
  "parameters": {
    "type": "object",
    "properties": {
      "lang": {
        "type": "string",
        "enum": ["en", "es"]
      }
    }
  }
}
```

#### Search Services Function
```javascript
{
  "name": "searchServices",
  "description": "Search for specific services by name or category",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search term (e.g., manicure, pedicure, eyebrows)"
      },
      "lang": {
        "type": "string",
        "enum": ["en", "es"]
      }
    },
    "required": ["query"]
  }
}
```

#### Business Hours Function
```javascript
{
  "name": "getBusinessHours",
  "description": "Get business hours and current status",
  "parameters": {
    "type": "object",
    "properties": {
      "lang": {
        "type": "string",
        "enum": ["en", "es"]
      }
    }
  }
}
```

#### Location Function
```javascript
{
  "name": "getLocation",
  "description": "Get business location and address",
  "parameters": {
    "type": "object",
    "properties": {
      "lang": {
        "type": "string",
        "enum": ["en", "es"]
      }
    }
  }
}
```

### 3. ElevenLabs System Prompt

Use this system prompt in your ElevenLabs agent:

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

## 📞 Phone Integration

### Option 1: ElevenLabs Phone Integration (Recommended)

1. In ElevenLabs dashboard, go to "Phone Integration"
2. Configure your phone number
3. Set the agent to handle incoming calls
4. The agent will automatically use your webhook for function calls

### Option 2: Custom Phone Integration

If you need to integrate with a specific phone system:

1. Use ElevenLabs API to handle voice interactions
2. Send audio to ElevenLabs for processing
3. Receive responses and play them back
4. The webhook will handle function calls automatically

## 🚀 Deployment

### Render (Recommended)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from your `.env` file

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Add environment variables in Vercel dashboard

### Heroku

1. Install Heroku CLI
2. Create app: `heroku create your-app-name`
3. Deploy: `git push heroku main`
4. Add environment variables: `heroku config:set KEY=value`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Yes |
| `ELEVENLABS_AGENT_ID` | ElevenLabs agent ID | Yes |
| `API_BASE_URL` | Base URL for API calls | No (default: https://voice-salon-bot.onrender.com) |

### CORS Configuration

The API is configured to accept requests from ElevenLabs domains:
- `https://api.elevenlabs.io`
- `https://elevenlabs.io`
- `https://app.elevenlabs.io`

## 📊 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

## 🧪 Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Get services
curl http://localhost:3000/api/services

# Get business hours
curl http://localhost:3000/api/hours/status

# Search services
curl "http://localhost:3000/api/services/search?query=manicura"
```

## 🔒 Security

- Helmet.js for security headers
- CORS configured for Vapi.ai domains
- Request logging for monitoring
- Error handling middleware
- Input validation

## 📝 Logging

The API logs all requests with timestamp and method:

```
2024-01-15T10:30:00.000Z - GET /api/services
2024-01-15T10:30:05.000Z - GET /api/hours/status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the API documentation
2. Review the logs
3. Test endpoints manually
4. Contact the development team

---

**Hera's Nails & Lashes API** - Powered by ElevenLabs Conversational AI & Node.js 