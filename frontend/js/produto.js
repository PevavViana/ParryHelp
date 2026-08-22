const shellProduto = document.querySelector("[data-product-shell]");
const produtoId = new URLSearchParams(location.search).get("id");

let avaliacoesAtuais = [];

function calcularMedia(avaliacoes) {
    if (avaliacoes.length === 0) return 0;

    const total = avaliacoes.reduce((soma, avaliacao) => soma + Number(avaliacao.nota), 0);
    return total / avaliacoes.length;
}

function dataParaApi(dataInputValue) {
    const [ano, mes, dia] = dataInputValue.split("-");
    return `${dia}-${mes}-${ano}`;
}

function renderizarProduto(produto, categoria, avaliacoes, nomesPorUsuario) {
    const media = calcularMedia(avaliacoes);
    const usuario = Taxatio.getUsuarioLogado();

    avaliacoesAtuais = avaliacoes;

    shellProduto.innerHTML = `
        <div class="detail-grid">
            <section>
                <div class="product-hero">
                    <div class="product-visual">□</div>
                    <div class="product-info">
                        <p class="eyebrow">${categoria.nome}</p>
                        <h1>${produto.nome}</h1>
                        <div class="rating">★★★★★ <span>${media.toFixed(1)}/10 · ${avaliacoes.length} avaliações</span></div>
                        <p class="price-label">Produto avaliado pela comunidade</p>
                        <p class="muted">${produto.descricao}</p>
                        <div class="tags">
                            <span class="tag tag-blue">${categoria.nome}</span>
                            <span class="tag tag-blue">${avaliacoes.length} avaliações</span>
                        </div>
                        <button class="btn btn-primary" data-open-auth data-auth-mode="review">Avaliar este produto</button>
                    </div>
                </div>

                <section class="ai-panel" data-ai-review-panel>
                    <div>
                        <p class="eyebrow">Assistente de avaliações</p>
                        <h2>O que dizem os compradores?</h2>
                        <p data-ai-review>Gere um resumo das avaliações mais relevantes deste produto.</p>
                    </div>
                    <button class="btn btn-primary" type="button" data-ai-review-button>Gerar resumo</button>
                </section>

                <section class="review-section">
                    <h2>Últimas avaliações</h2>
                    <div>
                        ${avaliacoes.length ? avaliacoes.map((avaliacao) => {
                            const ehDoUsuario = usuario && Number(avaliacao.usuario_id) === Number(usuario.id);
                            const nomeAutor = nomesPorUsuario[avaliacao.usuario_id] || "Usuário";
                            return `
                                <article class="review-item" data-avaliacao-id="${avaliacao.id}">
                                    <div class="review-head">
                                        <strong>${nomeAutor}</strong>
                                        <span>Nota ${avaliacao.nota}/10 · ${avaliacao.data}</span>
                                    </div>
                                    <p>${avaliacao.titulo}: ${avaliacao.descricao}</p>
                                    ${ehDoUsuario ? `
                                        <div class="review-actions">
                                            <button type="button" class="btn btn-outline" data-editar-avaliacao="${avaliacao.id}">Editar</button>
                                            <button type="button" class="btn btn-outline" data-excluir-avaliacao="${avaliacao.id}">Excluir</button>
                                        </div>
                                    ` : ""}
                                </article>
                            `;
                        }).join("") : '<div class="empty">Este produto ainda não possui avaliações.</div>'}
                    </div>
                </section>
            </section>

            <aside>
                <section class="detail-panel">
                    <h2>Resumo</h2>
                    <dl>
                        <div><dt>Categoria</dt><dd>${categoria.nome}</dd></div>
                        <div><dt>Nota geral</dt><dd>${media.toFixed(1)}/10</dd></div>
                        <div><dt>Avaliações</dt><dd>${avaliacoes.length}</dd></div>
                    </dl>
                </section>
            </aside>
        </div>
    `;

    document.querySelector("[data-ai-review-button]").addEventListener("click", gerarResumoAvaliacoes);
}

async function gerarResumoAvaliacoes() {
    const botao = document.querySelector("[data-ai-review-button]");
    const resumo = document.querySelector("[data-ai-review]");

    botao.disabled = true;
    botao.textContent = "Gerando...";

    try {
        const dados = await Taxatio.apiFetch("/api/tutoria", {
            method: "POST",
            body: JSON.stringify({
                tipo: "avaliacoes_relevantes",
                produto_id: Number(produtoId),
                limite: 10,
            }),
        });
        resumo.textContent = dados.resumo;
    } catch (erro) {
        resumo.textContent = erro.message;
        Taxatio.mostrarMensagem(erro.message, true);
    } finally {
        botao.disabled = false;
        botao.textContent = "Gerar resumo";
    }
}

function abrirFormularioAvaliacao(usuario) {
    const existente = document.querySelector("[data-review-form]");
    if (existente) {
        existente.remove();
        return;
    }

    const form = document.createElement("form");
    form.className = "review-form";
    form.setAttribute("data-review-form", "");
    form.innerHTML = `
        <input type="text" name="titulo" placeholder="Título" required>
        <textarea name="descricao" placeholder="Comentário" required></textarea>
        <input type="number" name="nota" placeholder="Nota (0 a 10)" min="0" max="10" step="0.1" required>
        <input type="date" name="data" required>
        <button type="submit" class="btn btn-primary">Enviar avaliação</button>
    `;

    document.querySelector(".product-hero").after(form);

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const dados = new FormData(form);

        try {
            await Taxatio.apiFetch(`/usuarios/${usuario.id}/avaliacoes`, {
                method: "POST",
                body: JSON.stringify({
                    produto_id: Number(produtoId),
                    titulo: dados.get("titulo"),
                    descricao: dados.get("descricao"),
                    nota: Number(dados.get("nota")),
                    data: dataParaApi(dados.get("data")),
                }),
            });
            Taxatio.mostrarMensagem("Avaliação enviada!");
            form.remove();
            carregarProduto();
        } catch (erro) {
            Taxatio.mostrarMensagem(erro.message, true);
        }
    });
}

function abrirFormularioEdicao(avaliacao) {
    const existente = document.querySelector("[data-review-form]");
    if (existente) existente.remove();

    const artigo = document.querySelector(`[data-avaliacao-id="${avaliacao.id}"]`);

    const form = document.createElement("form");
    form.className = "review-form";
    form.setAttribute("data-review-form", "");
    form.innerHTML = `
        <input type="text" name="titulo" value="${avaliacao.titulo}" required>
        <textarea name="descricao" required>${avaliacao.descricao}</textarea>
        <input type="number" name="nota" value="${avaliacao.nota}" min="0" max="10" step="0.1" required>
        <input type="date" name="data" value="${avaliacao.data}" required>
        <button type="submit" class="btn btn-primary">Salvar alterações</button>
    `;

    artigo.after(form);

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const dados = new FormData(form);

        try {
            await Taxatio.apiFetch(`/avaliacoes/${avaliacao.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    titulo: dados.get("titulo"),
                    descricao: dados.get("descricao"),
                    nota: Number(dados.get("nota")),
                    data: dataParaApi(dados.get("data")),
                }),
            });
            Taxatio.mostrarMensagem("Avaliação atualizada!");
            form.remove();
            carregarProduto();
        } catch (erro) {
            Taxatio.mostrarMensagem(erro.message, true);
        }
    });
}

async function excluirAvaliacao(avaliacaoId) {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;

    try {
        await Taxatio.apiFetch(`/avaliacoes/${avaliacaoId}`, { method: "DELETE" });
        Taxatio.mostrarMensagem("Avaliação excluída.");
        carregarProduto();
    } catch (erro) {
        Taxatio.mostrarMensagem(erro.message, true);
    }
}

document.addEventListener("click", (evento) => {
    const botaoAvaliar = evento.target.closest('[data-auth-mode="review"]');
    if (botaoAvaliar) {
        const usuario = Taxatio.getUsuarioLogado();
        if (!usuario) {
            Taxatio.abrirAutenticacao("login");
            return;
        }
        abrirFormularioAvaliacao(usuario);
        return;
    }

    const botaoEditar = evento.target.closest("[data-editar-avaliacao]");
    if (botaoEditar) {
        const id = Number(botaoEditar.dataset.editarAvaliacao);
        const avaliacao = avaliacoesAtuais.find((item) => item.id === id);
        if (avaliacao) abrirFormularioEdicao(avaliacao);
        return;
    }

    const botaoExcluir = evento.target.closest("[data-excluir-avaliacao]");
    if (botaoExcluir) {
        excluirAvaliacao(botaoExcluir.dataset.excluirAvaliacao);
    }
});

document.addEventListener("taxatio:login", (evento) => {
    const botaoAvaliar = document.querySelector('[data-auth-mode="review"]');
    if (botaoAvaliar) {
        abrirFormularioAvaliacao(evento.detail);
    }
});

async function carregarProduto() {
    if (!produtoId) {
        shellProduto.innerHTML = '<div class="empty">Produto não informado.</div>';
        return;
    }

    try {
        const produto = await Taxatio.apiFetch(`/produtos/${produtoId}`);
        const categorias = await Taxatio.apiFetch("/categorias");
        const avaliacoes = await Taxatio.apiFetch("/avaliacoes");
        const usuarios = await Taxatio.apiFetch("/usuarios");

        const categoria = categorias.find((item) => item.id === produto.categoria_id) || { nome: "Sem categoria" };
        const avaliacoesDoProduto = avaliacoes.filter((item) => item.produto_id === Number(produtoId));

        const nomesPorUsuario = Object.fromEntries(
            usuarios.map((usuario) => [usuario.id, usuario.nome])
        );

        renderizarProduto(produto, categoria, avaliacoesDoProduto, nomesPorUsuario);
    } catch (erro) {
        shellProduto.innerHTML = `<div class="empty">${erro.message} Verifique se a API está rodando.</div>`;
        Taxatio.mostrarMensagem(erro.message, true);
    }
}

carregarProduto();