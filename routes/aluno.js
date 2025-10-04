const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Conexão com o banco
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",    // sua senha do MySQL, se tiver
    database: "sistema_pontos"
});

// Rota para exibir tela de login do aluno
router.get("/index", (req, res) => {
    res.render("Loginindex");
});

// Login do aluno (recebe número do contrato)
router.post("/login", (req, res) => {
    const contrato = req.body.contrato;

    db.query("SELECT * FROM alunos WHERE contrato = ?", [contrato], (err, results) => {
        if (err) {
            console.error(err);
            return res.send("Erro no servidor");
        }

        if (results.length === 0) {
            return res.send("Contrato não encontrado");
        }

        const aluno = results[0];
        // Salva na sessão (opcional)
        req.session.aluno = aluno;
        res.redirect("/alunos/painel");
    });
});

// Painel do aluno
router.get("/painel", (req, res) => {
    if (!req.session.aluno) {
        return res.redirect("/");
    }

    const aluno = req.session.aluno;
    res.render("PainelAluno", { aluno });
});



module.exports = router;
