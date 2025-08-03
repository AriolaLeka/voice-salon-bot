const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { detectLanguage } = require('../utils/languageUtils');
const { 
  parseAppointmentDateTime, 
  validateAppointmentTime, 
  createCalendarEvent, 
  generateAppointmentResponse 
} = require('../utils/appointmentUtils');

// Load schedule data for validation
let scheduleData = null;

async function loadScheduleData() {
  if (!scheduleData) {
    try {
      const dataPath = path.join(__dirname, '..', 'schedule.json');
      const data = await fs.readFile(dataPath, 'utf8');
      scheduleData = JSON.parse(data);
    } catch (error) {
      console.error('Error loading schedule data:', error);
      scheduleData = { business_hours: {} };
    }
  }
  return scheduleData;
}

// POST /api/appointments/book - Book an appointment
router.post('/book', async (req, res) => {
  try {
    const { clientName, service, dateTimeText, phone, email } = req.body;
    const language = detectLanguage(req);
    
    if (!clientName || !service || !dateTimeText) {
      return res.status(400).json({
        success: false,
        error: language === 'es' ? 'Faltan datos requeridos' : 'Missing required data',
        required: ['clientName', 'service', 'dateTimeText']
      });
    }

    // Parse date and time from natural language
    const parsedDateTime = parseAppointmentDateTime(dateTimeText, language);
    
    if (!parsedDateTime.isValid) {
      return res.json({
        success: false,
        voice_response: language === 'es' 
          ? `Lo siento, no pude entender la fecha y hora. Por favor, dime algo como "mañana a las 2 de la tarde" o "el viernes a las 10 de la mañana".`
          : `Sorry, I couldn't understand the date and time. Please tell me something like "tomorrow at 2 PM" or "Friday at 10 AM".`,
        needs_clarification: true
      });
    }

    // Validate against business hours
    const { business_hours } = await loadScheduleData();
    const validation = validateAppointmentTime(parsedDateTime.date, parsedDateTime.time, business_hours);
    
    if (!validation.valid) {
      let errorMessage;
      if (validation.reason === 'closed_on_day') {
        errorMessage = language === 'es' 
          ? `Lo siento, estamos cerrados ese día. Nuestros horarios son de lunes a viernes de 10:00 a 18:00.`
          : `Sorry, we're closed on that day. Our hours are Monday to Friday from 10:00 to 18:00.`;
      } else if (validation.reason === 'outside_hours') {
        errorMessage = language === 'es'
          ? `Lo siento, ese horario está fuera de nuestro horario de atención. Estamos abiertos de 10:00 a 18:00.`
          : `Sorry, that time is outside our business hours. We're open from 10:00 to 18:00.`;
      }
      
      return res.json({
        success: false,
        voice_response: errorMessage,
        needs_clarification: true
      });
    }

    // Create appointment data
    const appointmentData = {
      clientName,
      service,
      date: parsedDateTime.date,
      time: parsedDateTime.time,
      phone: phone || 'Not provided',
      email: email || 'Not provided'
    };

    // Create Google Calendar event
    const calendarResult = await createCalendarEvent(appointmentData);
    
    if (!calendarResult.success) {
      return res.json({
        success: false,
        voice_response: language === 'es'
          ? `Lo siento, hubo un problema al crear la cita. Por favor, intenta de nuevo o contacta con nosotros directamente.`
          : `Sorry, there was a problem creating the appointment. Please try again or contact us directly.`
      });
    }

    // Generate voice response
    const response = generateAppointmentResponse(appointmentData, language);

    res.json({
      success: true,
      voice_response: response.confirmation,
      appointment: {
        ...appointmentData,
        calendar_event_id: calendarResult.eventId,
        calendar_url: calendarResult.eventUrl
      }
    });

  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      error: 'Error booking appointment'
    });
  }
});

// GET /api/appointments/available-times - Get available times for a date
router.get('/available-times/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const language = detectLanguage(req);
    const { business_hours } = await loadScheduleData();
    
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayHours = business_hours[dayOfWeek];
    
    if (!dayHours || dayHours === 'Closed') {
      return res.json({
        success: false,
        voice_response: language === 'es'
          ? `Lo siento, estamos cerrados ese día.`
          : `Sorry, we're closed on that day.`
      });
    }

    const [startTime, endTime] = dayHours.split('-');
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    // Generate available time slots (every hour)
    const availableTimes = [];
    for (let hour = startHour; hour < endHour; hour++) {
      availableTimes.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    const voiceResponse = language === 'es'
      ? `Para el ${new Date(date).toLocaleDateString('es-ES')}, tenemos horarios disponibles de ${startTime} a ${endTime}. Horarios disponibles: ${availableTimes.join(', ')}.`
      : `For ${new Date(date).toLocaleDateString('en-US')}, we have available times from ${startTime} to ${endTime}. Available times: ${availableTimes.join(', ')}.`;

    res.json({
      success: true,
      voice_response: voiceResponse,
      available_times: availableTimes,
      business_hours: dayHours
    });

  } catch (error) {
    console.error('Error getting available times:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting available times'
    });
  }
});

// POST /api/appointments/parse-datetime - Parse date/time from text
router.post('/parse-datetime', async (req, res) => {
  try {
    const { text } = req.body;
    const language = detectLanguage(req);
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text parameter is required'
      });
    }

    const parsedDateTime = parseAppointmentDateTime(text, language);
    
    if (!parsedDateTime.isValid) {
      return res.json({
        success: false,
        voice_response: language === 'es' 
          ? `No pude entender la fecha y hora. Por favor, dime algo como "mañana a las 2 de la tarde" o "el viernes a las 10 de la mañana".`
          : `I couldn't understand the date and time. Please tell me something like "tomorrow at 2 PM" or "Friday at 10 AM".`,
        needs_clarification: true
      });
    }

    // Validate against business hours
    const { business_hours } = await loadScheduleData();
    const validation = validateAppointmentTime(parsedDateTime.date, parsedDateTime.time, business_hours);
    
    if (!validation.valid) {
      let errorMessage;
      if (validation.reason === 'closed_on_day') {
        errorMessage = language === 'es' 
          ? `Lo siento, estamos cerrados ese día. Nuestros horarios son de lunes a viernes de 10:00 a 18:00.`
          : `Sorry, we're closed on that day. Our hours are Monday to Friday from 10:00 to 18:00.`;
      } else if (validation.reason === 'outside_hours') {
        errorMessage = language === 'es'
          ? `Lo siento, ese horario está fuera de nuestro horario de atención. Estamos abiertos de 10:00 a 18:00.`
          : `Sorry, that time is outside our business hours. We're open from 10:00 to 18:00.`;
      }
      
      return res.json({
        success: false,
        voice_response: errorMessage,
        needs_clarification: true
      });
    }

    const voiceResponse = language === 'es'
      ? `Perfecto, entiendo que quieres una cita para el ${new Date(parsedDateTime.date).toLocaleDateString('es-ES')} a las ${parsedDateTime.time}. ¿Cuál es tu nombre y qué servicio te gustaría? También necesito tu email para enviarte un recordatorio.`
      : `Perfect, I understand you want an appointment for ${new Date(parsedDateTime.date).toLocaleDateString('en-US')} at ${parsedDateTime.time}. What's your name, what service would you like, and what's your email address for reminders?`;

    res.json({
      success: true,
      voice_response: voiceResponse,
      parsed_datetime: parsedDateTime
    });

  } catch (error) {
    console.error('Error parsing datetime:', error);
    res.status(500).json({
      success: false,
      error: 'Error parsing datetime'
    });
  }
});

module.exports = router; 