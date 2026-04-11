const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

/* ================= MYSQL CONNECTION ================= */

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 🔍 Debug log (IMPORTANT)
console.log('MySQL Config:', mysqlConfig);

// ✅ Create pool safely
const mysqlPool = mysql.createPool(mysqlConfig);

// ✅ Test connection
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
      throw new Error('MongoDB URI missing');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected Successfully');

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
};

module.exports = {
  mysqlPool,
  testMySQL,
  connectMongoDB
};