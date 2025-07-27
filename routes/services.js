const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { detectLanguage, translateServiceCategory } = require('../utils/languageUtils');

// Load salon data
let salonData = null;

async function loadSalonData() {
  if (!salonData) {
    try {
      const dataPath = path.join(__dirname, '..', 'products.json');
      const data = await fs.readFile(dataPath, 'utf8');
      salonData = JSON.parse(data);
    } catch (error) {
      console.error('Error loading salon data:', error);
      salonData = { services: [] };
    }
  }
  return salonData;
}

// GET /api/services - Get all services
router.get('/', async (req, res) => {
  try {
    const data = await loadSalonData();
    const language = detectLanguage(req);
    
    const services = data.services.map(service => ({
      category: translateServiceCategory(service.category, language),
      price_original_eur: service.price_original_eur,
      price_discounted_eur: service.price_discounted_eur,
      duration: service.duration,
      includes: service.includes,
      variants: service.variants ? service.variants.length : 0
    }));

    res.json({
      success: true,
      data: services,
      total: services.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching services'
    });
  }
});

// GET /api/services/search - Search services by name/category
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const data = await loadSalonData();
    const searchTerm = query.toLowerCase();
    
    const results = data.services.filter(service => 
      service.category.toLowerCase().includes(searchTerm) ||
      (service.variants && service.variants.some(variant => 
        variant.name.toLowerCase().includes(searchTerm)
      ))
    );

    res.json({
      success: true,
      query: searchTerm,
      data: results,
      total: results.length
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      error: 'Error searching services'
    });
  }
});

// GET /api/services/:category - Get services by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const data = await loadSalonData();
    
    const service = data.services.find(s => 
      s.category.toLowerCase().replace(/[^a-z0-9]/g, '') === 
      category.toLowerCase().replace(/[^a-z0-9]/g, '')
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service category not found',
        available_categories: data.services.map(s => s.category)
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service category:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching service category'
    });
  }
});

// GET /api/services/popular - Get popular services (packs and main services)
router.get('/popular', async (req, res) => {
  try {
    const data = await loadSalonData();
    
    const popularServices = data.services.filter(service => 
      service.category.toLowerCase().includes('pack') ||
      service.category.toLowerCase().includes('manicura') ||
      service.category.toLowerCase().includes('pelo a pelo') ||
      service.category.toLowerCase().includes('volumen ruso')
    ).slice(0, 6);

    res.json({
      success: true,
      data: popularServices,
      total: popularServices.length
    });
  } catch (error) {
    console.error('Error fetching popular services:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching popular services'
    });
  }
});

// GET /api/services/price-range - Get services by price range
router.get('/price-range/:min/:max', async (req, res) => {
  try {
    const { min, max } = req.params;
    const minPrice = parseFloat(min);
    const maxPrice = parseFloat(max);

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price range parameters'
      });
    }

    const data = await loadSalonData();
    
    const servicesInRange = data.services.filter(service => {
      const price = service.price_discounted_eur || service.price_original_eur;
      return price >= minPrice && price <= maxPrice;
    });

    res.json({
      success: true,
      price_range: { min: minPrice, max: maxPrice },
      data: servicesInRange,
      total: servicesInRange.length
    });
  } catch (error) {
    console.error('Error fetching services by price range:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching services by price range'
    });
  }
});

module.exports = router; 