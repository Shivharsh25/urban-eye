/**
 * Urban EYE Backend API Server
 * Express + Socket.io + Nodemailer + Geospatial Triage
 */

require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { initSocket } = require('./services/socketService');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ----------------------------------------------------
// Socket.io Real-Time Setup
// ----------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});
initSocket(io);

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Rate limiting on API routes
app.use('/api', apiLimiter);

// ----------------------------------------------------
// Health Check
// ----------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Urban EYE Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const userRoutes = require('./routes/userRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

// ----------------------------------------------------
// API Route Registration
// ----------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', detectionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/announcements', announcementRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

// ----------------------------------------------------
// Start Server
// ----------------------------------------------------
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Urban EYE API Server running on port ${PORT}`);
  console.log(`📡 WebSocket server active`);
  console.log(`📁 Static uploads served at http://localhost:${PORT}/uploads`);
  console.log(`=======================================================`);
});

module.exports = { app, server };
