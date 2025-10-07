const db = require('../config/db'); // volta um nível porque está dentro de controllers

async function listarAlunos() {
  try {
    const [rows] = await db.query('SELECT * FROM alunos LIMIT 10');
    console.log(rows);
    return rows;
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
  }
}

module.exports = { listarAlunos };
