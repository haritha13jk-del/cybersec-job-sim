const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= MYSQL CONNECTION ================= */

// ✅ Extract config from URL manually
const dbUrl = new URL(process.env.MYSQL_URL);

const mysqlPool = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  port: dbUrl.port,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // ✅ IMPORTANT for Railway
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('MySQL Config:', {
  host: dbUrl.hostname,
  user: dbUrl.username,
  database: dbUrl.pathname.replace('/', ''),
  port: dbUrl.port
});

// Test MySQL
const testMySQL = async () => {
  try {
    const connection = await mysqlPool.getConnection();
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    throw error;
  }
};

/* ================= MONGODB ================= */

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
  mysqlPool,
  testMySQL,
  connectMongoDB
};