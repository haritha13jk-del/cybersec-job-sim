const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= MYSQL CONNECTION ================= */

const mysqlConfig = {
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Debug log (safe)
console.log('MySQL Config:', {
  host: mysqlConfig.host,
  user: mysqlConfig.user,
  database: mysqlConfig.database
});

const mysqlPool = mysql.createPool(mysqlConfig);

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

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB Connected Successfully');

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // stop server if DB fails
  }
};


module.exports = {
  mysqlPool,
  testMySQL,
  connectMongoDB
};