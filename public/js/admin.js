//<script src="/js/admin.js"></script>

const formLote = document.getElementById('form-lote');
const checkboxes = document.querySelectorAll('.aluno-checkbox');

// Mantém checkboxes selecionadas
formLote.addEventListener('submit', (e) => {
  // Descobre qual botão foi clicado
  const botao = e.submitter;
  const acao = botao.dataset.acao || botao.name || 'adicionar';
  let incremento = parseInt(document.getElementById('incremento').value) || 1;

  if (botao.dataset.quantidade) {
    incremento = parseInt(botao.dataset.quantidade);
  }

  // Cria inputs ocultos para enviar os dados corretos
  const acaoInput = document.createElement('input');
  acaoInput.type = 'hidden';
  acaoInput.name = 'acao';
  acaoInput.value = acao;
  formLote.appendChild(acaoInput);

  const incInput = document.createElement('input');
  incInput.type = 'hidden';
  incInput.name = 'incremento';
  incInput.value = incremento;
  formLote.appendChild(incInput);

  // Salva checkboxes selecionadas
  const selected = [];
  checkboxes.forEach(cb => { if(cb.checked) selected.push(cb.value); });
  localStorage.setItem('alunosSelecionados', JSON.stringify(selected));
});

window.addEventListener('load', () => {
  const selected = JSON.parse(localStorage.getItem('alunosSelecionados') || '[]');
  checkboxes.forEach(cb => { cb.checked = selected.includes(cb.value); });
});

// Logout limpa os checkboxes
const btnLogout = document.getElementById('btn-logout');
btnLogout.addEventListener('click', () => {
  localStorage.removeItem('alunosSelecionados');
});

// Filtro por contrato
const tabela = document.getElementById('tabela-alunos');
const filtroInput = document.getElementById('filtro-contrato');
const btnPesquisar = document.getElementById('btn-pesquisar');
const btnLimpar = document.getElementById('btn-limpar');

btnPesquisar.addEventListener('click', () => {
  const filtro = filtroInput.value.trim();
  const linhas = tabela.querySelectorAll('tr');
  linhas.forEach((linha, index) => {
    if (index === 0) return; // cabeçalho
    const contrato = linha.querySelector('.col-contrato').innerText;
    linha.style.display = contrato.includes(filtro) ? '' : 'none';
  });
});

btnLimpar.addEventListener('click', () => {
  filtroInput.value = '';
  const linhas = tabela.querySelectorAll('tr');
  linhas.forEach((linha) => linha.style.display = '');
});

document.addEventListener("DOMContentLoaded", () => {
  const filtroInput = document.getElementById("filtro-contrato");
  const btnPesquisar = document.getElementById("btn-pesquisar");
  const btnLimpar = document.getElementById("btn-limpar");
  const tabela = document.getElementById("tabela-alunos");

  // Pesquisa simples por contrato
  btnPesquisar.addEventListener("click", () => {
    const filtro = filtroInput.value.trim();
    Array.from(tabela.rows).forEach((row, index) => {
      if (index === 0) return; // cabeçalho
      const contrato = row.querySelector(".col-contrato").innerText;
      row.style.display = contrato.includes(filtro) ? "" : "none";
    });
  });

  btnLimpar.addEventListener("click", () => {
    filtroInput.value = "";
    Array.from(tabela.rows).forEach((row, index) => {
      if (index === 0) return;
      row.style.display = "";
    });
  });

  // Botões rápidos de adicionar/remover pontos
  document.querySelectorAll(".btn-rapido").forEach(btn => {
    btn.addEventListener("click", () => {
      const acao = btn.dataset.acao;
      const valor = parseInt(btn.dataset.valor);
      const form = document.getElementById("form-lote");
      const incrementoInput = document.getElementById("incremento");

      incrementoInput.value = valor;

      // Ajusta o form action para adicionar ou remover
      if (acao === "remover") {
        form.action = "/admin/alterar-pontos-lote?acao=remover";
      } else {
        form.action = "/admin/alterar-pontos-lote";
      }

      form.submit();
    });
  });
});

document.querySelectorAll(".btn-lote").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault(); // evita envio automático

    const acao = btn.dataset.acao;
    const form = document.getElementById("form-lote");

    if (acao === "remover") {
      form.action = "/admin/alterar-pontos-lote?acao=remover";
    } else {
      form.action = "/admin/alterar-pontos-lote";
    }

    form.submit(); // envia o formulário após ajustar a rota
  });
});

