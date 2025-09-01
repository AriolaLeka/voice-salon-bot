# 🗓️ Google Calendar Integration Setup

## 🎯 **Current Issue:**
The appointment booking system is working but emails aren't being sent because Google Calendar isn't properly configured.

## ✅ **What's Fixed:**
1. **Email parsing** - Now converts "Isabella at Gmail dot com" → "isabella@gmail.com"
2. **Graceful fallback** - System works even without Google Calendar setup
3. **Better error handling** - Clear messages when calendar isn't configured

## 🔧 **Google Calendar Setup Steps:**

### **1. Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Calendar API

### **2. Create Service Account**
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name it "Salon Calendar Bot"
4. Grant "Calendar API Admin" role

### **3. Download Credentials**
1. Click on the service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose JSON format
5. Download the file and rename to `credentials.json`

### **4. Set Environment Variables**
Add to your `.env` file:
```env
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
SALON_EMAIL=your-salon@email.com
```

### **5. Share Calendar**
1. Go to [Google Calendar](https://calendar.google.com/)
2. Find your calendar settings
3. Share with the service account email (found in credentials.json)
4. Give "Make changes to events" permission

## 🚀 **Deployment Steps:**

### **For Local Development:**
```bash
# Place credentials.json in project root
# Add to .env file
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
SALON_EMAIL=your-salon@email.com
```

### **For Render/Production:**
1. **Upload credentials to Render:**
   - Go to your Render dashboard
   - Navigate to Environment Variables
   - Add `GOOGLE_APPLICATION_CREDENTIALS` with the JSON content
   - Add `SALON_EMAIL` with your salon email

2. **Alternative - Use Render's file system:**
   - Upload `credentials.json` to your Render service
   - Set `GOOGLE_APPLICATION_CREDENTIALS=/opt/render/project/src/credentials.json`

## 🧪 **Testing the Integration:**

### **Test Email Parsing:**
```bash
curl -X POST http://localhost:3000/api/appointments/book \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Isabella",
    "service": "manicure",
    "dateTimeText": "tomorrow at 2 PM",
    "voiceEmail": "isabella at gmail dot com"
  }'
```

### **Expected Response:**
```json
{
  "success": true,
  "voice_response": "Perfect Isabella! Your appointment for manicure is confirmed for tomorrow at 2:00 PM. We'll send you an email reminder to isabella@gmail.com. Is there anything else I can help you with?",
  "appointment": {
    "clientName": "Isabella",
    "service": "manicure",
    "date": "2024-01-XX",
    "time": "14:00",
    "email": "isabella@gmail.com",
    "calendar_event_id": "event_123",
    "calendar_url": "https://calendar.google.com/event?eid=..."
  }
}
```

## 🔍 **Troubleshooting:**

### **If emails aren't sending:**
1. Check if `GOOGLE_APPLICATION_CREDENTIALS` is set
2. Verify calendar sharing permissions
3. Check service account has proper roles
4. Look for errors in console logs

### **If appointment booking fails:**
1. Verify all environment variables are set
2. Check that the calendar API is enabled
3. Ensure the service account has calendar access

## 📝 **Current Status:**
- ✅ **Email parsing** - Works with voice input
- ✅ **Appointment creation** - Creates local records
- ⚠️ **Google Calendar** - Needs credentials setup
- ⚠️ **Email reminders** - Will work once calendar is configured

The system will work without Google Calendar setup, but won't send email reminders until the credentials are properly configured. 