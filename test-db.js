const db = require("./db/conn");

db.query("SELECT NOW()")
  .then(res => console.log("Conectado:", res.rows[0]))
  .catch(err => console.error("Erro de conexão:", err));
