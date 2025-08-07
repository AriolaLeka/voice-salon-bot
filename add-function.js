#!/usr/bin/env node

const registry = require('./smart-vapi-registry');

// Example: Add a new pricing function
function addPricingFunction() {
    registry.registerFunction(
        'getPricing',
        'Get pricing information for specific services. Use this when customer asks about prices or costs',
        '/api/services/pricing',
        'GET',
        {
            service: {
                type: 'string',
                description: 'Service name (e.g., "manicure", "pedicure", "eyebrows")'
            },
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['manicure pricing', 'pedicure cost', 'eyebrows price', 'how much for nails']
    );
    
    console.log('✅ Added new function: getPricing');
}

// Example: Add a new availability function
function addAvailabilityFunction() {
    registry.registerFunction(
        'checkAvailability',
        'Check if a specific service is available on a given date. Use this when customer asks "do you have availability"',
        '/api/appointments/check-availability',
        'POST',
        {
            service: {
                type: 'string',
                description: 'Service name (e.g., "manicure", "pedicure", "eyebrows")'
            },
            date: {
                type: 'string',
                description: 'Date in YYYY-MM-DD format'
            },
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['check manicure availability', 'is pedicure available tomorrow', 'do you have time for eyebrows']
    );
    
    console.log('✅ Added new function: checkAvailability');
}

// Example: Add a new special offers function
function addSpecialOffersFunction() {
    registry.registerFunction(
        'getSpecialOffers',
        'Get current special offers, discounts, and promotions. Use this when customer asks "do you have any offers", "are there any discounts"',
        '/api/services/special-offers',
        'GET',
        {
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['special offers', 'discounts', 'promotions', 'deals', 'ofertas', 'descuentos']
    );
    
    console.log('✅ Added new function: getSpecialOffers');
}

// Example: Add a new gift cards function
function addGiftCardsFunction() {
    registry.registerFunction(
        'getGiftCards',
        'Get information about gift cards and vouchers. Use this when customer asks "do you have gift cards", "can I buy a gift voucher"',
        '/api/services/gift-cards',
        'GET',
        {
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['gift cards', 'gift vouchers', 'tarjetas regalo', 'vouchers']
    );
    
    console.log('✅ Added new function: getGiftCards');
}

// Example: Add a new loyalty program function
function addLoyaltyFunction() {
    registry.registerFunction(
        'getLoyaltyProgram',
        'Get information about loyalty program and rewards. Use this when customer asks "do you have a loyalty program", "are there any rewards"',
        '/api/services/loyalty',
        'GET',
        {
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['loyalty program', 'rewards', 'points', 'programa de fidelidad']
    );
    
    console.log('✅ Added new function: getLoyaltyProgram');
}

// Example: Add a new cancellation function
function addCancellationFunction() {
    registry.registerFunction(
        'cancelAppointment',
        'Cancel or reschedule an existing appointment. Use this when customer asks "I need to cancel", "can I change my appointment"',
        '/api/appointments/cancel',
        'POST',
        {
            appointmentId: {
                type: 'string',
                description: 'Appointment ID or reference'
            },
            customerName: {
                type: 'string',
                description: 'Customer name for verification'
            },
            reason: {
                type: 'string',
                description: 'Reason for cancellation (optional)',
                required: false
            },
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['cancel appointment', 'reschedule', 'change appointment', 'cancelar cita']
    );
    
    console.log('✅ Added new function: cancelAppointment');
}

// Example: Add a new emergency function
function addEmergencyFunction() {
    registry.registerFunction(
        'getEmergencyContact',
        'Get emergency contact information. Use this when customer asks "what if I have an emergency", "how can I contact you urgently"',
        '/api/general/emergency-contact',
        'GET',
        {
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['emergency contact', 'urgent contact', 'emergency number', 'contacto de emergencia']
    );
    
    console.log('✅ Added new function: getEmergencyContact');
}

// Example: Add a new FAQ function
function addFAQFunction() {
    registry.registerFunction(
        'getFAQ',
        'Get answers to frequently asked questions. Use this when customer asks general questions about policies, procedures, etc.',
        '/api/general/faq',
        'GET',
        {
            category: {
                type: 'string',
                description: 'FAQ category (e.g., "appointments", "services", "policies")',
                required: false
            },
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['frequently asked questions', 'FAQ', 'common questions', 'preguntas frecuentes']
    );
    
    console.log('✅ Added new function: getFAQ');
}

// Example: Add a new testimonials function
function addTestimonialsFunction() {
    registry.registerFunction(
        'getTestimonials',
        'Get customer testimonials and reviews. Use this when customer asks "what do other customers say", "do you have reviews"',
        '/api/general/testimonials',
        'GET',
        {
            service: {
                type: 'string',
                description: 'Service category for filtered testimonials (optional)',
                required: false
            },
            lang: {
                type: 'string',
                description: 'Language preference (en/es)',
                required: false
            }
        },
        ['testimonials', 'reviews', 'customer feedback', 'testimonios', 'reseñas']
    );
    
    console.log('✅ Added new function: getTestimonials');
}

// Run all examples
console.log('🔧 Adding comprehensive new functions to Vapi registry...');
console.log('========================================================');

addPricingFunction();
addAvailabilityFunction();
addSpecialOffersFunction();
addGiftCardsFunction();
addLoyaltyFunction();
addCancellationFunction();
addEmergencyFunction();
addFAQFunction();
addTestimonialsFunction();

// Update the configuration
registry.updateVapiConfig();

console.log('\n🎉 All new functions added and configuration updated!');
console.log('\n📋 Summary of new functions added:');
console.log('  • getPricing - Pricing information for services');
console.log('  • checkAvailability - Check service availability');
console.log('  • getSpecialOffers - Current offers and discounts');
console.log('  • getGiftCards - Gift card information');
console.log('  • getLoyaltyProgram - Loyalty program details');
console.log('  • cancelAppointment - Cancel/reschedule appointments');
console.log('  • getEmergencyContact - Emergency contact info');
console.log('  • getFAQ - Frequently asked questions');
console.log('  • getTestimonials - Customer reviews and testimonials');

console.log('\n📝 To add your own functions:');
console.log('1. Edit this file (add-function.js)');
console.log('2. Add your function using registry.registerFunction()');
console.log('3. Run: node add-function.js');
console.log('4. Copy the updated vapi-config.json to your Vapi.ai agent');

console.log('\n💡 Typical customer questions now covered:');
console.log('  • "How much does a manicure cost?" → getPricing');
console.log('  • "Do you have availability for tomorrow?" → checkAvailability');
console.log('  • "Do you have any special offers?" → getSpecialOffers');
console.log('  • "Do you sell gift cards?" → getGiftCards');
console.log('  • "Do you have a loyalty program?" → getLoyaltyProgram');
console.log('  • "I need to cancel my appointment" → cancelAppointment');
console.log('  • "What if I have an emergency?" → getEmergencyContact');
console.log('  • "What are your policies?" → getFAQ');
console.log('  • "What do other customers say?" → getTestimonials'); 