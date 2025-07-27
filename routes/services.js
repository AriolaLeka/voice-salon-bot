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
    const language = detectLanguage(req);
    const searchTerm = query.toLowerCase();
    
    // Create search mappings for both languages
    const searchMappings = {
      'manicure': ['manicuras', 'manicura'],
      'manicures': ['manicuras', 'manicura'],
      'pedicure': ['pedicuras', 'pedicura'],
      'pedicures': ['pedicuras', 'pedicura'],
      'eyebrows': ['cejas', 'ceja'],
      'eyebrow': ['cejas', 'ceja'],
      'eyelashes': ['pestañas', 'pestaña'],
      'eyelash': ['pestañas', 'pestaña'],
      'facial': ['faciales', 'facial'],
      'facials': ['faciales', 'facial'],
      'nails': ['uñas', 'uña', 'manicuras', 'pedicuras'],
      'nail': ['uñas', 'uña', 'manicuras', 'pedicuras']
    };
    
    // Get search terms including translations
    let searchTerms = [searchTerm];
    if (searchMappings[searchTerm]) {
      searchTerms = searchTerms.concat(searchMappings[searchTerm]);
    }
    
    const results = data.services.filter(service => {
      const categoryLower = service.category.toLowerCase();
      
      // Check if any search term matches the category
      const categoryMatch = searchTerms.some(term => categoryLower.includes(term));
      
      // Check if any search term matches variant names
      const variantMatch = service.variants && service.variants.some(variant => 
        searchTerms.some(term => variant.name.toLowerCase().includes(term))
      );
      
      return categoryMatch || variantMatch;
    });

    // Translate categories for response if needed
    const translatedResults = results.map(service => ({
      ...service,
      category: translateServiceCategory(service.category, language)
    }));

    res.json({
      success: true,
      query: searchTerm,
      search_terms_used: searchTerms,
      data: translatedResults,
      total: translatedResults.length,
      debug: {
        original_search: query,
        available_categories: data.services.map(s => s.category)
      }
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

// GET /api/services/test-search - Test search functionality
router.get('/test-search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const data = await loadSalonData();
    const searchTerm = term.toLowerCase();
    
    // Create search mappings for both languages
    const searchMappings = {
      'manicure': ['manicuras', 'manicura'],
      'manicures': ['manicuras', 'manicura'],
      'pedicure': ['pedicuras', 'pedicura'],
      'pedicures': ['pedicuras', 'pedicura'],
      'eyebrows': ['cejas', 'ceja'],
      'eyebrow': ['cejas', 'ceja'],
      'eyelashes': ['pestañas', 'pestaña'],
      'eyelash': ['pestañas', 'pestaña'],
      'facial': ['faciales', 'facial'],
      'facials': ['faciales', 'facial'],
      'nails': ['uñas', 'uña', 'manicuras', 'pedicuras'],
      'nail': ['uñas', 'uña', 'manicuras', 'pedicuras']
    };
    
    // Get search terms including translations
    let searchTerms = [searchTerm];
    if (searchMappings[searchTerm]) {
      searchTerms = searchTerms.concat(searchMappings[searchTerm]);
    }
    
    const results = data.services.filter(service => {
      const categoryLower = service.category.toLowerCase();
      
      // Check if any search term matches the category
      const categoryMatch = searchTerms.some(term => categoryLower.includes(term));
      
      // Check if any search term matches variant names
      const variantMatch = service.variants && service.variants.some(variant => 
        searchTerms.some(term => variant.name.toLowerCase().includes(term))
      );
      
      return categoryMatch || variantMatch;
    });

    res.json({
      success: true,
      search_term: searchTerm,
      search_terms_used: searchTerms,
      available_categories: data.services.map(s => s.category),
      results: results,
      total: results.length
    });
  } catch (error) {
    console.error('Error testing search:', error);
    res.status(500).json({
      success: false,
      error: 'Error testing search'
    });
  }
});

module.exports = router; 