"""
System prompts for the TopPestanas product advice bot.
"""

import json
from datetime import datetime
import pytz

def get_time_based_greeting() -> str:
    """Get greeting based on current time."""
    tz = pytz.timezone('Europe/Madrid')
    now = datetime.now(tz)
    hour = now.hour
    
    if 6 <= hour < 12:
        return "¡Buenos dias! Soy tu asesor de TopPestanas 👋"
    elif 12 <= hour < 18:
        return "¡Buenas tardes! Soy tu asesor de TopPestanas 👋"
    else:
        return "¡Buenas noches! Soy tu asesor de TopPestanas 👋"

def get_business_hours_info() -> str:
    """Get business hours information from schedule.json."""
    try:
        with open('lib/schedule.json', 'r', encoding='utf-8') as f:
            schedule = json.load(f)
        
        business_hours = schedule.get('business_hours', {})
        hours_info = []
        
        for day, hours in business_hours.items():
            if hours == "Closed":
                hours_info.append(f"{day}: Cerrado")
            else:
                hours_info.append(f"{day}: {hours}")
        
        return "\n".join(hours_info)
    except Exception:
        return "Lunes a Viernes: 10:00-18:00\nSabado y Domingo: Cerrado"

def is_business_hours() -> bool:
    """Check if it's currently business hours."""
    try:
        tz = pytz.timezone('Europe/Madrid')
        now = datetime.now(tz)
        weekday = now.strftime('%A')
        
        with open('lib/schedule.json', 'r', encoding='utf-8') as f:
            schedule = json.load(f)
        
        business_hours = schedule.get('business_hours', {})
        today_hours = business_hours.get(weekday, "Closed")
        
        if today_hours == "Closed":
            return False
        
        # Parse hours (assuming format "HH:MM-HH:MM")
        start_time, end_time = today_hours.split('-')
        start_hour = int(start_time.split(':')[0])
        end_hour = int(end_time.split(':')[0])
        
        current_hour = now.hour
        return start_hour <= current_hour < end_hour
        
    except Exception:
        # Fallback: assume business hours are 10-18 on weekdays
        tz = pytz.timezone('Europe/Madrid')
        now = datetime.now(tz)
        return 0 <= now.weekday() <= 4 and 10 <= now.hour < 18

# Default system prompt for the TopPestanas product advice agent
DEFAULT_SYSTEM_PROMPT = (
    "Eres el asistente virtual de TopPestanas, especializado en productos de belleza.\n"
    "Tu funcion es proporcionar asesoramiento experto sobre productos de belleza.\n\n"
    "ESTILO DE CONVERSACION:\n"
    "• Usa frases cortas y directas\n"
    "• Maximo 2-3 frases por respuesta\n"
    "• Se natural y conversacional\n"
    "• Evita textos largos y formales\n"
    "• Responde como un amigo experto\n\n"
    "HORARIOS DE ATENCION:\n"
    f"{get_business_hours_info()}\n\n"
    "SOBRE NOSOTROS:\n"
    "• Somos TopPestanas, tenemos las mejores profesionales para nuestros servicios\n"
    "• Especialistas en uñas, pestañas, pedicuras y tintes.\n"
    "• Proporcionamos asesoramiento experto\n\n"
    "TU FUNCION:\n"
    "1. Proporcionar asesoramiento experto sobre productos\n"
    "2. Ayudar a encontrar productos adecuados\n"
    "3. Explicar caracteristicas y beneficios\n"
    "4. Informar sobre horarios cuando pregunten\n"
    "5. NO realizamos ventas directas\n\n"
    "INSTRUCCIONES:\n"
    "1. Si es la primera vez, saluda brevemente\n"
    "2. Para servicios especificos, usa getRelatedProducts\n"
    "3. Para informacion general, usa showcaseStoreOptions\n"
    "4. Para servicios del salon, usa showcaseStoreServices\n"
    "5. Para horarios, usa getBusinessHours\n"
    "6. Para ubicacion y parking, usa getLocationInfo\n"
    "7. Para conversacion normal, usa no_tool_needed\n"
    "8. NUNCA ofrezcas ventas directas\n"
    "9. Se amable y profesional\n"
    "10. Responde en espanol principalmente\n"
    "11. Usa frases cortas y naturales\n"
    "12. Si estan fuera del horario, menciona cuando abren"
)

# Welcome message for first-time interactions
WELCOME_MESSAGE = (
    "¡Hola! Soy tu asesor de TopPestanas \n\n"
    "Te ayudo con información sobre nuestros servicios:\n"
    "• 👁️ Extensiones de pestañas (Pelo a pelo, Volumen ruso)\n"
    "• 💅 Manicura y pedicura profesional\n"
    "• ✂️ Cejas (tinte, depilación, laminado)\n"
    "• 💎 Packs especiales desde 49€\n\n"
    "Horario: Lunes a Viernes 10:00-18:00\n"
    "Ubicación: Campanar, Valencia\n\n"
    "¿Qué servicio te interesa?"
)

# Error message for when processing fails
ERROR_MESSAGE = "Lo siento, hubo un error procesando tu mensaje. Por favor, intenta de nuevo." 