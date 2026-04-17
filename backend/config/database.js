const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= MYSQL CONNECTION ================= */

// ✅ Use full Railway PUBLIC URL (IMPORTANT)
const mysqlPool = mysql.createPool({
  uri: process.env.MYSQL_URL,   // <-- THIS is the fix
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Debug log
console.log('MySQL using URL:', process.env.MYSQL_URL ? 'YES' : 'NO');

// Test MySQL connection
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


/* ================= MONGODB CONNECTION ================= */

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI not found in environment variables');
    }

    // ✅ Removed deprecated options
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