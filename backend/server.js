const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { mysqlPool, connectMongoDB } = require('./config/database');
const authRoutes    = require('./routes/auth');
const scenarioRoutes = require('./routes/scenarios');
const progressRoutes = require('./routes/progress');
const aiRoutes      = require('./routes/ai');

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Cybersecurity Job Simulation Backend Running' });
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

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

const testMySQL = async () => {
  try {
    const connection = await mysqlPool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('MySQL: Connected');
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    throw err;
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();
    await testMySQL();

    app.listen(PORT, () => {
      console.log('========================================');
      console.log(' CYBERSECURITY JOB SIMULATION SYSTEM');
      console.log('========================================');
      console.log(' Port:        ' + PORT);
      console.log(' Environment: ' + process.env.NODE_ENV);
      console.log(' MongoDB:     Connected');
      console.log(' AI:          ' + (process.env.GEMINI_API_KEY ? 'Enabled' : 'Disabled'));
      console.log('========================================');
    });

  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();