const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { detectLanguage, getBusinessStatusMessage, getHoursSummary } = require('../utils/languageUtils');

// Load schedule data
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

// GET /api/hours - Get all business hours
router.get('/', async (req, res) => {
  try {
    const data = await loadScheduleData();
    const language = detectLanguage(req);
    
    res.json({
      success: true,
      data: {
        business_hours: data.business_hours,
        summary: getHoursSummary(data.business_hours, language)
      }
    });
  } catch (error) {
    console.error('Error fetching business hours:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching business hours'
    });
  }
});

// GET /api/hours/today - Get today's hours
router.get('/today', async (req, res) => {
  try {
    const data = await loadScheduleData();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = data.business_hours[today] || 'Closed';
    
    const isOpen = todayHours !== 'Closed';
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    let status = 'closed';
    if (isOpen) {
      const [startTime, endTime] = todayHours.split('-');
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      
      if (currentHour >= startHour && currentHour < endHour) {
        status = 'open';
      } else if (currentHour < startHour) {
        status = 'opens_later';
      } else {
        status = 'closed_for_today';
      }
    }

    res.json({
      success: true,
      data: {
        day: today,
        hours: todayHours,
        is_open: isOpen,
        status: status,
        current_time: currentTime.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s hours:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching today\'s hours'
    });
  }
});

// GET /api/hours/status - Check if currently open
router.get('/status', async (req, res) => {
  try {
    const data = await loadScheduleData();
    const language = detectLanguage(req);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = data.business_hours[today];
    
    if (!todayHours || todayHours === 'Closed') {
      return res.json({
        success: true,
        data: {
          is_open: false,
          message: language === 'es' ? 'Cerrado hoy' : 'Closed today',
          next_open: getNextOpenDay(data.business_hours, today)
        }
      });
    }

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const [startTime, endTime] = todayHours.split('-');
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    const isOpen = currentHour >= startHour && currentHour < endHour;
    
    res.json({
      success: true,
      data: {
        is_open: isOpen,
        today_hours: todayHours,
        current_time: currentTime.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        message: getBusinessStatusMessage(isOpen, language),
        next_open: isOpen ? null : getNextOpenDay(data.business_hours, today)
      }
    });
  } catch (error) {
    console.error('Error checking business status:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking business status'
    });
  }
});

// GET /api/hours/week - Get weekly schedule
router.get('/week', async (req, res) => {
  try {
    const data = await loadScheduleData();
    const language = detectLanguage(req);
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const weeklySchedule = weekDays.map(day => ({
      day: day,
      hours: data.business_hours[day] || 'Closed',
      is_open: data.business_hours[day] !== 'Closed'
    }));

    res.json({
      success: true,
      data: {
        weekly_schedule: weeklySchedule,
        summary: getHoursSummary(data.business_hours, language)
      }
    });
  } catch (error) {
    console.error('Error fetching weekly schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching weekly schedule'
    });
  }
});

// Helper function to get hours summary (legacy - now using utils)
function getHoursSummary(businessHours) {
  const openDays = Object.entries(businessHours)
    .filter(([day, hours]) => hours !== 'Closed')
    .map(([day, hours]) => `${day}: ${hours}`);
  
  const closedDays = Object.entries(businessHours)
    .filter(([day, hours]) => hours === 'Closed')
    .map(([day]) => day);

  return {
    open_days: openDays,
    closed_days: closedDays,
    summary: `Abierto de lunes a viernes de 10:00 a 18:00. Cerrado sábados y domingos.`
  };
}

// Helper function to get next open day
function getNextOpenDay(businessHours, currentDay) {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentIndex = weekDays.indexOf(currentDay);
  
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentIndex + i) % 7;
    const nextDay = weekDays[nextDayIndex];
    if (businessHours[nextDay] && businessHours[nextDay] !== 'Closed') {
      return {
        day: nextDay,
        hours: businessHours[nextDay]
      };
    }
  }
  
  return null;
}

module.exports = router; 