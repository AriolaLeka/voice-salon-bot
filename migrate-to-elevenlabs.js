#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
require('dotenv').config();

class VapiToElevenLabsMigrator {
  constructor() {
    this.oldConfigPath = path.join(__dirname, 'vapi-config.json');
    this.newConfigPath = path.join(__dirname, 'elevenlabs-config.json');
  }

  async migrate() {
    console.log('🔄 Migrating from VAPI to ElevenLabs...\n');

    // Check if old config exists
    if (!fs.existsSync(this.oldConfigPath)) {
      console.log('⚠️  No vapi-config.json found. Skipping migration.');
      return;
    }

    try {
      // Read old VAPI config
      const oldConfig = JSON.parse(fs.readFileSync(this.oldConfigPath, 'utf8'));
      
      console.log('📋 Found VAPI configuration:');
      console.log(`   - Voice: ${oldConfig.voice_settings?.voice || 'unknown'}`);
      console.log(`   - Language: ${oldConfig.voice_settings?.language || 'unknown'}`);
      console.log(`   - Functions: ${oldConfig.external_functions?.length || 0}`);

      // Create new ElevenLabs config
      const newConfig = this.convertConfig(oldConfig);
      
      // Write new config
      fs.writeFileSync(this.newConfigPath, JSON.stringify(newConfig, null, 2));
      
      console.log('\n✅ Migration completed!');
      console.log(`   New config saved to: ${this.newConfigPath}`);
      
      // Update environment variables
      this.updateEnvironmentVariables();
      
      console.log('\n📝 Next steps:');
      console.log('1. Set up your ElevenLabs account and get API key');
      console.log('2. Create a new Conversational AI agent');
      console.log('3. Configure the agent with functions from elevenlabs-config.json');
      console.log('4. Set the webhook URL to: https://voice-salon-bot.onrender.com/api/elevenlabs/webhook');
      console.log('5. Test the integration with: npm run test:elevenlabs');
      
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
    }
  }

  convertConfig(oldConfig) {
    // Convert VAPI external functions to ElevenLabs functions
    const functions = oldConfig.external_functions?.map(func => {
      return {
        name: func.name,
        description: func.description,
        parameters: this.convertParameters(func.parameters),
        examples: func.examples || []
      };
    }) || [];

    return {
      agent_configuration: {
        name: "Hera's Nails & Lashes Salon Assistant",
        description: "AI assistant for Hera's Nails & Lashes beauty salon in Valencia, Spain",
        voice_id: oldConfig.voice_settings?.voice || "shimmer",
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        },
        system_prompt: oldConfig.system_prompt,
        initial_message: oldConfig.initial_message,
        conversation_end_message: oldConfig.conversation_end_message
      },
      functions: functions,
      webhook_configuration: {
        url: "https://voice-salon-bot.onrender.com/api/elevenlabs/webhook",
        events: ["function_calls", "conversation_start", "conversation_end"]
      }
    };
  }

  convertParameters(vapiParams) {
    if (!vapiParams) {
      return {
        type: "object",
        properties: {}
      };
    }

    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(vapiParams)) {
      properties[key] = {
        type: value.type || "string",
        description: value.description || `Parameter: ${key}`
      };

      if (value.enum) {
        properties[key].enum = value.enum;
      }

      if (value.required !== false) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties: properties,
      required: required
    };
  }

  updateEnvironmentVariables() {
    console.log('\n🔧 Environment Variables:');
    
    const oldVars = ['VAPI_API_KEY', 'VAPI_AGENT_ID'];
    const newVars = ['ELEVENLABS_API_KEY', 'ELEVENLABS_AGENT_ID'];
    
    console.log('   Old variables to remove:');
    oldVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`   - ${varName} (currently set)`);
      } else {
        console.log(`   - ${varName}`);
      }
    });
    
    console.log('\n   New variables to set:');
    newVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`   ✅ ${varName} (already set)`);
      } else {
        console.log(`   ❌ ${varName} (needs to be set)`);
      }
    });
    
    console.log('\n   Add to your .env file:');
    console.log('   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here');
    console.log('   ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here');
    console.log('   API_BASE_URL=https://voice-salon-bot.onrender.com');
  }

  cleanup() {
    console.log('\n🧹 Cleanup options:');
    console.log('   You can now safely remove VAPI-specific files:');
    console.log('   - vapi-config.json (backed up as vapi-config.json.backup)');
    console.log('   - vapi-auto-config.js');
    console.log('   - vapi-sync.js');
    console.log('   - smart-vapi-registry.js');
    console.log('   - update-vapi-config.js');
    
    // Create backup of old config
    if (fs.existsSync(this.oldConfigPath)) {
      const backupPath = this.oldConfigPath + '.backup';
      fs.copyFileSync(this.oldConfigPath, backupPath);
      console.log(`   ✅ VAPI config backed up to: ${backupPath}`);
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const migrator = new VapiToElevenLabsMigrator();
  migrator.migrate().then(() => {
    migrator.cleanup();
  }).catch(console.error);
}

module.exports = VapiToElevenLabsMigrator;
