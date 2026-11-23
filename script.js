
// ==========================================
// ESCOLA EM ALERTA - SISTEMA MVP
// ==========================================

// BANCO DE DADOS LOCAL

let faltas = JSON.parse(
    localStorage.getItem("faltas_escola") || "[]"
);

let ocorrencias = JSON.parse(
    localStorage.getItem("agua_escola") || "[]"
);

// SALVAR DADOS

function salvarDados() {
    localStorage.setItem(
        "faltas_escola",
        JSON.stringify(faltas)
    );

    localStorage.setItem(
        "agua_escola",
        JSON.stringify(ocorrencias)
    );
}

// PROTEÇÃO DE TEXTO EXIBIDO NAS TABELAS

function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

// NAVEGAÇÃO ENTRE TELAS

function mostrarSecao(id) {
    document.querySelectorAll(".secao").forEach(secao => {
        secao.classList.add("escondido");
    });

    document.getElementById(id).classList.remove("escondido");
}

// REGISTRAR FALTA

document.getElementById("formFalta")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const aluno = document.getElementById("aluno").value.trim();
    const turma = document.getElementById("turma").value.trim();
    const data = document.getElementById("dataFalta").value;
    const motivo = document.getElementById("motivo").value;

    if (!aluno || !turma || !data || !motivo) {
        alert("Preencha todos os campos!");
        return;
    }

    faltas.push({
        id: crypto.randomUUID(),
        aluno,
        turma,
        data,
        motivo
    });

    salvarDados();

    this.reset();

    atualizarSistema();

    alert("Falta registrada com sucesso!");
});

// REGISTRAR FALTA DE ÁGUA

document.getElementById("formAgua")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const local = document.getElementById("local").value;
    const data = document.getElementById("dataAgua").value;
    const descricao = document.getElementById("descricao").value.trim();

    if (!local || !data || !descricao) {
        alert("Preencha todos os campos!");
        return;
    }

    ocorrencias.push({
        id: crypto.randomUUID(),
        local,
        data,
        descricao,
        status: "Pendente"
    });

    salvarDados();

    this.reset();

    atualizarSistema();

    alert("Ocorrência registrada com sucesso!");
});

// EXIBIR FALTAS

function renderizarFaltas() {

    const tabela = document.getElementById("listaFaltas");

    tabela.innerHTML = "";

    faltas.forEach(falta => {

        tabela.innerHTML += `
            <tr>
                <td>${escapar(falta.aluno)}</td>
                <td>${escapar(falta.turma)}</td>
                <td>${escapar(falta.data)}</td>
                <td>${escapar(falta.motivo)}</td>
                <td>
                    <button class="btn-excluir"
                        data-acao="excluir-falta"
                        data-id="${escapar(falta.id)}">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });

    if (faltas.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma falta registrada.</td>
            </tr>
        `;
    }
}

// EXIBIR OCORRÊNCIAS DE ÁGUA

function renderizarAgua() {

    const tabela = document.getElementById("listaAgua");

    tabela.innerHTML = "";

    ocorrencias.forEach(ocorrencia => {

        tabela.innerHTML += `
            <tr>
                <td>${escapar(ocorrencia.local)}</td>
                <td>${escapar(ocorrencia.data)}</td>
                <td>${escapar(ocorrencia.descricao)}</td>
                <td>${escapar(ocorrencia.status)}</td>
                <td>
                    ${
                        ocorrencia.status === "Pendente"
                        ? `<button class="btn-concluir"
                            data-acao="concluir"
                            data-id="${escapar(ocorrencia.id)}">
                            Resolver
                           </button>`
                        : ""
                    }

                    <button class="btn-excluir"
                        data-acao="excluir-agua"
                        data-id="${escapar(ocorrencia.id)}">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });

    if (ocorrencias.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5">Nenhuma ocorrência registrada.</td>
            </tr>
        `;
    }
}

// AÇÕES DAS TABELAS

document.addEventListener("click", function(event) {

    const botao = event.target.closest("button[data-acao]");

    if (!botao) return;

    const id = botao.dataset.id;
    const acao = botao.dataset.acao;

    if (acao === "excluir-falta") {

        if (!confirm("Deseja excluir este registro?")) return;

        faltas = faltas.filter(item => item.id !== id);

    } else if (acao === "excluir-agua") {

        if (!confirm("Deseja excluir esta ocorrência?")) return;

        ocorrencias = ocorrencias.filter(item => item.id !== id);

    } else if (acao === "concluir") {

        const item = ocorrencias.find(item => item.id === id);

        if (item) {
            item.status = "Resolvido";
        }
    }

    salvarDados();

    atualizarSistema();
});

// ATUALIZAR INDICADORES

function atualizarIndicadores() {

    document.getElementById("totalFaltas")
        .textContent = faltas.length;

    document.getElementById("totalAgua")
        .textContent = ocorrencias.length;

    const pendentes = ocorrencias.filter(
        item => item.status === "Pendente"
    ).length;

    document.getElementById("totalPendentes")
        .textContent = pendentes;
}

// HISTÓRICO GERAL

function renderizarHistorico() {

    const historico = document.getElementById("listaHistorico");

    historico.innerHTML = "";

    const registros = [
        ...faltas.map(item => ({
            tipo: "Falta de aluno",
            descricao: `${item.aluno} - ${item.turma}`,
            data: item.data,
            detalhe: item.motivo
        })),

        ...ocorrencias.map(item => ({
            tipo: "Falta de água",
            descricao: item.local,
            data: item.data,
            detalhe: `${item.descricao} | Status: ${item.status}`
        }))
    ];

    registros.sort((a, b) => b.data.localeCompare(a.data));

    if (registros.length === 0) {
        historico.textContent = "Nenhum registro encontrado.";
        return;
    }

    registros.forEach(item => {

        historico.innerHTML += `
            <div class="registro">
                <strong>${escapar(item.tipo)}</strong>
                <p>${escapar(item.descricao)}</p>
                <p>Data: ${escapar(item.data)}</p>
                <p>${escapar(item.detalhe)}</p>
            </div>
        `;
    });
}

// ATUALIZAÇÃO GERAL

function atualizarSistema() {

    renderizarFaltas();

    renderizarAgua();

    atualizarIndicadores();

    renderizarHistorico();
}

// INICIALIZAÇÃO DO SISTEMA

atualizarSistema();

// PREENCHER DATA ATUAL NOS FORMULÁRIOS

const hoje = new Date();
const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");

const dataAtual = `${ano}-${mes}-${dia}`;

document.getElementById("dataFalta").value = dataAtual;
document.getElementById("dataAgua").value = dataAtual;
