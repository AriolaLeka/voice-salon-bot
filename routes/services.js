const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { detectLanguage, translateServiceCategory, getPriceRangeText } = require('../utils/languageUtils');

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
    
    // Create voice-friendly service summaries
    const serviceSummaries = data.services.map(service => {
      const category = translateServiceCategory(service.category, language);
      const variantCount = service.variants ? service.variants.length : 0;
      
      if (language === 'es') {
        return {
          category: category,
          summary: `${category} con ${variantCount} opciones disponibles`,
          price_range: getPriceRangeText(service, 'es'),
          variants_count: variantCount
        };
      } else {
        return {
          category: category,
          summary: `${category} with ${variantCount} options available`,
          price_range: getPriceRangeText(service, 'en'),
          variants_count: variantCount
        };
      }
    });

    const voiceResponse = language === 'es' 
      ? `Ofrecemos ${data.services.length} categorías de servicios: ${serviceSummaries.map(s => s.summary).join(', ')}. ¿Qué servicio te interesa más?`
      : `We offer ${data.services.length} service categories: ${serviceSummaries.map(s => s.summary).join(', ')}. What service interests you most?`;

    res.json({
      success: true,
      voice_response: voiceResponse,
      data: serviceSummaries,
      total: data.services.length
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

    // Create voice-friendly search results
    const voiceFriendlyResults = results.map(service => {
      const category = translateServiceCategory(service.category, language);
      const variants = service.variants || [];
      
      if (language === 'es') {
        return {
          category: category,
          summary: `${category}: ${variants.length} opciones disponibles`,
          options: variants.map(variant => ({
            name: variant.name,
            price: `${variant.price_discounted_eur || variant.price_original_eur}€`,
            description: variant.description
          })),
          price_range: getPriceRangeText(service, 'es')
        };
      } else {
        return {
          category: category,
          summary: `${category}: ${variants.length} options available`,
          options: variants.map(variant => ({
            name: variant.name,
            price: `${variant.price_discounted_eur || variant.price_original_eur}€`,
            description: variant.description
          })),
          price_range: getPriceRangeText(service, 'en')
        };
      }
    });

    // Create voice response
    let voiceResponse;
    if (results.length === 0) {
      voiceResponse = language === 'es' 
        ? `Lo siento, no encontramos servicios específicos para "${query}". ¿Te gustaría ver todos nuestros servicios disponibles?`
        : `Sorry, we couldn't find specific services for "${query}". Would you like to see all our available services?`;
    } else if (results.length === 1) {
      const service = voiceFriendlyResults[0];
      voiceResponse = language === 'es'
        ? `Para ${service.category}, tenemos ${service.options.length} opciones. ${service.options.map(opt => `${opt.name} por ${opt.price}`).join(', ')}. ¿Te gustaría más detalles sobre alguna opción?`
        : `For ${service.category}, we have ${service.options.length} options. ${service.options.map(opt => `${opt.name} for ${opt.price}`).join(', ')}. Would you like more details about any option?`;
    } else {
      voiceResponse = language === 'es'
        ? `Encontramos ${results.length} categorías relacionadas con "${query}": ${voiceFriendlyResults.map(s => s.summary).join(', ')}. ¿Qué te interesa más?`
        : `We found ${results.length} categories related to "${query}": ${voiceFriendlyResults.map(s => s.summary).join(', ')}. What interests you most?`;
    }

    res.json({
      success: true,
      query: searchTerm,
      voice_response: voiceResponse,
      data: voiceFriendlyResults,
      total: voiceFriendlyResults.length
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