const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
console.log("API KEY LOADED:", process.env.GEMINI_API_KEY ? "YES - " + process.env.GEMINI_API_KEY.substring(0,10) + "..." : "NO - UNDEFINED");


const { mysqlPool, connectMongoDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const scenarioRoutes = require('./routes/scenarios');
const progressRoutes = require('./routes/progress');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();
    await mysqlPool.getConnection();
    app.listen(PORT, () => {
      console.log('========================================');
      console.log(' CYBERSECURITY JOB SIMULATION SYSTEM');
      console.log('========================================');
      console.log(` Server running on: http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log(` MySQL: Connected`);
      console.log(` MongoDB: Connected`);
      console.log(` AI: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
      console.log('========================================');
      console.log(' All systems operational!');
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();