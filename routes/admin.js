// routes/admin.js
const express = require("express");
const router = express.Router();
const db = require("../db/conn");

// tela login
router.get("/login", (req, res) => res.render("Admin"));

// login simples (senha em texto)
router.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM administrador WHERE usuario = $1 AND senha = $2",
      [usuario, senha]
    );
    if (result.rows.length === 0) return res.send("Usuário ou senha incorretos.");
    req.session.administrador = result.rows[0];
    res.redirect("/admin/painel");
  } catch (err) {
    console.error(err);
    res.send("Erro no servidor.");
  }
});

// painel
router.get("/painel", async (req, res) => {
  if (!req.session.administrador) return res.redirect("/admin/login");
  try {
    const result = await db.query("SELECT * FROM alunos ORDER BY contrato ASC");
    res.render("PainelAdmin", {
      administrador: req.session.administrador,
      alunos: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.send("Erro ao buscar alunos.");
  }
});

// cadastrar (form)
router.get("/cadastrar", (req, res) => {
  if (!req.session.administrador) return res.redirect("/admin/login");
  res.render("CadastrarAluno");
});

router.post("/cadastrar", async (req, res) => {
  if (!req.session.administrador) return res.redirect("/admin/login");
  const { contrato, nome, pontos } = req.body;
  try {
    await db.query(
      "INSERT INTO alunos (contrato, nome, pontos) VALUES ($1, $2, $3)",
      [contrato, nome, pontos || 0]
    );
    res.redirect("/admin/painel");
  } catch (err) {
    if (err.code === "23505") return res.send("Contrato já existe. Use outro contrato.");
    console.error(err);
    res.send("Erro ao cadastrar aluno.");
  }
});

// alterar pontos individual
router.post("/alterar-pontos", async (req, res) => {
  if (!req.session.administrador) return res.redirect("/admin/login");
  const { contrato, pontos } = req.body;
  try {
    await db.query("UPDATE alunos SET pontos = $1 WHERE contrato = $2", [pontos, contrato]);
    res.redirect("/admin/painel");
  } catch (err) {
    console.error(err);
    res.send("Erro ao atualizar pontos.");
  }
});

// alterar pontos em lote
router.post("/alterar-pontos-lote", async (req, res) => {
  if (!req.session.administrador) return res.redirect("/admin/login");
  let { alunosSelecionados, incremento } = req.body;
  const acao = req.query.acao; // se usar ?acao=remover
  if (!alunosSelecionados) return res.send("Nenhum aluno selecionado.");
  incremento = parseInt(incremento) || 0;
  if (acao === "remover") incremento = -incremento;
  const contratos = Array.isArray(alunosSelecionados) ? alunosSelecionados : [alunosSelecionados];
  try {
    // usamos cast explícito para text[]
    await db.query(
      "UPDATE alunos SET pontos = pontos + $1 WHERE contrato = ANY($2::text[])",
      [incremento, contratos]
    );
    res.redirect("/admin/painel");
  } catch (err) {
    console.error(err);
    res.send("Erro ao atualizar pontos em lote.");
  }
});

// deletar
router.post("/deletar", async (req, res) => {
  if (!req.session.administrador) return res.redirect("/admin/login");
  const { contrato } = req.body;
  try {
    await db.query("DELETE FROM alunos WHERE contrato = $1", [contrato]);
    res.redirect("/admin/painel");
  } catch (err) {
    console.error(err);
    res.send("Erro ao deletar aluno.");
  }
});

// logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

module.exports = router;
