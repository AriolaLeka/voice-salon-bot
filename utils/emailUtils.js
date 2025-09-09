// Email utilities for appointment booking system using Resend

const { Resend } = require('resend');
const moment = require('moment');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const emailTemplates = {
  es: {
    subject: 'Cita Confirmada - Hera\'s Nails & Lashes',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b9d; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #c44569; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💅 Hera's Nails & Lashes</div>
            <h1>Cita Confirmada</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${data.name}!</h2>
            <p>Tu cita ha sido confirmada exitosamente. Aquí tienes todos los detalles:</p>
            
            <div class="appointment-details">
              <div class="detail-row">
                <span class="label">📅 Fecha:</span> ${moment(data.date).format('dddd, DD [de] MMMM [de] YYYY')}
              </div>
              <div class="detail-row">
                <span class="label">🕐 Hora:</span> ${data.time}
              </div>
              <div class="detail-row">
                <span class="label">📧 Email:</span> ${data.email}
              </div>
              <div class="detail-row">
                <span class="label">📝 Servicio:</span> ${data.notes}
              </div>
            </div>
            
            <p><strong>📍 Ubicación:</strong><br>
            Calle Santos Justo y Pastor 72, Valencia<br>
            Cerca de La Salud</p>
            
            <p><strong>🚗 Cómo llegar:</strong><br>
            • Metro: Línea 5, 7 - Amistat-Casa de Salut (5 min caminando)<br>
            • Bus: Líneas 30, 40, 32 - Parada Sants Just i Pastor<br>
            • Parking: Zona azul/blanca disponible</p>
            
            <p><strong>📞 Contacto:</strong><br>
            Si necesitas cambiar o cancelar tu cita, contáctanos con al menos 24 horas de anticipación.</p>
            
            <p>¡Esperamos verte pronto!</p>
            <p>El equipo de Hera's Nails & Lashes 💅✨</p>
          </div>
          <div class="footer">
            <p>Este email fue generado automáticamente por nuestro sistema de reservas.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  en: {
    subject: 'Appointment Confirmed - Hera\'s Nails & Lashes',
    html: (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b9d; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #c44569; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 24px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💅 Hera's Nails & Lashes</div>
            <h1>Appointment Confirmed</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name}!</h2>
            <p>Your appointment has been successfully confirmed. Here are all the details:</p>
            
            <div class="appointment-details">
              <div class="detail-row">
                <span class="label">📅 Date:</span> ${moment(data.date).format('dddd, MMMM Do, YYYY')}
              </div>
              <div class="detail-row">
                <span class="label">🕐 Time:</span> ${data.time}
              </div>
              <div class="detail-row">
                <span class="label">📧 Email:</span> ${data.email}
              </div>
              <div class="detail-row">
                <span class="label">📝 Service:</span> ${data.notes}
              </div>
            </div>
            
            <p><strong>📍 Location:</strong><br>
            Calle Santos Justo y Pastor 72, Valencia<br>
            Near La Salud area</p>
            
            <p><strong>🚗 How to get there:</strong><br>
            • Metro: Line 5, 7 - Amistat-Casa de Salut (5 min walk)<br>
            • Bus: Lines 30, 40, 32 - Sants Just i Pastor stop<br>
            • Parking: Blue/white zone available</p>
            
            <p><strong>📞 Contact:</strong><br>
            If you need to change or cancel your appointment, please contact us at least 24 hours in advance.</p>
            
            <p>We look forward to seeing you soon!</p>
            <p>The Hera's Nails & Lashes team 💅✨</p>
          </div>
          <div class="footer">
            <p>This email was automatically generated by our booking system.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Send appointment confirmation email
async function sendAppointmentEmail(appointmentData, language = 'en') {
  try {
    console.log('📧 Sending appointment email for:', appointmentData);
    
    // Check if Resend is properly configured
    if (!process.env.RESEND_API_KEY) {
      console.log('❌ Resend API key not configured - skipping email sending');
      return {
        success: false,
        error: 'Resend API key not configured'
      };
    }
    
    const template = emailTemplates[language] || emailTemplates.en;
    
    const emailData = {
      from: 'Hera\'s Nails & Lashes <atiendebot@gmail.com>', // Using your verified email
      to: [appointmentData.email],
      subject: template.subject,
      html: template.html(appointmentData)
    };
    
    console.log('📤 Sending email to:', appointmentData.email);
    
    const response = await resend.emails.send(emailData);
    
    console.log('✅ Email sent successfully');
    console.log('Email ID:', response.data?.id);
    
    return {
      success: true,
      emailId: response.data?.id,
      message: 'Appointment confirmation email sent successfully'
    };
    
  } catch (error) {
    console.error('❌ Error sending appointment email:', error);
    console.error('Error details:', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Send email to salon (internal notification)
async function sendSalonNotification(appointmentData, language = 'en') {
  try {
    console.log('📧 Sending salon notification for:', appointmentData);
    
    if (!process.env.RESEND_API_KEY || !process.env.SALON_EMAIL) {
      console.log('❌ Resend API key or salon email not configured - skipping salon notification');
      return {
        success: false,
        error: 'Resend API key or salon email not configured'
      };
    }
    
    const subject = language === 'es' 
      ? `Nueva Cita - ${appointmentData.name} - ${moment(appointmentData.date).format('DD/MM/YYYY')} ${appointmentData.time}`
      : `New Appointment - ${appointmentData.name} - ${moment(appointmentData.date).format('MM/DD/YYYY')} ${appointmentData.time}`;
    
    const html = `
      <h2>${language === 'es' ? 'Nueva Cita Reservada' : 'New Appointment Booked'}</h2>
      <p><strong>${language === 'es' ? 'Cliente' : 'Client'}:</strong> ${appointmentData.name}</p>
      <p><strong>${language === 'es' ? 'Email' : 'Email'}:</strong> ${appointmentData.email}</p>
      <p><strong>${language === 'es' ? 'Fecha' : 'Date'}:</strong> ${moment(appointmentData.date).format('DD/MM/YYYY')}</p>
      <p><strong>${language === 'es' ? 'Hora' : 'Time'}:</strong> ${appointmentData.time}</p>
      <p><strong>${language === 'es' ? 'Servicio' : 'Service'}:</strong> ${appointmentData.notes}</p>
      <p><em>${language === 'es' ? 'Reservado a través del bot de voz' : 'Booked through voice bot'}</em></p>
    `;
    
    const emailData = {
      from: 'Hera\'s Nails & Lashes <atiendebot@gmail.com>',
      to: [process.env.SALON_EMAIL],
      subject: subject,
      html: html
    };
    
    const response = await resend.emails.send(emailData);
    
    console.log('✅ Salon notification sent successfully');
    
    return {
      success: true,
      emailId: response.data?.id,
      message: 'Salon notification sent successfully'
    };
    
  } catch (error) {
    console.error('❌ Error sending salon notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Generate voice response for email booking
function generateEmailBookingResponse(appointmentData, language = 'en') {
  const { name, date, time, email, notes } = appointmentData;
  
  if (language === 'es') {
    return {
      confirmation: `Perfecto, ${name}. Tu cita está confirmada para el ${moment(date).format('DD/MM/YYYY')} a las ${time}. Te hemos enviado un email de confirmación a ${email} con todos los detalles. ¿Hay algo más en lo que pueda ayudarte?`,
      summary: `Cita confirmada: ${notes} - ${moment(date).format('DD/MM/YYYY')} ${time}`
    };
  } else {
    return {
      confirmation: `Perfect, ${name}. Your appointment is confirmed for ${moment(date).format('MM/DD/YYYY')} at ${time}. We've sent you a confirmation email at ${email} with all the details. Is there anything else I can help you with?`,
      summary: `Appointment confirmed: ${notes} - ${moment(date).format('MM/DD/YYYY')} ${time}`
    };
  }
}

module.exports = {
  sendAppointmentEmail,
  sendSalonNotification,
  generateEmailBookingResponse
};
