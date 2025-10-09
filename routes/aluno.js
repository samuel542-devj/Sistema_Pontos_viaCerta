// routes/aluno.js
const express = require("express");
const router = express.Router();
const db = require("../db/conn");

// ========== LISTAR ALUNOS ==========
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM alunos ORDER BY contrato ASC");
    res.render("index", { dados: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar alunos.");
  }
});

// ========== DETALHE DE UM ALUNO ==========
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM alunos WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.send("Aluno não encontrado.");
    res.render("aluno", { aluno: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar aluno.");
  }
});

// ========== CADASTRAR ALUNO ==========
router.post("/cadastrar", async (req, res) => {
  const { contrato, nome, pontos } = req.body;
  try {
    await db.query(
      "INSERT INTO alunos (contrato, nome, pontos) VALUES ($1, $2, $3)",
      [contrato, nome, pontos]
    );
    res.redirect("/alunos");
  } catch (err) {
    if (err.code === "23505") return res.send("Contrato já existe.");
    console.error(err);
    res.status(500).send("Erro ao cadastrar aluno.");
  }
});

// ========== ALTERAR PONTOS ==========
router.post("/alterar-pontos", async (req, res) => {
  const { contrato, pontos } = req.body;
  try {
    await db.query(
      "UPDATE alunos SET pontos = $1 WHERE contrato = $2",
      [pontos, contrato]
    );
    res.redirect("/alunos");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar pontos.");
  }
});

// ========== ALTERAR PONTOS EM LOTE ==========
router.post("/alterar-pontos-lote", async (req, res) => {
  let { alunosSelecionados, incremento } = req.body;
  const acao = req.query.acao;

  if (!alunosSelecionados) return res.send("Nenhum aluno selecionado.");

  incremento = parseInt(incremento) || 0;
  if (acao === "remover") incremento = -incremento;

  const contratos = Array.isArray(alunosSelecionados)
    ? alunosSelecionados
    : [alunosSelecionados];

  try {
    await db.query(
      "UPDATE alunos SET pontos = pontos + $1 WHERE contrato = ANY($2)",
      [incremento, contratos]
    );
    res.redirect("/alunos");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar pontos em lote.");
  }
});

// ========== DELETAR ALUNO ==========
router.post("/deletar", async (req, res) => {
  const { contrato } = req.body;
  try {
    const del = await db.query("DELETE FROM alunos WHERE contrato = $1", [contrato]);
    if (del.rowCount > 0) res.redirect("/alunos");
    else res.send("Aluno não encontrado!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar aluno.");
  }
});

module.exports = router;
