const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= MYSQL CONNECTION ================= */

// ✅ Ensure MYSQL_URL exists
if (!process.env.MYSQL_URL) {
  throw new Error('❌ MYSQL_URL not found in environment variables');
}

// ✅ Parse Railway public MySQL URL
const dbUrl = new URL(process.env.MYSQL_URL);

// ✅ Create MySQL pool
const mysqlPool = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  port: dbUrl.port,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // ✅ Required for Railway (AWS-based)
  ssl: 'Amazon RDS'
});

// 🔍 Debug (safe)
console.log('MySQL Config:', {
  host: dbUrl.hostname,
  user: dbUrl.username,
  database: dbUrl.pathname.replace('/', ''),
  port: dbUrl.port
});

// ✅ Test MySQL connection
const testMySQL = async () => {
  try {
    const connection = await mysqlPool.getConnection();
    await connection.query('SELECT 1'); // ensures DB responds
    connection.release();
    console.log('✅ MySQL Connected Successfully');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
    throw error;
  }
};


/* ================= MONGODB CONNECTION ================= */

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI not found');
    }

    // ✅ Clean modern connection (no deprecated options)
    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB Connected Successfully');

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // stop app if Mongo fails
  }
};


/* ================= EXPORTS ================= */

module.exports = {
  mysqlPool,
  testMySQL,
  connectMongoDB
};