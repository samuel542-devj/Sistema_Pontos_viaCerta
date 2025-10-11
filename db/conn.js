// db/conn.js
const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL não definida no .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário para Neon
});

// Teste rápido de conexão na inicialização (opcional)
pool.query("SELECT NOW()")
  .then(r => console.log("✅ Conectado ao banco PostgreSQL (Neon) —", r.rows[0]))
  .catch(err => console.error("❌ Erro ao conectar ao banco:", err));

module.exports = pool;
