const fs = require('fs');
const path = require('path');

class VapiAutoConfig {
    constructor() {
        this.routes = [];
        this.functions = [];
        this.baseUrl = process.env.VAPI_BASE_URL || 'https://voice-salon-bot.onrender.com';
    }

    // Automatically discover all routes from the routes directory
    discoverRoutes() {
        const routesDir = path.join(__dirname, 'routes');
        const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
        
        routeFiles.forEach(file => {
            const routeName = file.replace('.js', '');
            const routePath = `/api/${routeName}`;
            
            // Add to routes list
            this.routes.push({
                name: routeName,
                path: routePath,
                file: file
            });
        });
        
        console.log('🔍 Discovered routes:', this.routes.map(r => r.name));
    }

    // Automatically generate Vapi functions from route handlers
    generateFunctions() {
        this.routes.forEach(route => {
            const routeModule = require(`./routes/${route.file}`);
            
            // Extract all endpoints from the route
            if (routeModule.router && routeModule.router.stack) {
                routeModule.router.stack.forEach(layer => {
                    if (layer.route) {
                        const methods = Object.keys(layer.route.methods);
                        const path = layer.route.path;
                        
                        methods.forEach(method => {
                            this.createVapiFunction(route.name, method, path, layer.route.stack[0].handle);
                        });
                    }
                });
            }
        });
    }

    // Create Vapi function definition
    createVapiFunction(routeName, method, path, handler) {
        const functionName = `${routeName}_${method}_${path.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const fullPath = `/api/${routeName}${path}`;
        
        const vapiFunction = {
            name: functionName,
            description: `Handle ${method.toUpperCase()} request to ${fullPath}`,
            url: `${this.baseUrl}${fullPath}`,
            method: method.toUpperCase(),
            parameters: this.extractParameters(handler)
        };
        
        this.functions.push(vapiFunction);
    }

    // Extract parameters from handler function (basic implementation)
    extractParameters(handler) {
        // This is a simplified version - you can enhance this based on your needs
        return {
            // Default parameters that most endpoints might need
            query: {
                type: "string",
                description: "Query parameters"
            }
        };
    }

    // Generate complete Vapi configuration
    generateVapiConfig() {
        const config = {
            voice_settings: {
                language: "en-US",
                voice: "shimmer",
                speed: 1
            },
            system_prompt: this.generateSystemPrompt(),
            initial_message: "Hello! I'm your AI assistant. How can I help you today?",
            conversation_end_message: "Thank you for calling. Have a great day!",
            external_functions: this.functions
        };
        
        return config;
    }

    // Generate smart system prompt based on available functions
    generateSystemPrompt() {
        const functionDescriptions = this.functions.map(f => 
            `- ${f.name}: ${f.description}`
        ).join('\n');
        
        return `You are a helpful AI assistant for a business. You have access to the following functions:

${functionDescriptions}

IMPORTANT RULES:
1. ALWAYS use the voice_response field from API responses when available
2. NEVER call multiple functions for the same request
3. For service inquiries, use searchServices for specific services, getServices for general overview
4. For appointment bookings, always ask for email address to send reminders
5. Respond naturally and conversationally
6. If a function returns an error, apologize and ask the user to try again`;
    }

    // Auto-update Vapi configuration file
    updateVapiConfig() {
        const config = this.generateVapiConfig();
        const configPath = path.join(__dirname, 'vapi-config.json');
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('✅ Updated vapi-config.json with auto-generated functions');
    }

    // Register new function dynamically
    registerFunction(name, description, url, method, parameters) {
        const vapiFunction = {
            name,
            description,
            url: `${this.baseUrl}${url}`,
            method: method.toUpperCase(),
            parameters
        };
        
        this.functions.push(vapiFunction);
        this.updateVapiConfig();
        
        console.log(`✅ Registered new function: ${name}`);
    }

    // Auto-sync with Vapi.ai API (if you have API access)
    async syncWithVapi() {
        // This would sync the configuration with Vapi.ai's API
        // Implementation depends on Vapi.ai's API availability
        console.log('🔄 Syncing with Vapi.ai...');
        
        // For now, just update the local config
        this.updateVapiConfig();
    }
}

// Auto-initialization
const vapiAuto = new VapiAutoConfig();

// Discover routes and generate functions
vapiAuto.discoverRoutes();
vapiAuto.generateFunctions();
vapiAuto.updateVapiConfig();

// Export for use in other files
module.exports = vapiAuto; 