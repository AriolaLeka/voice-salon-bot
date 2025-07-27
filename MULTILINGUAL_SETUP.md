# Multilingual Support Setup

This document explains how the Hera's Nails & Lashes Voice Bot API now supports both English and Spanish languages.

## Overview

The API now automatically detects the user's preferred language and responds accordingly. This is particularly useful for Vapi.ai integration where you want to handle both English and Spanish-speaking customers.

## Language Detection

The system detects the language in the following order:

1. **Query Parameter**: `?lang=en` or `?lang=es`
2. **Accept-Language Header**: Standard HTTP header
3. **Default**: English (`en`)

## API Endpoints with Multilingual Support

### General Endpoints
- `/api/general/welcome` - Welcome message in detected language
- `/api/general/about` - Business information in detected language
- `/api/general/services-overview` - Services overview
- `/api/general/contact` - Contact information

### Hours Endpoints
- `/api/hours/status` - Business status with localized messages
- `/api/hours/today` - Today's hours
- `/api/hours/week` - Weekly schedule with localized summaries

### Services Endpoints
- `/api/services` - All services with translated categories
- `/api/services/search` - Service search
- `/api/services/popular` - Popular services

### Location Endpoints
- `/api/location/summary` - Location summary with localized transport/parking info

## Vapi.ai Configuration

### Updated Settings
- **Language**: Changed from `es-ES` to `en-US`
- **System Prompt**: Updated to English
- **Initial Message**: Updated to English
- **Conversation End Message**: Updated to English

### Function Descriptions
All external functions in `vapi-config.json` now work with both languages:
- The API automatically detects language from Vapi.ai requests
- Responses are formatted in the detected language
- Service categories are translated appropriately

## Usage Examples

### Testing with Language Parameter
```bash
# English
curl "https://your-domain.com/api/general/welcome?lang=en"

# Spanish
curl "https://your-domain.com/api/general/welcome?lang=es"
```

### Testing with Accept-Language Header
```bash
# English
curl -H "Accept-Language: en-US" "https://your-domain.com/api/general/welcome"

# Spanish
curl -H "Accept-Language: es-ES" "https://your-domain.com/api/general/welcome"
```

## Translation Coverage

### Service Categories
- Manicuras ↔ Manicures
- Pedicuras ↔ Pedicures
- Cejas ↔ Eyebrows
- Pestañas ↔ Eyelashes
- Faciales ↔ Facial treatments

### Common Messages
- Business status (Open/Closed)
- Time-based greetings
- Hours summaries
- Transport information
- Parking information

## Implementation Details

### Language Utilities (`utils/languageUtils.js`)
- `detectLanguage(req)` - Detects language from request
- `getTimeBasedGreeting(language)` - Time-based greetings
- `getBusinessStatusMessage(isOpen, language)` - Status messages
- `translateServiceCategory(category, language)` - Service translations
- `getWelcomeMessage(language)` - Welcome message templates
- `getHoursSummary(businessHours, language)` - Hours summaries

### Route Updates
All route files have been updated to:
1. Import language utilities
2. Detect language from requests
3. Pass language parameter to helper functions
4. Return localized responses

## Testing

To test the multilingual functionality:

1. **Deploy the updated code**
2. **Test with different language parameters**
3. **Verify Vapi.ai integration works in both languages**
4. **Check that all endpoints return appropriate language**

## Future Enhancements

Consider adding:
- More service category translations
- Additional language support (French, German, etc.)
- Language-specific pricing display
- Localized business hours format
- Country-specific contact information

## Notes

- The system defaults to English for Vapi.ai calls
- Spanish responses maintain the original tone and style
- All business data remains the same, only presentation changes
- Service prices and technical details are not translated 