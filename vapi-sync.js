#!/usr/bin/env node

const registry = require('./smart-vapi-registry');
const fs = require('fs');

class VapiSync {
    constructor() {
        this.apiKey = process.env.VAPI_API_KEY;
        this.agentId = process.env.VAPI_AGENT_ID;
    }

    // Update local configuration
    updateLocalConfig() {
        console.log('🔄 Updating local vapi-config.json...');
        registry.updateVapiConfig();
        console.log('✅ Local configuration updated');
    }

    // Sync with Vapi.ai API (if you have API access)
    async syncWithVapiAPI() {
        if (!this.apiKey || !this.agentId) {
            console.log('⚠️  VAPI_API_KEY or VAPI_AGENT_ID not set. Skipping API sync.');
            console.log('   Set these environment variables to enable automatic API sync:');
            console.log('   export VAPI_API_KEY=your_api_key');
            console.log('   export VAPI_AGENT_ID=your_agent_id');
            return;
        }

        try {
            console.log('🔄 Syncing with Vapi.ai API...');
            
            // Read the generated config
            const configPath = './vapi-config.json';
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // Here you would make API calls to update your Vapi.ai agent
            // This is a placeholder for the actual API integration
            console.log('📡 Would update Vapi.ai agent with new configuration');
            console.log('   (API integration needs to be implemented based on Vapi.ai API docs)');
            
        } catch (error) {
            console.error('❌ Error syncing with Vapi.ai API:', error.message);
        }
    }

    // Generate deployment instructions
    generateDeploymentInstructions() {
        console.log('\n📋 Manual Deployment Instructions:');
        console.log('====================================');
        console.log('1. Copy the generated vapi-config.json to your Vapi.ai agent');
        console.log('2. Or manually update your agent with the new functions:');
        
        const functions = registry.listFunctions();
        functions.forEach(f => {
            console.log(`   • ${f.name}: ${f.url}`);
        });
        
        console.log('\n3. Test your agent with sample requests:');
        console.log('   • "What services do you offer?"');
        console.log('   • "Tell me about manicures"');
        console.log('   • "What are your hours?"');
        console.log('   • "I want to book an appointment for tomorrow at 2 PM"');
    }

    // Run the complete sync process
    async run() {
        console.log('🤖 Vapi.ai Configuration Sync');
        console.log('=============================');
        
        // Update local config
        this.updateLocalConfig();
        
        // Try to sync with API
        await this.syncWithVapiAPI();
        
        // Show deployment instructions
        this.generateDeploymentInstructions();
        
        console.log('\n🎉 Sync process completed!');
    }
}

// Run the sync
const sync = new VapiSync();
sync.run().catch(console.error); 