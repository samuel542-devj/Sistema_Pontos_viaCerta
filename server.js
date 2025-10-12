require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ====== EJS ======
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ====== MIDDLEWARES ======
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ====== CORS ======
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // permite frontend hospedado no mesmo domínio
  credentials: true,
}));

// ====== TRUST PROXY (ESSENCIAL PARA RENDER) ======
app.set("trust proxy", 1); // força reconhecimento de HTTPS no Render

// ====== SESSÃO ======
app.use(session({
  name: "sessao_viacerta", // nome do cookie
  secret: process.env.SESSION_SECRET || "SamuelSistemaPontos@2025!",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // obriga HTTPS no Render
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  }
}));

// ====== ROTAS ======
app.use("/alunos", require("./routes/aluno"));
app.use("/admin", require("./routes/admin"));

app.get("/", (req, res) => res.redirect("/alunos"));

// ====== ERROS ======
app.use((req, res) => res.status(404).send("Página não encontrada"));
app.use((err, req, res, next) => {
  console.error("Erro geral:", err.stack);
  res.status(500).send("Algo deu errado!");
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
