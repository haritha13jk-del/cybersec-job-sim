const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

console.log(`AI: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);

const { mysqlPool, connectMongoDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const scenarioRoutes = require('./routes/scenarios');
const progressRoutes = require('./routes/progress');
const aiRoutes = require('./routes/ai');

const app = express();

// 🔐 Security
app.use(helmet());

// ✅ ✅ FINAL CORS FIX (NO FUNCTION = NO FAILURE)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://cybersecurityjobstimulation.netlify.app",
    /\.netlify\.app$/ // allow ALL Netlify deploy previews
  ],
  credentials: true
}));

// 🔥 IMPORTANT: Handle preflight manually
app.options('*', cors());

// 🧾 Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📊 Logging
app.use(morgan('dev'));

// 🚫 Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// ================= ROUTES =================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Cybersecurity Job Simulation Backend Running 🚀'
  });
});

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

// ================= ERROR HANDLING =================

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();
    await mysqlPool.getConnection();

    app.listen(PORT, () => {
      console.log('========================================');
      console.log(' CYBERSECURITY JOB SIMULATION SYSTEM');
      console.log('========================================');
      console.log(` Server running on port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log(' MySQL: Connected');
      console.log(' MongoDB: Connected');
      console.log(` AI: ${process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'}`);
      console.log('========================================');
      console.log(' All systems operational!');
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();