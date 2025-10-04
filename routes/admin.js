const express = require("express"); 
const router = express.Router();
const mysql = require("mysql2");

// Conexão com o banco
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sistema_pontos"
});

// ========== LOGIN ==========
router.get("/login", (req, res) => {
    res.render("admin");
});

router.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    db.query(
        "SELECT * FROM administrador WHERE usuario = ? AND senha = ?",
        [usuario, senha],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.send("Erro no servidor.");
            }
            if (results.length === 0) {
                return res.send("Usuário ou senha incorretos.");
            }

            req.session.administrador = results[0];
            res.redirect("/admin/painel");
        }
    );
});

// ========== PAINEL ADMIN ==========
router.get("/painel", (req, res) => {
    if (!req.session.administrador) return res.redirect("/admin/login");

    db.query("SELECT * FROM alunos ORDER BY contrato ASC", (err, alunos) => {
        if (err) {
            console.error(err);
            return res.send("Erro ao buscar alunos.");
        }

        res.render("PainelAdmin", { 
            administrador: req.session.administrador,
            alunos 
        });
    });
});

// ========== ALTERAR PONTOS INDIVIDUAL ==========
router.post("/alterar-pontos", (req, res) => {
    if (!req.session.administrador) return res.redirect("/admin/login");

    const { contrato, pontos } = req.body;

    db.query(
        "UPDATE alunos SET pontos = ? WHERE contrato = ?",
        [pontos, contrato],
        (err) => {
            if (err) {
                console.error(err);
                return res.send("Erro ao atualizar pontos.");
            }
            res.redirect("/admin/painel");
        }
    );
});

// ========== ALTERAR PONTOS EM LOTE ==========
router.post("/alterar-pontos-lote", (req, res) => {
    if (!req.session.administrador) return res.redirect("/admin/login");

    let { alunosSelecionados, incremento } = req.body;
    const acao = req.query.acao; // "remover" se veio dos botões de -5 / -10

    if (!alunosSelecionados) {
        return res.send("Nenhum aluno selecionado.");
    }

    incremento = parseInt(incremento) || 0;

    if (acao === "remover") incremento = -incremento;

    const contratos = Array.isArray(alunosSelecionados)
        ? alunosSelecionados
        : [alunosSelecionados];

    const query = `UPDATE alunos SET pontos = pontos + ? WHERE contrato IN (?)`;

    db.query(query, [incremento, contratos], (err) => {
        if (err) {
            console.error(err);
            return res.send("Erro ao atualizar pontos em lote.");
        }
        res.redirect("/admin/painel");
    });
});

// ========== CADASTRAR NOVO ALUNO ==========
router.get("/cadastrar", (req, res) => {
    if (!req.session.administrador) return res.redirect("/admin/login");
    res.render("CadastrarAluno");
});

router.post("/cadastrar", (req, res) => {
    if (!req.session.administrador) return res.redirect("/admin/login");
    
    const { contrato, nome, pontos } = req.body;

    const sql = "INSERT INTO alunos (contrato, nome, pontos) VALUES (?, ?, ?)";
    db.query(sql, [contrato, nome, pontos], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.send("Contrato já existe. Use outro contrato.");
            }
            console.error(err);
            return res.send("Erro ao cadastrar aluno.");
        }

        res.redirect("/admin/painel");
    });
});

// ========== LOGOUT ==========
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
});



// rota deletar
router.post("/deletar", (req, res) => {
  const { contrato, senha } = req.body;

  const sqlAdmin = "SELECT * FROM administrador WHERE senha = ?";
  db.query(sqlAdmin, [senha], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.send("Senha incorreta!");
    }

    const sqlDelete = "DELETE FROM alunos WHERE contrato = ?";
    db.query(sqlDelete, [contrato], (err, result) => {
      if (err) throw err;
      if (result.affectedRows > 0) {
        res.redirect("/admin/painel");
      } else {
        res.send("Aluno não encontrado!");
      }
    });
  });
});



module.exports = router;
