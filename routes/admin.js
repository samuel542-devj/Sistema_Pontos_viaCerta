const express = require("express");
const router = express.Router();
const db = require("../db/conn"); // seu pool PostgreSQL
// middleware para lidar com sessões
// certifique-se de ter configurado express-session no app.js

// ================== FUNÇÃO PARA LISTAR ALUNOS ==================
async function listarAlunos() {
  try {
    const result = await db.query("SELECT * FROM alunos ORDER BY contrato ASC");
    console.log(result.rows);
    return result.rows;
  } catch (err) {
    console.error("Erro ao listar alunos:", err);
    return [];
  }
}

// ================== ROTA EXEMPLO ==================
router.get("/alguma-rota", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM alunos LIMIT 10");
    res.render("index", { dados: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no banco");
  }
});

// ================== LOGIN ADMIN ==================
router.get("/login", (req, res) => {
  res.render("admin");
});

router.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM administrador WHERE usuario = $1 AND senha = $2",
      [usuario, senha]
    );

    if (result.rows.length === 0) {
      return res.send("Usuário ou senha incorretos.");
    }

    req.session.administrador = result.rows[0];
    res.redirect("/admin/painel");
  } catch (err) {
    console.error(err);
    res.send("Erro no servidor.");
  }
});

// ================== PAINEL ADMIN ==================
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

// ================== ALTERAR PONTOS INDIVIDUAL ==================
router.post("/alterar-pontos", async (req, res) => {
  if (!req.session.administrador) return res.redirect("/admin/login");

  const { contrato, pontos } = req.body;

  try {
    await db.query("UPDATE alunos SET pontos = $1 WHERE contrato = $2", [
      pontos,
      contrato,
    ]);
    res.redirect("/admin/painel");
  } catch (err) {
    console.error(err);
    res.send("Erro ao atualizar pontos.");
  }
});

// ================== ALTERAR PONTOS EM LOTE ==================
router.post("/alterar-pontos-lote", async (req, res) => {
  if (!req.session.administrador) return res.redirect("/admin/login");

  let { alunosSelecionados, incremento } = req.body;
  const acao = req.query.acao; // "remover" se veio dos botões de -5 / -10

  if (!alunosSelecionados) return res.send("Nenhum aluno selecionado.");

  incremento = parseInt(incremento) || 0;
  if (acao === "remover") incremento = -incremento;

  const contratos = Array.isArray(alunosSelecionados)
    ? alunosSelecionados
    : [alunosSelecionados];

  try {
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

// ================== CADASTRAR NOVO ALUNO ==================
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
      [contrato, nome, pontos]
    );
    res.redirect("/admin/painel");
  } catch (err) {
    if (err.code === "23505") {
      // código de duplicidade no PostgreSQL
      return res.send("Contrato já existe. Use outro contrato.");
    }
    console.error(err);
    res.send("Erro ao cadastrar aluno.");
  }
});

// ================== LOGOUT ==================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

// ================== DELETAR ALUNO ==================
router.post("/deletar", async (req, res) => {
  const { contrato, senha } = req.body;

  try {
    // verifica senha admin
    const admin = await db.query(
      "SELECT * FROM administrador WHERE senha = $1",
      [senha]
    );
    if (admin.rows.length === 0) return res.send("Senha incorreta!");

    // deleta aluno
    const result = await db.query("DELETE FROM alunos WHERE contrato = $1", [
      contrato,
    ]);

    if (result.rowCount > 0) {
      res.redirect("/admin/painel");
    } else {
      res.send("Aluno não encontrado!");
    }
  } catch (err) {
    console.error(err);
    res.send("Erro ao deletar aluno.");
  }
});

module.exports = router;
