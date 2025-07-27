const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { detectLanguage, getTimeBasedGreeting, getWelcomeMessage } = require('../utils/languageUtils');

// Load data
let salonData = null;
let scheduleData = null;

async function loadData() {
  if (!salonData) {
    try {
      const salonPath = path.join(__dirname, '..', 'products.json');
      const salonFile = await fs.readFile(salonPath, 'utf8');
      salonData = JSON.parse(salonFile);
    } catch (error) {
      console.error('Error loading salon data:', error);
      salonData = { services: [] };
    }
  }
  
  if (!scheduleData) {
    try {
      const schedulePath = path.join(__dirname, '..', 'schedule.json');
      const scheduleFile = await fs.readFile(schedulePath, 'utf8');
      scheduleData = JSON.parse(scheduleFile);
    } catch (error) {
      console.error('Error loading schedule data:', error);
      scheduleData = { business_hours: {}, location: {} };
    }
  }
  
  return { salonData, scheduleData };
}

// GET /api/general/welcome - Get welcome message
router.get('/welcome', async (req, res) => {
  try {
    const language = detectLanguage(req);
    const welcomeData = getWelcomeMessage(language);
    
    res.json({
      success: true,
      data: welcomeData
    });
  } catch (error) {
    console.error('Error generating welcome message:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating welcome message'
    });
  }
});

// GET /api/general/about - Get business information
router.get('/about', async (req, res) => {
  try {
    const { scheduleData } = await loadData();
    const language = detectLanguage(req);
    
    const businessInfo = {
      business_name: "Hera's Nails & Lashes",
      location: scheduleData.location.address,
      hours_summary: language === 'es' 
        ? "Lunes a Viernes 09:30-20:30, Sábado 09:30-14:30, Cerrado domingos"
        : "Monday to Friday 09:30-20:30, Saturday 09:30-14:30, Closed Sundays"
    };
    
    if (language === 'es') {
      businessInfo.description = "Centro de belleza especializado en manicuras, pedicuras, cejas, pestañas y tratamientos faciales en Valencia. Ubicados en Calle Santos Justo y Pastor, cerca de La Salud.";
      businessInfo.services_summary = [
        "Manicuras",
        "Pedicuras", 
        "Cejas y Depilación",
        "Pestañas",
        "Faciales"
      ];
    } else {
      businessInfo.description = "Beauty center specialized in manicures, pedicures, eyebrows, eyelashes and facial treatments in Valencia. Located on Calle Santos Justo y Pastor, near La Salud.";
      businessInfo.services_summary = [
        "Manicures",
        "Pedicures",
        "Eyebrows and Waxing", 
        "Eyelashes",
        "Facial treatments"
      ];
    }
    
    res.json({
      success: true,
      data: businessInfo
    });
  } catch (error) {
    console.error('Error fetching business information:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching business information'
    });
  }
});

// GET /api/general/services-overview - Get services overview
router.get('/services-overview', async (req, res) => {
  try {
    const { salonData } = await loadData();
    
    // Get main service categories
    const mainCategories = salonData.services.map(service => ({
      category: service.category,
      has_variants: !!service.variants,
      variant_count: service.variants ? service.variants.length : 0,
      price_range: getPriceRange(service),
      duration: service.duration
    }));

    // Get popular services (packs and main services)
    const popularServices = salonData.services.filter(service => 
      service.category.toLowerCase().includes('pack') ||
      service.category.toLowerCase().includes('manicura') ||
      service.category.toLowerCase().includes('pelo a pelo') ||
      service.category.toLowerCase().includes('volumen ruso')
    ).slice(0, 5);

    res.json({
      success: true,
      data: {
        total_services: salonData.services.length,
        main_categories: mainCategories,
        popular_services: popularServices.map(service => ({
          category: service.category,
          price: service.price_discounted_eur || service.price_original_eur,
          duration: service.duration
        })),
        price_ranges: {
          lowest: Math.min(...salonData.services.map(s => s.price_discounted_eur || s.price_original_eur)),
          highest: Math.max(...salonData.services.map(s => s.price_discounted_eur || s.price_original_eur))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching services overview:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching services overview'
    });
  }
});

// GET /api/general/contact - Get contact information
router.get('/contact', async (req, res) => {
  try {
    const { scheduleData } = await loadData();
    
    res.json({
      success: true,
      data: {
        business_name: "Hera's Nails & Lashes",
        address: scheduleData.location.address,
        city: scheduleData.location.city,
        postal_code: scheduleData.location.postal_code,
        country: scheduleData.location.country,
        google_maps: scheduleData.location.google_maps_url,
        hours: scheduleData.business_hours,
        transport: scheduleData.location.public_transport,
        parking: scheduleData.parking
      }
    });
  } catch (error) {
    console.error('Error fetching contact information:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching contact information'
    });
  }
});

// GET /api/general/status - Get current business status
router.get('/status', async (req, res) => {
  try {
    const { scheduleData } = await loadData();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = scheduleData.business_hours[today];
    
    const isOpen = todayHours && todayHours !== 'Closed';
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    
    let status = 'closed';
    let message = 'Cerrado hoy';
    
    if (isOpen) {
      const [startTime, endTime] = todayHours.split('-');
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      
      if (currentHour >= startHour && currentHour < endHour) {
        status = 'open';
        message = 'Abierto ahora';
      } else if (currentHour < startHour) {
        status = 'opens_later';
        message = `Abre a las ${startTime}`;
      } else {
        status = 'closed_for_today';
        message = 'Cerrado por hoy';
      }
    }

    res.json({
      success: true,
      data: {
        is_open: status === 'open',
        status: status,
        message: message,
        today: today,
        today_hours: todayHours,
        current_time: currentTime.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        next_open: getNextOpenDay(scheduleData.business_hours, today)
      }
    });
  } catch (error) {
    console.error('Error fetching business status:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching business status'
    });
  }
});

// Helper function to get time-based greeting
function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  
  if (6 <= hour && hour < 12) {
    return "¡Buenos días! Soy tu asesor de Hera's Nails & Lashes 👋";
  } else if (12 <= hour && hour < 18) {
    return "¡Buenas tardes! Soy tu asesor de Hera's Nails & Lashes 👋";
  } else {
    return "¡Buenas noches! Soy tu asesor de Hera's Nails & Lashes 👋";
  }
}

// Helper function to get price range for a service
function getPriceRange(service) {
  if (service.variants && service.variants.length > 0) {
    const prices = service.variants.map(v => v.price_discounted_eur || v.price_original_eur);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  } else {
    const price = service.price_discounted_eur || service.price_original_eur;
    return { min: price, max: price };
  }
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