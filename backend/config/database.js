const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= MYSQL CONNECTION ================= */

let mysqlPool;

try {
  if (!process.env.MYSQL_URL) {
    throw new Error('MYSQL_URL not found in environment variables');
  }

  const dbUrl = new URL(process.env.MYSQL_URL);

  mysqlPool = mysql.createPool({
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    port: dbUrl.port,

    waitForConnections: true,
    connectionLimit: 2,          // 🔥 important (reduce load)
    queueLimit: 0,
    connectTimeout: 10000,

    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('✅ MySQL Pool Created Successfully');

} catch (error) {
  console.error('❌ MySQL Pool Creation Error:', error.message);
}


/* ================= MYSQL TEST ================= */

const testMySQL = async () => {
  try {
    if (!mysqlPool) {
      console.error('❌ MySQL Pool not initialized');
      return;
    }

    const connection = await mysqlPool.getConnection();
    await connection.query('SELECT 1');
    connection.release();

    console.log('✅ MySQL Connected Successfully');

  } catch (error) {
    // ⚠️ DO NOT crash server
    console.error('❌ MySQL Connection Error:', error.message);
    console.log('⚠️ Continuing without MySQL (temporary)');
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
    process.exit(1); // MongoDB is critical → stop server
  }
};


module.exports = {
  mysqlPool,
  testMySQL,
  connectMongoDB
};