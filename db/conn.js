const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL não definida no .env");
}

let pool;
if (!global._pgPool) {
  global._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  global._pgPool.query("SELECT NOW()")
    .then(r => console.log("✅ Conectado ao banco PostgreSQL —", r.rows[0]))
    .catch(err => console.error("❌ Erro ao conectar ao banco:", err));
}

pool = global._pgPool;

module.exports = pool;
