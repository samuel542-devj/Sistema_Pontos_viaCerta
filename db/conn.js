// db/conn.js
const { Pool } = require("pg");
require("dotenv").config(); // lê o .env local

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL não definida no .env");
}

// Evita criar múltiplos pools em serverless (Vercel/Render)
let pool;
if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // necessário para Neon/Render/Heroku
  });

  // Teste rápido de conexão na inicialização (opcional)
  global._pgPool.query("SELECT NOW()")
    .then(r => console.log("✅ Conectado ao banco PostgreSQL —", r.rows[0]))
    .catch(err => console.error("❌ Erro ao conectar ao banco:", err));
}

pool = global._pgPool;

module.exports = pool;
