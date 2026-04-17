const { Pool } = require('pg');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= POSTGRESQL CONNECTION ================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectPostgres = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected Successfully');
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error.message);
  }
};


/* ================= MONGODB CONNECTION ================= */

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI missing');
    }

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectPostgres,
  connectMongoDB,
};