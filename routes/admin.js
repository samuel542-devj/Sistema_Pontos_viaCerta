const express = require("express");
const router = express.Router();
const db = require("../db/conn");

// ===================== LOGIN =====================
router.get("/login", (req, res) => {
  res.render("Admin");
});

router.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM administrador WHERE usuario = $1 AND senha = $2",
      [usuario, senha]
    );

    if (result.rows.length === 0) {
      console.log("❌ Usuário ou senha incorretos");
      return res.render("Admin", { erro: "Usuário ou senha incorretos" });
    }

    // Salva o usuário logado na sessão
    req.session.administrador = result.rows[0];
    console.log("✅ Login bem-sucedido:", req.session.administrador.usuario);

    // Redireciona para o painel
    return res.redirect("/admin/painel");
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).send("Erro no servidor.");
  }
});

// ===================== PAINEL ADMIN =====================
router.get("/painel", async (req, res) => {
  if (!req.session.administrador) {
    console.log("🔒 Sessão expirada ou não logada.");
    return res.redirect("/admin/login");
  }

  try {
    const result = await db.query("SELECT * FROM alunos ORDER BY contrato ASC");
    res.render("PainelAdmin", {
      administrador: req.session.administrador,
      alunos: result.rows,
    });
  } catch (err) {
    console.error("Erro ao buscar alunos:", err);
    res.status(500).send("Erro ao buscar alunos.");
  }
});

// ===================== CADASTRAR ALUNO =====================
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
    if (err.code === "23505")
      return res.send("Contrato já existe. Use outro contrato.");
    console.error("Erro ao cadastrar aluno:", err);
    res.status(500).send("Erro ao cadastrar aluno.");
  }
});

// ===================== ALTERAR PONTOS =====================
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
    console.error("Erro ao atualizar pontos:", err);
    res.status(500).send("Erro ao atualizar pontos.");
  }
});

// ===================== LOGOUT =====================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    console.log("👋 Sessão encerrada.");
    res.redirect("/admin/login");
  });
});

router.post("/deletar", async (req, res) => {
  console.log("Tentando deletar aluno:", req.body.contrato);
  if (!req.session.administrador) return res.redirect("/admin/login");

  const { contrato } = req.body;
  try {
    const result = await db.query("DELETE FROM alunos WHERE contrato = $1", [contrato]);
    console.log("Resultado do delete:", result);
    res.redirect("/admin/painel");
  } catch (err) {
    console.error("Erro ao deletar aluno:", err);
    res.status(500).send("Erro ao deletar aluno.");
  }
});



module.exports = router;
