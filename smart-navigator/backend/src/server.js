require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./utils/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/locations');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Leaflet
        "https://unpkg.com", // Leaflet CDN
        "https://cdnjs.cloudflare.com" // Leaflet icons
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Leaflet
        "https://unpkg.com", // Leaflet CDN
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://*.tile.openstreetmap.org", // OpenStreetMap tiles
        "https://server.arcgisonline.com", // Satellite tiles
        "https://*.basemaps.cartocdn.com", // CartoDB tiles
        "https://cdnjs.cloudflare.com" // Leaflet marker icons
      ],
      connectSrc: [
        "'self'"
      ]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration (support multiple origins from env)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// In production, serve frontend build and enable SPA fallback
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));

  // SPA fallback: send index.html for non-API GET routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
