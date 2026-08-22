const listaProdutos = document.querySelector("[data-product-list]");
const filtrosCategorias = document.querySelector("[data-category-filters]");
const filtrosNotas = document.querySelector("[data-rating-filters]");
const listaAvaliados = document.querySelector("[data-reported-list]");
const statusBusca = document.querySelector("[data-search-status]");
const resumoProdutos = document.querySelector("[data-ai-products]");
const botaoResumoProdutos = document.querySelector("[data-ai-products-button]");

const estado = {
    produtos: [],
    categorias: [],
    avaliacoes: [],
    categoria: "",
    nota: "all",
    busca: new URLSearchParams(location.search).get("q") || "",
};

const filtrosNota = [
    { id: "all", label: "Qualquer nota", min: 0 },
    { id: "high", label: "7 ou mais", min: 7 },
    { id: "middle", label: "5 a 6.9", min: 5, max: 6.9 },
    { id: "low", label: "Abaixo de 5", min: 0, max: 4.9 },
];

function nomeCategoria(categoriaId) {
    const categoria = estado.categorias.find((item) => item.id === categoriaId);
    return categoria ? categoria.nome : "Sem categoria";
}

function avaliacoesDoProduto(produtoId) {
    return estado.avaliacoes.filter((avaliacao) => avaliacao.produto_id === produtoId);
}

function mediaDoProduto(produto) {
    const avaliacoes = avaliacoesDoProduto(produto.id);

    if (avaliacoes.length === 0) return Number(produto.media_notas || 0);

    const total = avaliacoes.reduce((soma, avaliacao) => soma + Number(avaliacao.nota), 0);
    return total / avaliacoes.length;
}

function produtosFiltrados() {
    const filtro = filtrosNota.find((item) => item.id === estado.nota);

    return estado.produtos.filter((produto) => {
        const categoria = nomeCategoria(produto.categoria_id);
        const texto = `${produto.nome} ${produto.descricao} ${categoria}`.toLowerCase();
        const media = mediaDoProduto(produto);
        const correspondeBusca = !estado.busca || texto.includes(estado.busca.toLowerCase());
        const correspondeCategoria = !estado.categoria || String(produto.categoria_id) === estado.categoria;
        const correspondeNota = media >= filtro.min && (filtro.max === undefined || media <= filtro.max);

        return correspondeBusca && correspondeCategoria && correspondeNota;
    });
}

function renderizarStatusBusca() {
    if (!statusBusca) return;

    if (!estado.busca) {
        statusBusca.innerHTML = "";
        statusBusca.classList.remove("show");
        return;
    }

    statusBusca.innerHTML = `<span>Pesquisou por: <strong>${estado.busca}</strong></span><button type="button" data-clear-search aria-label="Limpar pesquisa">×</button>`;
    statusBusca.classList.add("show");
    statusBusca.querySelector("[data-clear-search]").addEventListener("click", () => {
        window.location.href = "avaliacoes.html";
    });
}

function renderizarFiltros() {
    const categorias = [["", "Todas"], ...estado.categorias.map((categoria) => [String(categoria.id), categoria.nome])];

    filtrosCategorias.innerHTML = categorias.map(([id, nome]) => {
        const quantidade = id
            ? estado.produtos.filter((produto) => String(produto.categoria_id) === id).length
            : estado.produtos.length;

        return `<li><button class="filter-button ${estado.categoria === id ? "active" : ""}" data-category="${id}">${nome}<span class="filter-count">${quantidade}</span></button></li>`;
    }).join("");

    filtrosNotas.innerHTML = filtrosNota.map((filtro) => `
        <li>
            <button class="filter-button ${estado.nota === filtro.id ? "active" : ""}" data-rating="${filtro.id}">
                ${filtro.label}
            </button>
        </li>
    `).join("");

    filtrosCategorias.querySelectorAll("[data-category]").forEach((botao) => {
        botao.addEventListener("click", () => {
            estado.categoria = botao.dataset.category;
            renderizarTela();
        });
    });

    filtrosNotas.querySelectorAll("[data-rating]").forEach((botao) => {
        botao.addEventListener("click", () => {
            estado.nota = botao.dataset.rating;
            renderizarTela();
        });
    });
}

function renderizarProdutos() {
    const produtos = produtosFiltrados();

    if (produtos.length === 0) {
        listaProdutos.innerHTML = '<div class="empty">Nenhum produto encontrado.</div>';
        return;
    }

    listaProdutos.innerHTML = produtos.map((produto) => {
        const media = mediaDoProduto(produto);
        const avaliacoes = avaliacoesDoProduto(produto.id);

        return `
            <article class="product-card">
                <div class="product-icon">□</div>
                <div>
                    <h2>${produto.nome}</h2>
                    <div class="product-meta">${nomeCategoria(produto.categoria_id)}</div>
                    <div class="tags"><span class="tag tag-blue">${avaliacoes.length} avaliações</span></div>
                    <p class="product-excerpt">${produto.descricao}</p>
                </div>
                <div class="score">
                    <strong>${media.toFixed(1)}</strong>
                    <small>/10 · ${avaliacoes.length} avaliações</small>
                    <div class="score-bar"><span style="width: ${Math.min(media * 10, 100)}%"></span></div>
                    <a href="produto.html?id=${produto.id}">Ver produto →</a>
                </div>
            </article>
        `;
    }).join("");
}

function renderizarAvaliados() {
    const produtos = [...estado.produtos]
        .sort((a, b) => avaliacoesDoProduto(b.id).length - avaliacoesDoProduto(a.id).length)
        .slice(0, 5);

    listaAvaliados.innerHTML = produtos.map((produto) => `
        <li>
            <span>${produto.nome}</span>
            <strong>${avaliacoesDoProduto(produto.id).length} avaliações</strong>
        </li>
    `).join("");
}

function renderizarTela() {
    renderizarStatusBusca();
    renderizarFiltros();
    renderizarProdutos();
    renderizarAvaliados();
}

async function gerarResumoProdutos() {
    botaoResumoProdutos.disabled = true;
    botaoResumoProdutos.textContent = "Gerando...";

    try {
        const dados = await Taxatio.apiFetch("/api/tutoria", {
            method: "POST",
            body: JSON.stringify({ tipo: "produtos_em_alta", limite: 5 }),
        });
        resumoProdutos.textContent = dados.resumo;
    } catch (erro) {
        resumoProdutos.textContent = erro.message;
        Taxatio.mostrarMensagem(erro.message, true);
    } finally {
        botaoResumoProdutos.disabled = false;
        botaoResumoProdutos.textContent = "Gerar resumo";
    }
}

async function listarDados() {
    try {
        const categorias = await Taxatio.apiFetch("/categorias");
        const produtos = await Taxatio.apiFetch("/produtos");
        const avaliacoes = await Taxatio.apiFetch("/avaliacoes");

        estado.categorias = categorias;
        estado.produtos = produtos;
        estado.avaliacoes = avaliacoes;
        renderizarTela();
    } catch (erro) {
        listaProdutos.innerHTML = `<div class="empty">${erro.message} Verifique se a API está rodando.</div>`;
        Taxatio.mostrarMensagem(erro.message, true);
    }
}

botaoResumoProdutos?.addEventListener("click", gerarResumoProdutos);
listarDados();
