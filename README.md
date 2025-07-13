# Hera's Nails & Lashes Voice Bot API

A Node.js backend API for the Hera's Nails & Lashes voice-driven salon bot, designed to work with Vapi.ai for voice interactions.

## 🏗️ Architecture

```
[Caller] → Twilio Number → Vapi.ai (STT/TTS) → Your Backend API → Salon Data
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
VAPI_API_KEY=your_vapi_api_key_here
VAPI_AGENT_ID=your_vapi_agent_id_here
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

## 🤖 Vapi.ai Integration

### 1. Create Vapi.ai Agent

1. Go to [Vapi.ai](https://vapi.ai)
2. Create a new agent
3. Configure voice settings (Spanish STT/TTS recommended)

### 2. Set Up External Functions

In your Vapi.ai agent, create these external functions:

#### Welcome Function
```javascript
{
  "name": "getWelcomeMessage",
  "url": "https://your-domain.com/api/general/welcome",
  "method": "GET"
}
```

#### Services Function
```javascript
{
  "name": "getServices",
  "url": "https://your-domain.com/api/services",
  "method": "GET"
}
```

#### Search Services Function
```javascript
{
  "name": "searchServices",
  "url": "https://your-domain.com/api/services/search",
  "method": "GET",
  "parameters": {
    "query": "string"
  }
}
```

#### Business Hours Function
```javascript
{
  "name": "getBusinessHours",
  "url": "https://your-domain.com/api/hours/status",
  "method": "GET"
}
```

#### Location Function
```javascript
{
  "name": "getLocationInfo",
  "url": "https://your-domain.com/api/location/summary",
  "method": "GET"
}
```

### 3. Vapi.ai System Prompt

Use this system prompt in your Vapi.ai agent:

```
Eres el asistente virtual de Hera's Nails & Lashes, especializado en servicios de belleza.
Tu función es proporcionar información sobre nuestros servicios.

ESTILO DE CONVERSACIÓN:
• Usa frases cortas y directas
• Máximo 2-3 frases por respuesta
• Sé natural y conversacional
• Evita textos largos y formales
• Responde como un amigo experto

HORARIOS DE ATENCIÓN:
Lunes a Viernes: 10:00-18:00
Sábado y Domingo: Cerrado

SOBRE NOSOTROS:
• Somos Hera's Nails & Lashes, centro de belleza especializado en manicuras, pedicuras, cejas, pestañas y tratamientos faciales en Valencia. Ubicados en Calle Santos Justo y Pastor, cerca de La Salud.

TU FUNCIÓN:
1. Proporcionar información sobre servicios
2. Ayudar a encontrar servicios adecuados
3. Explicar características y precios
4. Informar sobre horarios y ubicación
5. NO realizamos ventas directas

INSTRUCCIONES:
1. Para primera vez, usa getWelcomeMessage
2. Para servicios específicos, usa searchServices
3. Para horarios, usa getBusinessHours
4. Para ubicación, usa getLocationInfo
5. Para información general, usa getServices
6. Responde en español
7. Sé amable y profesional
```

## 📞 Twilio Setup

1. Buy a Twilio phone number
2. Configure the number to forward calls to your Vapi.ai agent
3. In Twilio console, set the webhook URL to your Vapi.ai agent URL

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
| `VAPI_API_KEY` | Vapi.ai API key | Yes |
| `VAPI_AGENT_ID` | Vapi.ai agent ID | Yes |

### CORS Configuration

The API is configured to accept requests from Vapi.ai domains:
- `https://vapi.ai`
- `https://app.vapi.ai`
- `https://api.vapi.ai`

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

**Hera's Nails & Lashes API** - Powered by Vapi.ai & Node.js 