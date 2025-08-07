#!/usr/bin/env node

const registry = require('./smart-vapi-registry');

console.log('🤖 Smart Vapi Configuration Updater');
console.log('=====================================');

// Update the configuration
registry.updateVapiConfig();

console.log('\n🎉 Configuration updated successfully!');
console.log('\n📝 Next steps:');
console.log('1. Copy the updated vapi-config.json to your Vapi.ai agent');
console.log('2. Or use the Vapi.ai API to update your agent automatically');
console.log('3. Test your agent with the new functions');

// Show current functions
console.log('\n📋 Current Functions:');
const functions = registry.listFunctions();
functions.forEach(f => {
    console.log(`  • ${f.name}: ${f.description}`);
}); 