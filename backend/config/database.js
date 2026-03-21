const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
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

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = { mysqlPool, connectMongoDB };