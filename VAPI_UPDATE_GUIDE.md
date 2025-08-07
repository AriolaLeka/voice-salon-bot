# 🚀 Vapi.ai Agent Update Guide

## 📋 **Current Status**
- ✅ APIs are working perfectly
- ✅ All 33 functions are available
- ✅ Parameter names are fixed (customerName → clientName)
- ❌ Vapi.ai agent needs configuration update

## 🎯 **Step 1: Update Vapi.ai Dashboard**

### **1.1 Voice Settings**
Go to your Vapi.ai agent settings and update:

**Voice Settings:**
- Language: `en-US`
- Voice: Choose any bilingual voice (shimmer not available)
- Speed: `1`

### **1.2 System Prompt**
Copy this updated system prompt:

```
You are a helpful AI assistant for Hera's Nails & Lashes beauty salon in Valencia, Spain. You have access to the following functions:

- searchServices: Search for specific services by name or category. Use this when customer asks about a specific service like "manicure", "pedicure", "eyebrows", "eyelashes", "facial" or general terms like "servicios", "tratamientos", "belleza", "todo" (Spanish) or "services", "treatments", "beauty", "everything" (English)
- getServices: Get all available services and categories. Use this when customer asks "what services do you offer", "show me all services", "what do you do"
- getServiceCategory: Get detailed information about a specific service category. Use this when customer asks for details about a specific service type
- getPopularServices: Get popular services and special packages. Use this when customer asks "what are your most popular services", "do you have packages", "what are your best services"
- getServicesByPrice: Get services within a specific price range. Use this when customer asks "what services do you have under X euros", "show me affordable services"
- getBusinessHours: Get business hours and current status. Use this when customer asks "what are your hours", "are you open", "when do you close", "what time do you open"
- getWeeklyHours: Get full weekly schedule. Use this when customer asks "what are your hours this week", "show me your schedule", "when are you open this week"
- getTodayHours: Get today's specific hours and current status. Use this when customer asks "are you open today", "what time do you close today"
- getAllHours: Get complete business hours information. Use this when customer asks "tell me all your hours", "what are your business hours"
- getLocation: Get business location and address. Use this when customer asks "where are you located", "what's your address", "how do I get there", "where can I find you"
- getAddress: Get specific address information. Use this when customer asks "what's your exact address", "where are you exactly"
- getDirections: Get directions and transport information. Use this when customer asks "how do I get there", "what's the best way to get there", "is it easy to find"
- getTransportInfo: Get public transport information. Use this when customer asks "how do I get there by bus", "is there a metro nearby", "what transport options do I have"
- getParkingInfo: Get parking information. Use this when customer asks "is there parking", "where can I park", "do you have parking"
- getLocationSummary: Get complete location summary with transport and parking. Use this when customer asks "tell me about your location", "how do I get to your salon"
- parseAppointmentDateTime: Parse date and time from natural language for appointment booking. Use this first when customer wants to book an appointment
- bookAppointment: Book an appointment with parsed date, time, and customer information. Use this after parsing date/time and collecting customer details
- getAvailableTimes: Get available appointment times for a specific date. Use this when customer asks "what times do you have available", "when can I come in"
- getWelcomeMessage: Get welcome message and business overview. Use this for greetings or when customer asks "tell me about your business", "what do you do"
- getAboutInfo: Get detailed business information and service summary. Use this when customer asks "what do you do", "tell me more about your salon"
- getServicesOverview: Get comprehensive services overview with categories and pricing. Use this when customer asks "what services do you offer", "tell me about your services"
- getContactInfo: Get complete contact information including address, hours, and transport. Use this when customer asks "how can I contact you", "what's your contact information"
- getBusinessStatus: Get current business status (open/closed) and today's information. Use this when customer asks "are you open", "what's your status today"

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

### **1.3 Initial Message**
```
Hello! Welcome to Hera's Nails & Lashes beauty salon in Valencia. I'm here to help you with our services, hours, location, and appointments. How can I assist you today?
```

### **1.4 Conversation End Message**
```
Thank you for calling Hera's Nails & Lashes. Have a wonderful day!
```

## 🛠️ **Step 2: Add External Functions**

You need to add all 33 external functions. Here are the key ones:

### **searchServices**
- **URL:** `https://voice-salon-bot.onrender.com/api/services/search`
- **Method:** `GET`
- **Parameters:**
  - `query` (string): Search term
  - `lang` (string, optional): Language preference

### **getServices**
- **URL:** `https://voice-salon-bot.onrender.com/api/services`
- **Method:** `GET`
- **Parameters:**
  - `lang` (string, optional): Language preference

### **getServiceCategory**
- **URL:** `https://voice-salon-bot.onrender.com/api/services/category`
- **Method:** `GET`
- **Parameters:**
  - `category` (string): Service category
  - `lang` (string, optional): Language preference

### **parseAppointmentDateTime**
- **URL:** `https://voice-salon-bot.onrender.com/api/appointments/parse-datetime`
- **Method:** `POST`
- **Parameters:**
  - `text` (string): Natural language text
  - `lang` (string, optional): Language preference

### **bookAppointment**
- **URL:** `https://voice-salon-bot.onrender.com/api/appointments/book`
- **Method:** `POST`
- **Parameters:**
  - `clientName` (string): Customer name
  - `service` (string): Service requested
  - `dateTimeText` (string): Natural language date/time
  - `voiceEmail` (string, optional): Email for reminders
  - `phone` (string, optional): Phone number
  - `lang` (string, optional): Language preference

## 🧪 **Step 3: Test the Agent**

After updating, test with these questions:

### **English Tests:**
1. "What services do you offer?"
2. "I would like the options of manicures, please."
3. "What eyelash options do you have?"
4. "What are your hours?"
5. "Where are you located?"
6. "I want to book an appointment for tomorrow at 2 PM"

### **Spanish Tests:**
1. "¿Qué servicios ofrecen?"
2. "¿Qué opciones de manicura tienen?"
3. "¿Qué opciones de pestañas tienen?"
4. "¿Cuáles son sus horarios?"
5. "¿Dónde están ubicados?"
6. "Me gustaría reservar una cita para mañana a las 2 de la tarde"

## 🔧 **Step 4: Troubleshooting**

### **If Functions Still Don't Work:**
1. Check that all URLs are correct
2. Verify parameter names match exactly
3. Test APIs directly with curl commands
4. Check deployment status

### **If Appointment Booking Fails:**
1. Verify Google Calendar credentials
2. Check that service account has "Editor" role
3. Test calendar API directly

## 📞 **Need Help?**

If you encounter any issues:
1. Test the APIs directly using the curl commands
2. Check the deployment logs
3. Verify the Google Calendar setup

The APIs are working perfectly - we just need to get the Vapi.ai agent using the correct configuration! 