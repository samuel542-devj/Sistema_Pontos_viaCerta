// server.js
require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

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

// rota raiz -> redireciona para /alunos (onde listagem já é feita)
app.get("/", (req, res) => res.redirect("/alunos"));

// 404 / error
app.use((req, res) => res.status(404).send("Página não encontrada"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Algo deu errado!");
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
