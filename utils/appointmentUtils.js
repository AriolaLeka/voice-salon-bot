// Appointment utilities for voice booking system

const { google } = require('googleapis');
const moment = require('moment');

// Google Calendar API setup
const calendar = google.calendar('v3');
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/calendar']
});

// Parse date and time from natural language
function parseAppointmentDateTime(text, language = 'en') {
  const lowerText = text.toLowerCase();
  
  // Common date patterns
  const datePatterns = {
    en: {
      today: /today|tonight/,
      tomorrow: /tomorrow/,
      thisWeek: /this week|this (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/,
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
  } else if (timePatternsLang.morning.test(lowerText)) {
    time = '10:00'; // Default morning time
  } else if (timePatternsLang.afternoon.test(lowerText)) {
    time = '14:00'; // Default afternoon time
  } else if (timePatternsLang.evening.test(lowerText)) {
    time = '18:00'; // Default evening time
  }

  return { date, time, isValid: !!(date && time) };
}

// Validate appointment time against business hours
function validateAppointmentTime(date, time, businessHours) {
  const appointmentDate = moment(date);
  const dayOfWeek = appointmentDate.format('dddd');
  const dayHours = businessHours[dayOfWeek];
  
  if (!dayHours || dayHours === 'Closed') {
    return { valid: false, reason: 'closed_on_day' };
  }

  const [startTime, endTime] = dayHours.split('-');
  const appointmentTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
  const startDateTime = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
  const endDateTime = moment(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm');

  if (appointmentTime.isBefore(startDateTime) || appointmentTime.isAfter(endDateTime)) {
    return { valid: false, reason: 'outside_hours' };
  }

  return { valid: true };
}

// Create Google Calendar event
async function createCalendarEvent(appointmentData) {
  try {
    const authClient = await auth.getClient();
    
    const event = {
      summary: `Appointment - ${appointmentData.service}`,
      description: `Client: ${appointmentData.clientName}\nService: ${appointmentData.service}\nPhone: ${appointmentData.phone}`,
      start: {
        dateTime: `${appointmentData.date}T${appointmentData.time}:00`,
        timeZone: 'Europe/Madrid',
      },
      end: {
        dateTime: `${appointmentData.date}T${appointmentData.time}:00`,
        timeZone: 'Europe/Madrid',
      },
      attendees: [
        { email: process.env.SALON_EMAIL },
        { email: appointmentData.email || 'client@example.com' }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      auth: authClient,
      calendarId: 'primary',
      resource: event,
    });

    return {
      success: true,
      eventId: response.data.id,
      eventUrl: response.data.htmlLink
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate voice response for appointment booking
function generateAppointmentResponse(appointmentData, language = 'en') {
  const { clientName, service, date, time } = appointmentData;
  
  if (language === 'es') {
    return {
      confirmation: `Perfecto, ${clientName}. Tu cita para ${service} está confirmada para el ${moment(date).format('DD/MM/YYYY')} a las ${time}. Te enviaremos un recordatorio por email. ¿Hay algo más en lo que pueda ayudarte?`,
      summary: `Cita confirmada: ${service} - ${moment(date).format('DD/MM/YYYY')} ${time}`
    };
  } else {
    return {
      confirmation: `Perfect, ${clientName}. Your appointment for ${service} is confirmed for ${moment(date).format('MM/DD/YYYY')} at ${time}. We'll send you an email reminder. Is there anything else I can help you with?`,
      summary: `Appointment confirmed: ${service} - ${moment(date).format('MM/DD/YYYY')} ${time}`
    };
  }
}

module.exports = {
  parseAppointmentDateTime,
  validateAppointmentTime,
  createCalendarEvent,
  generateAppointmentResponse
}; 