// Appointment utilities for voice booking system

const { google } = require('googleapis');
const moment = require('moment');

// Google Calendar API setup
const calendar = google.calendar('v3');
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/calendar']
});

// Language utility functions for multilingual support

// Detect language from request headers or query parameters
function detectLanguage(req) {
  // Check for explicit language parameter
  if (req.query.lang) {
    return req.query.lang.toLowerCase();
  }
  
  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    if (acceptLanguage.includes('en')) {
      return 'en';
    } else if (acceptLanguage.includes('es')) {
      return 'es';
    }
  }
  
  // Default to English for ElevenLabs calls
  return 'en';
}

// Parse email from voice input
function parseEmailFromVoice(text) {
  const lowerText = text.toLowerCase();
  
  // Common email patterns in voice
  const emailPatterns = [
    // "at" and "dot" patterns
    /([a-z0-9._%+-]+)\s+at\s+([a-z0-9.-]+)\s+dot\s+([a-z]{2,})/,
    /([a-z0-9._%+-]+)\s+at\s+([a-z0-9.-]+)\s+dot\s+([a-z]{2,})/,
    // "at" and "dot com" patterns
    /([a-z0-9._%+-]+)\s+at\s+([a-z0-9.-]+)\s+dot\s+com/,
    // Simple "at" patterns
    /([a-z0-9._%+-]+)\s+at\s+([a-z0-9.-]+)/,
    // Direct email patterns
    /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/
  ];
  
  for (const pattern of emailPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      if (match[1] && match[2] && match[3]) {
        // Pattern: name at domain dot com
        return `${match[1]}@${match[2]}.${match[3]}`;
      } else if (match[1] && match[2]) {
        // Pattern: name at domain
        return `${match[1]}@${match[2]}`;
      } else if (match[1]) {
        // Direct email
        return match[1];
      }
    }
  }
  
  // Handle common voice email patterns
  const voicePatterns = {
    'gmail': 'gmail.com',
    'yahoo': 'yahoo.com',
    'hotmail': 'hotmail.com',
    'outlook': 'outlook.com'
  };
  
  for (const [provider, domain] of Object.entries(voicePatterns)) {
    if (lowerText.includes(provider)) {
      // Extract username before "at"
      const usernameMatch = lowerText.match(/([a-z0-9._%+-]+)\s+at\s+/);
      if (usernameMatch) {
        return `${usernameMatch[1]}@${domain}`;
      }
    }
  }
  
  return null;
}

// Parse date and time from natural language
function parseAppointmentDateTime(text, language = 'en') {
  const lowerText = text.toLowerCase();
  
  // Common date patterns
  const datePatterns = {
    en: {
      today: /today|tonight/,
      tomorrow: /tomorrow/,
      thisWeek: /this week|this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/,
      nextWeek: /next week|next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/,
      specificDate: /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/,
      dateWithYear: /\d{1,2}\/\d{1,2}\/\d{4}/,
      dateWithSlash: /\d{1,2}\/\d{1,2}/
    },
    es: {
      today: /hoy|esta noche/,
      tomorrow: /mañana/,
      thisWeek: /esta semana|este (lunes|martes|miércoles|jueves|viernes|sábado|domingo)/,
      nextWeek: /próxima semana|próximo (lunes|martes|miércoles|jueves|viernes|sábado|domingo)/,
      specificDate: /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{1,2}/,
      dateWithYear: /\d{1,2}\/\d{1,2}\/\d{4}/,
      dateWithSlash: /\d{1,2}\/\d{1,2}/
    }
  };

  // Time patterns
  const timePatterns = {
    en: {
      hourMinute: /(\d{1,2}):(\d{2})\s*(am|pm)?/,
      hourOnly: /(\d{1,2})\s*(am|pm)/,
      morning: /morning|mañana/,
      afternoon: /afternoon|tarde/,
      evening: /evening|noche/
    },
    es: {
      hourMinute: /(\d{1,2}):(\d{2})\s*(am|pm)?/,
      hourOnly: /(\d{1,2})\s*(am|pm)/,
      morning: /mañana/,
      afternoon: /tarde/,
      evening: /noche/
    }
  };

  let date = null;
  let time = null;

  // Parse date
  const patterns = datePatterns[language];
  if (patterns.today.test(lowerText)) {
    date = moment().format('YYYY-MM-DD');
  } else if (patterns.tomorrow.test(lowerText)) {
    date = moment().add(1, 'day').format('YYYY-MM-DD');
  } else if (patterns.thisWeek.test(lowerText)) {
    // Find day of week mentioned
    const dayMatch = lowerText.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miércoles|jueves|viernes|sábado|domingo)/);
    if (dayMatch) {
      const dayName = dayMatch[0];
      const dayMap = {
        'monday': 1, 'lunes': 1,
        'tuesday': 2, 'martes': 2,
        'wednesday': 3, 'miércoles': 3,
        'thursday': 4, 'jueves': 4,
        'friday': 5, 'viernes': 5,
        'saturday': 6, 'sábado': 6,
        'sunday': 0, 'domingo': 0
      };
      const targetDay = dayMap[dayName];
      const currentDay = moment().day();
      const daysToAdd = (targetDay - currentDay + 7) % 7;
      date = moment().add(daysToAdd, 'days').format('YYYY-MM-DD');
    }
  } else if (patterns.specificDate.test(lowerText)) {
    // Parse specific date like "March 15" or "15 de marzo"
    const dateMatch = lowerText.match(patterns.specificDate);
    if (dateMatch) {
      // This would need more sophisticated parsing
      date = moment().format('YYYY-MM-DD'); // Placeholder
    }
  }

  // Parse time
  const timePatternsLang = timePatterns[language];
  if (timePatternsLang.hourMinute.test(lowerText)) {
    const timeMatch = lowerText.match(timePatternsLang.hourMinute);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const period = timeMatch[3] || '';
      
      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      
      time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  } else if (timePatternsLang.hourOnly.test(lowerText)) {
    const timeMatch = lowerText.match(timePatternsLang.hourOnly);
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const period = timeMatch[2] || '';
      
      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      
      time = `${hour.toString().padStart(2, '0')}:00`;
    }
  } else if (timePatternsLang.morning.test(lowerText)) {
    time = '10:00'; // Default morning time
  } else if (timePatternsLang.afternoon.test(lowerText)) {
    time = '14:00'; // Default afternoon time
  } else if (timePatternsLang.evening.test(lowerText)) {
    time = '18:00'; // Default evening time
  }

  console.log('Date parsing debug:', { input: text, date, time, isValid: !!(date && time) });
  return { date, time, isValid: !!(date && time) };
}

// Validate appointment time against business hours
function validateAppointmentTime(date, time, businessHours) {
  const appointmentDate = moment(date);
  const dayOfWeek = appointmentDate.format('dddd');
  const dayHours = businessHours[dayOfWeek];
  
  console.log('Validation debug:', { date, time, dayOfWeek, dayHours, businessHours });
  
  if (!dayHours || dayHours === 'Closed') {
    return { valid: false, reason: 'closed_on_day' };
  }

  const [startTime, endTime] = dayHours.split('-');
  const appointmentTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
  const startDateTime = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
  const endDateTime = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm');

  console.log('Time validation:', { appointmentTime: appointmentTime.format(), startDateTime: startDateTime.format(), endDateTime: endDateTime.format() });

  if (appointmentTime.isBefore(startDateTime) || appointmentTime.isAfter(endDateTime)) {
    return { valid: false, reason: 'outside_hours' };
  }

  return { valid: true };
}

// Create Google Calendar event
async function createCalendarEvent(appointmentData) {
  try {
    console.log('Creating calendar event for:', appointmentData);
    
    // Check if Google Calendar is properly configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Google Calendar not configured - skipping calendar event creation');
      return {
        success: true,
        eventId: 'local-' + Date.now(),
        eventUrl: null,
        note: 'Calendar integration not configured'
      };
    }
    
    const authClient = await auth.getClient();
    console.log('✅ Authentication successful');
    
    const event = {
      summary: `Appointment - ${appointmentData.service}`,
      description: `Client: ${appointmentData.clientName}\nService: ${appointmentData.service}\nPhone: ${appointmentData.phone || 'Not provided'}\nEmail: ${appointmentData.email || 'Not provided'}`,
      start: {
        dateTime: `${appointmentData.date}T${appointmentData.time}:00`,
        timeZone: 'Europe/Madrid',
      },
      end: {
        dateTime: `${appointmentData.date}T${moment(appointmentData.time, 'HH:mm').add(1, 'hour').format('HH:mm')}:00`,
        timeZone: 'Europe/Madrid',
      },
      // No attendees to avoid service account limitations
      // attendees: [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    console.log('Event data:', JSON.stringify(event, null, 2));

    const response = await calendar.events.insert({
      auth: authClient,
      calendarId: 'primary',
      resource: event,
    });

    console.log('✅ Calendar event created successfully');
    console.log('Event ID:', response.data.id);
    console.log('Event URL:', response.data.htmlLink);

    return {
      success: true,
      eventId: response.data.id,
      eventUrl: response.data.htmlLink
    };
  } catch (error) {
    console.error('❌ Error creating calendar event:', error);
    console.error('Error details:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate voice response for appointment booking
function generateAppointmentResponse(appointmentData, language = 'en') {
  const { clientName, service, date, time, email } = appointmentData;
  
  if (language === 'es') {
    if (email && email !== 'Not provided') {
      return {
        confirmation: `Perfecto, ${clientName}. Tu cita para ${service} está confirmada para el ${moment(date).format('DD/MM/YYYY')} a las ${time}. Te enviaremos un recordatorio por email a ${email}. ¿Hay algo más en lo que pueda ayudarte?`,
        summary: `Cita confirmada: ${service} - ${moment(date).format('DD/MM/YYYY')} ${time}`
      };
    } else {
      return {
        confirmation: `Perfecto, ${clientName}. Tu cita para ${service} está confirmada para el ${moment(date).format('DD/MM/YYYY')} a las ${time}. Te enviaremos un recordatorio por SMS. ¿Hay algo más en lo que pueda ayudarte?`,
        summary: `Cita confirmada: ${service} - ${moment(date).format('DD/MM/YYYY')} ${time}`
      };
    }
  } else {
    if (email && email !== 'Not provided') {
      return {
        confirmation: `Perfect, ${clientName}. Your appointment for ${service} is confirmed for ${moment(date).format('MM/DD/YYYY')} at ${time}. We'll send you an email reminder to ${email}. Is there anything else I can help you with?`,
        summary: `Appointment confirmed: ${service} - ${moment(date).format('MM/DD/YYYY')} ${time}`
      };
    } else {
      return {
        confirmation: `Perfect, ${clientName}. Your appointment for ${service} is confirmed for ${moment(date).format('MM/DD/YYYY')} at ${time}. We'll send you an SMS reminder. Is there anything else I can help you with?`,
        summary: `Appointment confirmed: ${service} - ${moment(date).format('MM/DD/YYYY')} ${time}`
      };
    }
  }
}

module.exports = {
  parseAppointmentDateTime,
  validateAppointmentTime,
  createCalendarEvent,
  generateAppointmentResponse,
  parseEmailFromVoice
}; 