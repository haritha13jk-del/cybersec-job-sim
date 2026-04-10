const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

/* ================= MYSQL CONNECTION ================= */

const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
    const mongoUri = process.env.MONGODB_URI;

    console.log('MongoDB URI found:', mongoUri ? 'YES' : 'NO');

    if (!mongoUri) {
      console.error('❌ No MongoDB URI found!');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected Successfully');

  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};

/* ================= EXPORT ================= */

module.exports = { mysqlPool, connectMongoDB };