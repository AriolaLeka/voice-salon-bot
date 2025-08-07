# 🤖 Smart Vapi.ai Configuration System

This system automatically manages your Vapi.ai configuration, eliminating the need for manual updates in the Vapi.ai dashboard.

## 🚀 How It Works

1. **Automatic Function Discovery**: The system automatically discovers all your API endpoints
2. **Smart Configuration Generation**: Creates optimized Vapi.ai configurations with intelligent prompts
3. **One-Command Updates**: Update your entire Vapi.ai setup with a single command
4. **Easy Function Addition**: Add new functions with simple JavaScript code

## 📁 Files Overview

- `smart-vapi-registry.js` - Main registry system
- `update-vapi-config.js` - Simple update script
- `vapi-sync.js` - Advanced sync with Vapi.ai API
- `add-function.js` - Easy function addition
- `vapi-config.json` - Generated configuration (auto-updated)

## 🛠️ Quick Start

### 1. Update Configuration
```bash
node update-vapi-config.js
```

### 2. Add New Functions
Edit `add-function.js` and add your function:
```javascript
registry.registerFunction(
    'getPricing',
    'Get pricing information for specific services',
    '/api/services/pricing',
    'GET',
    {
        service: {
            type: 'string',
            description: 'Service name'
        }
    }
);
```

### 3. Deploy to Vapi.ai
Copy the generated `vapi-config.json` to your Vapi.ai agent dashboard.

## 🔧 Current Functions

The system automatically registers these functions:

### Services
- `searchServices` - Search for specific services
- `getServices` - Get all available services

### Hours & Location
- `getBusinessHours` - Current business status
- `getWeeklyHours` - Full weekly schedule
- `getLocation` - Business address and location

### Appointments
- `parseAppointmentDateTime` - Parse natural language dates
- `bookAppointment` - Book appointments with details
- `getAvailableTimes` - Check available time slots

### General Info
- `getWelcomeMessage` - Welcome and business overview
- `getAboutInfo` - Detailed business information

## 🎯 Benefits

### ✅ **Minimal Vapi.ai Work**
- No more manual function configuration
- No more manual prompt updates
- Everything handled in your code

### ✅ **Automatic Updates**
- Add new API endpoints → automatically available in Vapi.ai
- Update function descriptions → automatically updated
- Change system prompts → automatically updated

### ✅ **Smart Intelligence**
- Intelligent function descriptions
- Context-aware system prompts
- Automatic language detection
- Optimized for voice interactions

### ✅ **Easy Maintenance**
- All configuration in one place
- Version controlled with your code
- Easy to test and debug

## 🔄 Workflow

1. **Add new API endpoint** in your routes
2. **Run update script**: `node update-vapi-config.js`
3. **Copy config** to Vapi.ai dashboard
4. **Test** your agent

## 📋 Example Usage

### Adding a New Pricing Function

1. Create the API endpoint in your routes
2. Edit `add-function.js`:
```javascript
registry.registerFunction(
    'getPricing',
    'Get pricing for services',
    '/api/services/pricing',
    'GET',
    {
        service: { type: 'string', description: 'Service name' }
    }
);
```

3. Run: `node add-function.js`
4. Copy `vapi-config.json` to Vapi.ai

### Testing Your Agent

Test with these sample requests:
- "What services do you offer?"
- "Tell me about manicures"
- "What are your hours?"
- "I want to book an appointment for tomorrow at 2 PM"

## 🎉 Result

**Before**: Manual configuration in Vapi.ai dashboard for every change
**After**: Everything handled automatically in your codebase

You now have a **smart, automated system** that keeps your Vapi.ai agent perfectly synchronized with your backend API! 🚀 