const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

/* ================= MYSQL CONNECTION (FINAL FIX) ================= */

const mysqlPool = mysql.createPool(process.env.MYSQL_URL);

mysqlPool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

/* ================= MONGODB CONNECTION ================= */

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

    console.log('MongoDB URI found:', mongoUri ? 'YES' : 'NO');

    if (!mongoUri) {
      console.error('❌ No MongoDB URI found!');
      return;
    }

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB Connected Successfully');

  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
  }
};

/* ================= EXPORT ================= */

module.exports = { mysqlPool, connectMongoDB };