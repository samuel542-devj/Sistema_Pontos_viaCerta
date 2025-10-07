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

// CORS — permitir que frontend hospedado em domínio acesse o backend
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // idealmente especificar domínio real
  credentials: true // permitir cookies se usar
}));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || "segredo_forte",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true
  }
}));

// Rotas
app.use("/alunos", require("./routes/aluno"));
app.use("/admin", require("./routes/admin"));

// Rota principal
app.get("/", (req, res) => {
  res.render("index");
});

// 404 — rota não encontrada
app.use((req, res, next) => {
  res.status(404).send("Página não encontrada");
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo deu errado!");
});

module.exports = app;
