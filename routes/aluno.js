// routes/aluno.js
const express = require("express");
const router = express.Router();
const db = require("../db/conn");

// Página inicial / formulário do aluno (GET /alunos)
router.get("/", async (req, res) => {
  // Se quiser mostrar lista na mesma página, carregue aqui.
  // No caso atual, só renderizamos o formulário de login do aluno.
  res.render("index", { erro: null });
});

// POST /alunos/login — verifica contrato e mostra PainelAluno.ejs
router.post("/login", async (req, res) => {
  try {
    const contratoRaw = req.body.contrato || "";
    const contrato = String(contratoRaw).trim();

    if (!contrato) {
      return res.status(400).render("index", { erro: "Informe o número do contrato." });
    }

    const result = await db.query("SELECT * FROM alunos WHERE contrato = $1", [contrato]);
    if (result.rows.length === 0) {
      return res.status(404).render("index", { erro: "Contrato não encontrado." });
    }

    const aluno = result.rows[0];

    // Opcional: salvar na sessão para permitir "sair" / persistência
    // req.session.aluno = { id: aluno.id, contrato: aluno.contrato, nome: aluno.nome };

    // Renderiza o painel do aluno com os dados
    return res.render("PainelAluno", { aluno });
  } catch (err) {
    console.error("Erro no POST /alunos/login:", err);
    return res.status(500).render("index", { erro: "Erro no servidor. Tente novamente." });
  }
});

// (Opcional) rota para sair — caso use sessão
router.get("/sair", (req, res) => {
  if (req.session) req.session.destroy(() => {});
  res.redirect("/alunos");
});

module.exports = router;
