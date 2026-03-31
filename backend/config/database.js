const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= MYSQL CONNECTION ================= */

const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

mysqlPool.getConnection()
  .then(connection => {
    console.log('MySQL Connected Successfully');
    connection.release();
  })
  .catch(err => {
    console.error('MySQL Connection Error:', err.message);
  });

/* ================= MONGODB CONNECTION ================= */

const connectMongoDB = async () => {
  try {
    // Check both Railway variables
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

    console.log('MongoDB URI found:', mongoUri ? 'YES' : 'NO');

    if (!mongoUri) {
      console.error('❌ No MongoDB URI found! Check MONGODB_URI or MONGO_URL in Railway.');
      return;
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB Connected Successfully');

  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
  }
};

/* ================= EXPORT ================= */

module.exports = { mysqlPool, connectMongoDB };