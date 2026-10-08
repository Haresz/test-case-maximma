require('dotenv').config();
const { Pool, types } = require('pg');

// Timestamp ditampilkan apa adanya (tanpa konversi zona waktu),
// numeric (nilai/kkm) diubah jadi angka supaya enak dibaca frontend.
types.setTypeParser(1114, (val) => val); // timestamp without time zone
types.setTypeParser(1700, (val) => parseFloat(val)); // numeric


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'sia',
  password: process.env.DB_PASSWORD || 'sia',
  database: process.env.DB_NAME || 'sia_db',
});

module.exports = pool;
