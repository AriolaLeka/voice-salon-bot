const fs = require('fs');
const path = require('path');

class SmartVapiRegistry {
    constructor() {
        this.functions = [];
        this.baseUrl = process.env.VAPI_BASE_URL || 'https://voice-salon-bot.onrender.com';
        this.functionMappings = new Map();
    }

    // Register a function with detailed metadata
    registerFunction(name, description, url, method, parameters, examples = []) {
        const vapiFunction = {
            name,
            description,
            url: `${this.baseUrl}${url}`,
            method: method.toUpperCase(),
            parameters,
            examples
        };
        
        this.functions.push(vapiFunction);
        this.functionMappings.set(name, vapiFunction);
        
        console.log(`✅ Registered function: ${name} -> ${url}`);
        return vapiFunction;
    }

    // Auto-register comprehensive business functions
    registerBusinessFunctions() {
        // ===== SERVICES =====
        this.registerFunction(
            'searchServices',
            'Search for specific services by name or category. Use this when customer asks about a specific service like "manicure", "pedicure", "eyebrows", "eyelashes", "facial" or general terms like "servicios", "tratamientos", "belleza", "todo" (Spanish) or "services", "treatments", "beauty", "everything" (English)',
            '/api/services/search',
            'GET',
            {
                query: {
                    type: 'string',
                    description: 'Search term (e.g., "manicure", "pedicure", "eyebrows", "eyelashes", "facial", "nails", "servicios", "tratamientos", "belleza", "todo", "services", "treatments", "beauty", "everything")'
                },
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            },
            ['manicure', 'pedicure', 'eyebrows', 'eyelashes', 'facial', 'nails', 'cejas', 'pestañas', 'servicios', 'tratamientos', 'belleza', 'todo', 'services', 'treatments', 'beauty', 'everything']
        );

        this.registerFunction(
            'getServices',
            'Get all available services and categories. Use this when customer asks "what services do you offer", "show me all services", "what do you do"',
            '/api/services',
            'GET',
            {
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getServiceCategory',
            'Get detailed information about a specific service category. Use this when customer asks for details about a specific service type',
            '/api/services/category',
            'GET',
            {
                category: {
                    type: 'string',
                    description: 'Service category (e.g., "manicuras", "pedicuras", "cejas")'
                },
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getPopularServices',
            'Get popular services and special packages. Use this when customer asks "what are your most popular services", "do you have packages", "what are your best services"',
            '/api/services/popular',
            'GET',
            {
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getServicesByPrice',
            'Get services within a specific price range. Use this when customer asks "what services do you have under X euros", "show me affordable services"',
            '/api/services/price-range',
            'GET',
            {
                min: {
                    type: 'string',
                    description: 'Minimum price in euros'
                },
                max: {
                    type: 'string',
                    description: 'Maximum price in euros'
                },
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        // ===== HOURS & SCHEDULE =====
        this.registerFunction(
            'getBusinessHours',
            'Get business hours and current status. Use this when customer asks "what are your hours", "are you open", "when do you close", "what time do you open"',
            '/api/hours/status',
            'GET',
            {
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getWeeklyHours',
            'Get full weekly schedule. Use this when customer asks "what are your hours this week", "show me your schedule", "when are you open this week"',
            '/api/hours/week',
            'GET',
            {
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getTodayHours',
            'Get today\'s specific hours and current status. Use this when customer asks "are you open today", "what time do you close today"',
            '/api/hours/today',
            'GET',
            {}
        );

        this.registerFunction(
            'getAllHours',
            'Get complete business hours information. Use this when customer asks "tell me all your hours", "what are your business hours"',
            '/api/hours',
            'GET',
            {}
        );

        // ===== LOCATION & TRANSPORT =====
        this.registerFunction(
            'getLocation',
            'Get business location and address. Use this when customer asks "where are you located", "what\'s your address", "how do I get there", "where can I find you"',
            '/api/location',
            'GET',
            {
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getAddress',
            'Get specific address information. Use this when customer asks "what\'s your exact address", "where are you exactly"',
            '/api/location/address',
            'GET',
            {}
        );

        this.registerFunction(
            'getDirections',
            'Get directions and transport information. Use this when customer asks "how do I get there", "what\'s the best way to get there", "is it easy to find"',
            '/api/location/directions',
            'GET',
            {}
        );

        this.registerFunction(
            'getTransportInfo',
            'Get public transport information. Use this when customer asks "how do I get there by bus", "is there a metro nearby", "what transport options do I have"',
            '/api/location/transport',
            'GET',
            {}
        );

        this.registerFunction(
            'getParkingInfo',
            'Get parking information. Use this when customer asks "is there parking", "where can I park", "do you have parking"',
            '/api/location/parking',
            'GET',
            {}
        );

        this.registerFunction(
            'getLocationSummary',
            'Get complete location summary with transport and parking. Use this when customer asks "tell me about your location", "how do I get to your salon"',
            '/api/location/summary',
            'GET',
            {
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        // ===== APPOINTMENTS =====
        this.registerFunction(
            'parseAppointmentDateTime',
            'Parse date and time from natural language for appointment booking. Use this first when customer wants to book an appointment',
            '/api/appointments/parse-datetime',
            'POST',
            {
                text: {
                    type: 'string',
                    description: 'Natural language text containing date and time (e.g., "tomorrow at 2 PM", "Friday at 10 AM")'
                },
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            },
            ['tomorrow at 2 PM', 'Friday at 10 AM', 'next Monday at 3:30 PM', 'mañana a las 2', 'el viernes a las 10']
        );

        this.registerFunction(
            'bookAppointment',
            'Book an appointment with parsed date, time, and customer information. Use this after parsing date/time and collecting customer details',
            '/api/appointments/book',
            'POST',
            {
                dateTimeText: {
                    type: 'string',
                    description: 'Natural language date and time (e.g., "tomorrow at 2 PM")'
                },
                clientName: {
                    type: 'string',
                    description: 'Customer name'
                },
                service: {
                    type: 'string',
                    description: 'Service requested (e.g., "manicure", "pedicure", "eyebrows")'
                },
                voiceEmail: {
                    type: 'string',
                    description: 'Email address for reminders (e.g., "john at gmail dot com")'
                },
                phone: {
                    type: 'string',
                    description: 'Phone number (optional)',
                    required: false
                },
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getAvailableTimes',
            'Get available appointment times for a specific date. Use this when customer asks "what times do you have available", "when can I come in"',
            '/api/appointments/available-times',
            'GET',
            {
                date: {
                    type: 'string',
                    description: 'Date in YYYY-MM-DD format'
                },
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        // ===== GENERAL BUSINESS INFO =====
        this.registerFunction(
            'getWelcomeMessage',
            'Get welcome message and business overview. Use this for greetings or when customer asks "tell me about your business", "what do you do"',
            '/api/general/welcome',
            'GET',
            {
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getAboutInfo',
            'Get detailed business information and service summary. Use this when customer asks "what do you do", "tell me more about your salon"',
            '/api/general/about',
            'GET',
            {
                lang: {
                    type: 'string',
                    description: 'Language preference (en/es)',
                    required: false
                }
            }
        );

        this.registerFunction(
            'getServicesOverview',
            'Get comprehensive services overview with categories and pricing. Use this when customer asks "what services do you offer", "tell me about your services"',
            '/api/general/services-overview',
            'GET',
            {}
        );

        this.registerFunction(
            'getContactInfo',
            'Get complete contact information including address, hours, and transport. Use this when customer asks "how can I contact you", "what\'s your contact information"',
            '/api/general/contact',
            'GET',
            {}
        );

        this.registerFunction(
            'getBusinessStatus',
            'Get current business status (open/closed) and today\'s information. Use this when customer asks "are you open", "what\'s your status today"',
            '/api/general/status',
            'GET',
            {}
        );
    }

    // Generate intelligent system prompt
    generateSystemPrompt() {
        const functionList = this.functions.map(f => {
            const examples = f.examples ? ` (Examples: ${f.examples.join(', ')})` : '';
            return `- ${f.name}: ${f.description}${examples}`;
        }).join('\n');

        return `You are a helpful AI assistant for Hera's Nails & Lashes beauty salon in Valencia, Spain. You have access to the following functions:

${functionList}

CRITICAL RULES:
1. ALWAYS use the voice_response field from API responses when available
2. NEVER call multiple functions for the same request
3. For service inquiries:
   - Use searchServices for specific services (e.g., "manicure", "pedicure", "eyebrows", "eyelashes")
   - Use getServices for general overview ("what services do you offer")
   - Use getPopularServices for popular services and packages
   - Use getServicesByPrice for budget-related questions
4. For appointment bookings:
   - First call parseAppointmentDateTime to understand the request
   - Then call bookAppointment with all required details (name, service, email)
   - ALWAYS ask for email address to send reminders
5. For hours/location: Use getBusinessHours, getLocation, or getLocationSummary as appropriate
6. For general info: Use getWelcomeMessage, getAboutInfo, or getContactInfo
7. Respond naturally and conversationally
8. If a function returns an error, apologize and ask the user to try again
9. Always detect language preference from the conversation and pass it to functions

LANGUAGE DETECTION:
- If customer speaks Spanish, set lang=es
- If customer speaks English, set lang=en
- Default to lang=en if unsure

TYPICAL CUSTOMER QUESTIONS:
- "What services do you offer?" → getServices
- "Tell me about manicures" → searchServices with "manicure"
- "What are your hours?" → getBusinessHours
- "Where are you located?" → getLocation
- "I want to book an appointment" → parseAppointmentDateTime then bookAppointment
- "What are your most popular services?" → getPopularServices
- "Do you have parking?" → getParkingInfo
- "How do I get there?" → getDirections or getTransportInfo`;
    }

    // Generate complete Vapi configuration
    generateVapiConfig() {
        return {
            voice_settings: {
                language: "en-US",
                voice: "shimmer",
                speed: 1
            },
            system_prompt: this.generateSystemPrompt(),
            initial_message: "Hello! Welcome to Hera's Nails & Lashes beauty salon in Valencia. I'm here to help you with our services, hours, location, and appointments. How can I assist you today?",
            conversation_end_message: "Thank you for calling Hera's Nails & Lashes. Have a wonderful day!",
            external_functions: this.functions
        };
    }

    // Update Vapi configuration file
    updateVapiConfig() {
        const config = this.generateVapiConfig();
        const configPath = path.join(__dirname, 'vapi-config.json');
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('✅ Updated vapi-config.json with comprehensive function registry');
        
        // Also generate a summary
        console.log('\n📋 Registered Functions:');
        this.functions.forEach(f => {
            console.log(`  • ${f.name}: ${f.description}`);
        });
    }

    // Get function by name
    getFunction(name) {
        return this.functionMappings.get(name);
    }

    // List all registered functions
    listFunctions() {
        return this.functions.map(f => ({
            name: f.name,
            description: f.description,
            url: f.url,
            method: f.method
        }));
    }
}

// Initialize and export
const registry = new SmartVapiRegistry();
registry.registerBusinessFunctions();
registry.updateVapiConfig();

module.exports = registry; 