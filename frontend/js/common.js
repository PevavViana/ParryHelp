const API_URL = "http://127.0.0.1:5000";

const modal = document.querySelector("[data-auth-modal]");
const toast = document.querySelector("[data-toast]");
const registerFields = document.querySelectorAll("[data-register-field]");
const title = document.querySelector("#auth-title");

async function apiFetch(path, options = {}) {
    const resposta = await fetch(`${API_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    const texto = await resposta.text();
    const dados = texto ? JSON.parse(texto) : null;

    if (!resposta.ok) {
        throw new Error(dados?.erro || "Não foi possível concluir a operação.");
    }

    return dados;
}

function mostrarMensagem(texto, erro = false) {
    if (!toast) return;

    toast.textContent = texto;
    toast.style.borderColor = erro ? "var(--red)" : "var(--line)";
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 3000);
}

function definirModoAutenticacao(modo) {
    const cadastro = modo === "register";

    document.querySelectorAll("[data-auth-tab]").forEach((aba) => {
        aba.classList.toggle("active", aba.dataset.authTab === modo);
    });

    registerFields.forEach((campo) => {
        campo.style.display = cadastro ? "grid" : "none";
    });

    if (title) {
        title.textContent = cadastro ? "Crie sua conta" : "Acesse sua conta";
    }
}

function abrirAutenticacao(modo = "login") {
    if (!modal) return;

    definirModoAutenticacao(modo);
    modal.classList.add("open");
}

function fecharAutenticacao() {
    modal?.classList.remove("open");
}

function getUsuarioLogado() {
    const bruto = localStorage.getItem("taxatio_usuario");
    return bruto ? JSON.parse(bruto) : null;
}

function sair() {
    localStorage.removeItem("taxatio_usuario");
    atualizarStatusAuth();
    mostrarMensagem("Você saiu da sua conta.");
}

function atualizarStatusAuth() {
    const usuario = getUsuarioLogado();

    const botaoEntrar = document.querySelector('[data-open-auth][data-auth-mode="login"]');
    const statusLogado = document.querySelector("[data-auth-status]");
    const botaoSair = document.querySelector("[data-logout]");

    if (usuario) {
        if (botaoEntrar) botaoEntrar.style.display = "none";
        if (statusLogado) {
            statusLogado.style.display = "inline-flex";
            statusLogado.textContent = `Olá, ${usuario.nome.split(" ")[0]}`;
        }
        if (botaoSair) botaoSair.style.display = "inline-flex";
    } else {
        if (botaoEntrar) botaoEntrar.style.display = "";
        if (statusLogado) statusLogado.style.display = "none";
        if (botaoSair) botaoSair.style.display = "none";
    }
}

window.Taxatio = {
    API_URL,
    apiFetch,
    mostrarMensagem,
    abrirAutenticacao,
    fecharAutenticacao,
    getUsuarioLogado,
    atualizarStatusAuth,
    sair,
};

document.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-open-auth]");
    if (!botao) return;

    if (botao.dataset.authMode === "review") {
        return;
    }

    abrirAutenticacao(botao.dataset.authMode || "login");
});

document.querySelectorAll("[data-close-modal]").forEach((botao) => {
    botao.addEventListener("click", fecharAutenticacao);
});

document.querySelectorAll("[data-auth-tab]").forEach((aba) => {
    aba.addEventListener("click", () => definirModoAutenticacao(aba.dataset.authTab));
});

modal?.addEventListener("click", (evento) => {
    if (evento.target === modal) fecharAutenticacao();
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharAutenticacao();
});

document.querySelector("[data-logout]")?.addEventListener("click", sair);

document.querySelector("[data-auth-form]")?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const formulario = new FormData(evento.target);
    const cadastro = document.querySelector("[data-auth-tab].active")?.dataset.authTab === "register";
    const dados = cadastro
        ? {
            nome: formulario.get("nome"),
            email: formulario.get("email"),
            senha: formulario.get("senha"),
            cpf: formulario.get("cpf"),
        }
        : {
            email: formulario.get("email"),
            senha: formulario.get("senha"),
        };

    try {
        const usuario = await apiFetch(cadastro ? "/usuarios" : "/usuarios/login", {
            method: "POST",
            body: JSON.stringify(dados),
        });

        localStorage.setItem("taxatio_usuario", JSON.stringify(usuario));
        evento.target.reset();
        fecharAutenticacao();
        mostrarMensagem(cadastro ? "Cadastro realizado com sucesso." : `Olá, ${usuario.nome}!`);
        atualizarStatusAuth();
        document.dispatchEvent(new CustomEvent("taxatio:login", { detail: usuario }));
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    }
});

document.querySelectorAll("[data-search-form]").forEach((formulario) => {
    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        const busca = new FormData(formulario).get("q")?.trim() || "";
        const query = busca ? `?q=${encodeURIComponent(busca)}` : "";

        window.location.href = `avaliacoes.html${query}`;
    });
});

atualizarStatusAuth();