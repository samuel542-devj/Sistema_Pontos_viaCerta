const db = require('../config/db'); // ou '../db/conn' se for o seu arquivo final

async function listarAlunos() {
  try {
    const res = await db.query('SELECT * FROM alunos LIMIT 10');
    console.log(res.rows); // aqui estão os dados
    return res.rows;
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    return []; // retorna array vazio em caso de erro
  }
}

module.exports = { listarAlunos };
