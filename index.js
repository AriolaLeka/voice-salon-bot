require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import routes
const servicesRouter = require('./routes/services');
const hoursRouter = require('./routes/hours');
const locationRouter = require('./routes/location');
const generalRouter = require('./routes/general');
const appointmentsRouter = require('./routes/appointments');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration for Vapi.ai
app.use(cors({
  origin: ['https://vapi.ai', 'https://app.vapi.ai', 'https://api.vapi.ai'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'TopPestanas Voice Bot API',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/services', servicesRouter);
app.use('/api/hours', hoursRouter);
app.use('/api/location', locationRouter);
app.use('/api/general', generalRouter);
app.use('/api/appointments', appointmentsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TopPestanas Voice Bot API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      services: '/api/services',
      hours: '/api/hours',
      location: '/api/location',
      general: '/api/general'
    },
    documentation: 'Check README.md for API documentation'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/health',
      '/api/services',
      '/api/hours', 
      '/api/location',
      '/api/general'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TopPestanas Voice Bot API running on port ${PORT}`);
  console.log(`📞 Ready to handle Vapi.ai requests`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs: http://localhost:${PORT}/`);
});

module.exports = app; 