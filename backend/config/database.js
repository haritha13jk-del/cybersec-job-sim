const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= MYSQL CONNECTION ================= */

let mysqlPool;

if (process.env.MYSQL_URL) {
  // ✅ Use full URL (BEST for Railway)
  const dbUrl = new URL(process.env.MYSQL_URL);

  mysqlPool = mysql.createPool({
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    port: dbUrl.port,

    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 10000,

    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('✅ MySQL using URL connection');
} else {
  throw new Error('❌ MYSQL_URL not found');
}

// Test MySQL
const testMySQL = async () => {
  try {
    const connection = await mysqlPool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('✅ MySQL Connected Successfully');
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