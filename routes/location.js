const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { detectLanguage } = require('../utils/languageUtils');

// Load schedule data (contains location info)
let scheduleData = null;

async function loadScheduleData() {
  if (!scheduleData) {
    try {
      const dataPath = path.join(__dirname, '..', 'schedule.json');
      const data = await fs.readFile(dataPath, 'utf8');
      scheduleData = JSON.parse(data);
    } catch (error) {
      console.error('Error loading schedule data:', error);
      scheduleData = { location: {}, parking: {} };
    }
  }
  return scheduleData;
}

// GET /api/location - Get full location information
router.get('/', async (req, res) => {
  try {
    const data = await loadScheduleData();
    
    res.json({
      success: true,
      data: {
        location: data.location,
        parking: data.parking
      }
    });
  } catch (error) {
    console.error('Error fetching location information:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching location information'
    });
  }
});

// GET /api/location/address - Get address information
router.get('/address', async (req, res) => {
  try {
    const data = await loadScheduleData();
    
    res.json({
      success: true,
      data: {
        address: data.location.address,
        city: data.location.city,
        postal_code: data.location.postal_code,
        country: data.location.country,
        google_maps_url: data.location.google_maps_url
      }
    });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching address'
    });
  }
});

// GET /api/location/directions - Get directions and transport info
router.get('/directions', async (req, res) => {
  try {
    const data = await loadScheduleData();
    
    res.json({
      success: true,
      data: {
        directions: data.location.directions,
        landmarks: data.location.landmarks,
        public_transport: data.location.public_transport
      }
    });
  } catch (error) {
    console.error('Error fetching directions:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching directions'
    });
  }
});

// GET /api/location/transport - Get public transport information
router.get('/transport', async (req, res) => {
  try {
    const data = await loadScheduleData();
    
    res.json({
      success: true,
      data: {
        public_transport: data.location.public_transport,
        landmarks: data.location.landmarks
      }
    });
  } catch (error) {
    console.error('Error fetching transport information:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching transport information'
    });
  }
});

// GET /api/location/parking - Get parking information
router.get('/parking', async (req, res) => {
  try {
    const data = await loadScheduleData();
    
    res.json({
      success: true,
      data: {
        parking: data.parking
      }
    });
  } catch (error) {
    console.error('Error fetching parking information:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching parking information'
    });
  }
});

// GET /api/location/summary - Get location summary for voice responses
router.get('/summary', async (req, res) => {
  try {
    const data = await loadScheduleData();
    const language = detectLanguage(req);
    
    const summary = {
      address: data.location.address,
      city: data.location.city,
      directions: data.location.directions,
      transport_summary: getTransportSummary(data.location.public_transport, language),
      parking_summary: getParkingSummary(data.parking, language),
      google_maps: data.location.google_maps_url
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching location summary:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching location summary'
    });
  }
});

// Helper function to get transport summary
function getTransportSummary(publicTransport, language = 'en') {
  if (!publicTransport) {
    return language === 'es' ? 'Información de transporte no disponible' : 'Transport information not available';
  }
  
  const busLines = publicTransport.bus?.map(bus => bus.line).join(', ') || '';
  const metroLines = publicTransport.metro?.map(metro => metro.line).join(', ') || '';
  
  if (language === 'es') {
    let summary = 'Estamos en Campanar, Valencia. ';
    
    if (busLines) {
      summary += `Autobuses: ${busLines}. `;
    }
    
    if (metroLines) {
      summary += `Metro: ${metroLines}. `;
    }
    
    summary += 'Fácil acceso en transporte público.';
    return summary;
  } else {
    let summary = 'We are in Campanar, Valencia. ';
    
    if (busLines) {
      summary += `Buses: ${busLines}. `;
    }
    
    if (metroLines) {
      summary += `Metro: ${metroLines}. `;
    }
    
    summary += 'Easy access by public transport.';
    return summary;
  }
}

// Helper function to get parking summary
function getParkingSummary(parking, language = 'en') {
  if (!parking || !parking.available) {
    return language === 'es' ? 'No hay parking disponible en el local.' : 'No parking available at the premises.';
  }
  
  const options = parking.options || [];
  if (options.length === 0) {
    return language === 'es' ? 'Parking disponible pero sin información específica.' : 'Parking available but no specific information.';
  }
  
  const parkingOptions = options.map(option => 
    `${option.type}: ${option.cost} (${option.distance})`
  ).join('. ');
  
  if (language === 'es') {
    return `Parking disponible: ${parkingOptions}. ${parking.notes || ''}`;
  } else {
    return `Parking available: ${parkingOptions}. ${parking.notes || ''}`;
  }
}

module.exports = router; 