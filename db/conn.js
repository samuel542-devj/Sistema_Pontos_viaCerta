// db/conn.js
const { Pool } = require('pg');
const dotenv = require('dotenv');
const { text } = require('body-parser');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário no Neon e Render
});

pool.connect()
  .then(() => console.log("✅ Conectado ao banco de dados PostgreSQL (Neon)"))
  .catch(err => console.error("❌ Erro ao conectar ao banco:", err));

module.exports = {
  query: (text, params) => pool.query(text, params),
};
  