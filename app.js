const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Configurações de template
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

app.use(express.static(path.join(__dirname, "public")));



// Rotas
app.use("/admin", require("./routes/admin"));

// Rota principal / alunos
const db = require("./db/conn");
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM alunos ORDER BY contrato ASC");
    res.render("index", { dados: result.rows }); // index.ejs
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar alunos.");
  }
});

// 404
app.use((req, res, next) => {
  res.status(404).send("Página não encontrada");
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo deu errado!");
});


const db = require("./db/conn");


module.exports = app;
