console.log(" db.js loaded");

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'chandu', 
  database: 'review_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.on('error', function (err) {
  console.error(" MySQL Pool Error:", err);
});

module.exports = pool;
