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

// Time-based greetings in multiple languages
function getTimeBasedGreeting(language = 'en') {
  const hour = new Date().getHours();
  
  if (language === 'es') {
    if (6 <= hour && hour < 12) {
      return "¡Buenos días! Soy tu asesor de Hera's Nails & Lashes 👋";
    } else if (12 <= hour && hour < 18) {
      return "¡Buenas tardes! Soy tu asesor de Hera's Nails & Lashes 👋";
    } else {
      return "¡Buenas noches! Soy tu asesor de Hera's Nails & Lashes 👋";
    }
  } else {
    if (6 <= hour && hour < 12) {
      return "Good morning! I'm your Hera's Nails & Lashes advisor 👋";
    } else if (12 <= hour && hour < 18) {
      return "Good afternoon! I'm your Hera's Nails & Lashes advisor 👋";
    } else {
      return "Good evening! I'm your Hera's Nails & Lashes advisor 👋";
    }
  }
}

// Business status messages
function getBusinessStatusMessage(isOpen, language = 'en') {
  if (language === 'es') {
    return isOpen ? 'Abierto ahora' : 'Cerrado ahora';
  } else {
    return isOpen ? 'Open now' : 'Closed now';
  }
}

// Service descriptions in multiple languages
const serviceTranslations = {
  'manicuras': {
    en: 'Manicures',
    es: 'Manicuras'
  },
  'pedicuras': {
    en: 'Pedicures',
    es: 'Pedicuras'
  },
  'cejas': {
    en: 'Eyebrows',
    es: 'Cejas'
  },
  'pestañas': {
    en: 'Eyelashes',
    es: 'Pestañas'
  },
  'faciales': {
    en: 'Facial treatments',
    es: 'Faciales'
  }
};

function translateServiceCategory(category, language = 'en') {
  const lowerCategory = category.toLowerCase();
  for (const [key, translations] of Object.entries(serviceTranslations)) {
    if (lowerCategory.includes(key)) {
      return translations[language] || category;
    }
  }
  return category;
}

// Welcome message templates
function getWelcomeMessage(language = 'en') {
  if (language === 'es') {
    return {
      greeting: getTimeBasedGreeting('es'),
      message: "Te ayudo con información sobre nuestros servicios:",
      services: [
        "👁️ Extensiones de pestañas (Pelo a pelo, Volumen ruso)",
        "💅 Manicura y pedicura profesional", 
        "✂️ Cejas (tinte, depilación, laminado)",
        "💎 Packs especiales desde 49€"
      ],
      hours: "Horario: Lunes a Viernes 10:00-18:00",
      location: "Ubicación: Campanar, Valencia",
      question: "¿Qué servicio te interesa?"
    };
  } else {
    return {
      greeting: getTimeBasedGreeting('en'),
      message: "I can help you with information about our services:",
      services: [
        "👁️ Eyelash extensions (Lash by lash, Russian volume)",
        "💅 Professional manicure and pedicure", 
        "✂️ Eyebrows (tinting, waxing, lamination)",
        "💎 Special packages from €49"
      ],
      hours: "Hours: Monday to Friday 10:00-18:00",
      location: "Location: Campanar, Valencia",
      question: "What service interests you?"
    };
  }
}

// Hours summary translations
function getHoursSummary(businessHours, language = 'en') {
  const openDays = Object.entries(businessHours)
    .filter(([day, hours]) => hours !== 'Closed')
    .map(([day, hours]) => `${day}: ${hours}`);
  
  const closedDays = Object.entries(businessHours)
    .filter(([day, hours]) => hours === 'Closed')
    .map(([day]) => day);

  if (language === 'es') {
    return {
      open_days: openDays,
      closed_days: closedDays,
      summary: `Abierto de lunes a viernes de 10:00 a 18:00. Cerrado sábados y domingos.`
    };
  } else {
    return {
      open_days: openDays,
      closed_days: closedDays,
      summary: `Open Monday to Friday from 10:00 to 18:00. Closed Saturdays and Sundays.`
    };
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

// Helper function to get price range text for voice responses
function getPriceRangeText(service, language = 'en') {
  const priceRange = getPriceRange(service);
  
  if (priceRange.min === priceRange.max) {
    return language === 'es' ? `${priceRange.min}€` : `${priceRange.min}€`;
  } else {
    return language === 'es' ? `desde ${priceRange.min}€ hasta ${priceRange.max}€` : `from ${priceRange.min}€ to ${priceRange.max}€`;
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

module.exports = {
  detectLanguage,
  getTimeBasedGreeting,
  getBusinessStatusMessage,
  translateServiceCategory,
  getWelcomeMessage,
  getHoursSummary,
  getPriceRange,
  getPriceRangeText,
  getNextOpenDay
}; 