const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectMongoDB } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const scenarioRoutes = require('./routes/scenarios');
const progressRoutes = require('./routes/progress');
const aiRoutes = require('./routes/ai');

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

/* ================= ROUTES ================= */

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Backend Running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true });
});

/* ================= ERROR ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

/* ================= START ================= */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Server error:', error.message);
    process.exit(1);
  }
};

startServer();