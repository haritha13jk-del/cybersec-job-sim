const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ================= DB + ROUTES =================
const { mysqlPool, connectMongoDB } = require('./config/database');
const authRoutes    = require('./routes/auth');
const scenarioRoutes = require('./routes/scenarios');
const progressRoutes = require('./routes/progress');
const aiRoutes      = require('./routes/ai');

const app = express();

// ✅ STEP 1: CORS must be FIRST — before helmet, before everything
const corsOptions = {
  origin: function (origin, callback) {
    // Allow no-origin requests (Postman, Railway health checks, mobile)
    if (!origin) return callback(null, true);

    const isAllowed =
      origin === 'http://localhost:3000' ||
      origin === 'https://cybersecurityjobstimulation.netlify.app' ||
      /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/.test(origin) || // deploy previews
      /^https:\/\/[a-z0-9-]+\.netlify\.app$/.test(origin);               // branch deploys

    if (isAllowed) return callback(null, true);

    console.warn(`❌ CORS blocked origin: ${origin}`);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // ✅ Some browsers send 204 and choke — force 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Handle ALL preflight before any other middleware

// ✅ STEP 2: Everything else after CORS
app.use(helmet({ crossOriginResourcePolicy: false })); // ❌ helmet's CORP header kills CORS otherwise
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ================= ROUTES =================
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Cybersecurity Job Simulation Backend Running 🚀' });
});

app.use('/api/auth',      authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/progress',  progressRoutes);
app.use('/api/ai',        aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ================= ERROR HANDLING =================
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  // ✅ CORS errors get a proper response, not a crash
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ success: false, error: err.message });
  }
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// ================= MYSQL TEST =================
const testMySQL = async () => {
  try {
    const connection = await mysqlPool.getConnection();
    await connection.query('SELECT 1');
    connection.release(); // ✅ Always release
    console.log(' MySQL: Connected ✅');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    throw err; // bubble up to crash server with clear message
  }
};

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();
    await testMySQL();

    app.listen(PORT, () => {
      console.log('========================================');
      console.log(' CYBERSECURITY JOB SIMULATION SYSTEM');
      console.log('========================================');
      console.log(` Port:        ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log(' MongoDB:     Connected ✅');
      console.log(` AI:          ${process.env.GEMINI_API_KEY ? 'Enabled ✅' : 'Disabled ⚠️'}`);
      console.log('========================================');
    });

  } catch (error) {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();