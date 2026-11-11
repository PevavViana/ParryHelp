(() => {
  "use strict";
  const API_URL =
    window.PARRY_HELP_API_URL ||
    window.TAXATIO_API_URL ||
    "http://127.0.0.1:5000";
  const escapeHTML = (value = "") =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  const storedUser = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("taxatio_usuario") || "null",
      );
      return user && Number.isFinite(Number(user.id)) ? user : null;
    } catch {
      localStorage.removeItem("taxatio_usuario");
      return null;
    }
  };
  async function apiFetch(path, options = {}) {
    let response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...(options.body
            ? {
                "Content-Type": "application/json",
              }
            : {}),
          ...(options.headers || {}),
        },
      });
    } catch {
      throw new Error(
        "Não foi possível conectar ao Parry Help. Confira se a API está disponível e tente novamente.",
      );
    }
    const raw = await response.text();
    let data = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        if (response.ok)
          throw new Error("A API retornou uma resposta inválida.");
      }
    }
    if (!response.ok)
      throw new Error(
        data?.erro ||
          `Não foi possível concluir a operação (${response.status}).`,
      );
    return data;
  }
  const headerRoot = document.querySelector("[data-site-header]");
  if (headerRoot)
    headerRoot.innerHTML = `<header class="site-header">
        <div class="header-inner wrap">
        <a class="brand" href="index.html" aria-label="Parry Help, página inicial">
        <img src="assets/logo.png" alt="">
        <span>Parry Help</span>
        </a>
        <form class="header-search" data-search-form>
        <label class="sr-only" for="header-query">Buscar produto ou categoria</label>
        <input id="header-query" name="q" type="search" placeholder="Buscar produtos">
        <button aria-label="Buscar">↗</button>
        </form>
        <nav class="main-nav" aria-label="Navegação principal">
        <a href="catalogo.html">Explorar</a>
        <a href="comparar.html">Comparar</a>
        </nav>
        <div class="header-tools">
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Alternar tema" title="Alternar tema">
        <span aria-hidden="true">◐</span>
        </button>
        <button class="button button-small button-quiet" type="button" data-open-auth data-auth-mode="login">Entrar</button>
        <a class="button button-small button-quiet account-link" href="conta.html" hidden>Minha conta</a>
        <button class="button button-small button-primary" type="button" data-open-auth data-auth-mode="register">Criar conta</button>
        <button class="button button-small button-quiet" type="button" data-logout hidden>Sair</button>
        <button class="mobile-menu" data-mobile-menu aria-expanded="false" aria-label="Abrir navegação">☰</button>
        </div>
        </div>
        <nav class="mobile-nav wrap" data-mobile-nav hidden>
        <form class="mobile-search" data-search-form>
        <label class="sr-only" for="mobile-query">Buscar produto ou categoria</label>
        <input id="mobile-query" name="q" type="search" placeholder="Buscar produtos">
        <button class="button button-primary" aria-label="Buscar">Buscar ↗</button>
        </form>
        <a href="catalogo.html">Explorar</a>
        <a href="comparar.html">Comparar produtos</a>
        <a href="conta.html">Minha conta</a>
        <button class="quiet-button" type="button" data-open-auth data-auth-mode="login">Entrar</button>
        <button class="quiet-button" type="button" data-open-auth data-auth-mode="register">Criar conta</button>
        <button class="quiet-button" type="button" data-logout hidden>Sair</button>
        </nav>
        </header>`;
  const uiRoot = document.querySelector("[data-global-ui]");
  if (uiRoot)
    uiRoot.innerHTML = `<div class="modal-backdrop" data-auth-modal hidden>
        <section class="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-description" tabindex="-1">
        <button class="modal-close" type="button" data-close-modal aria-label="Fechar janela">×</button>
        <p class="auth-kicker">Sua conta Parry Help</p>
        <h2 id="auth-title">Entre na conversa.</h2>
        <p id="auth-description" data-auth-description>Acompanhe suas avaliações e ajude outras pessoas a escolher.</p>
        <div class="modal-tabs" role="tablist" aria-label="Acesso à conta">
        <button type="button" role="tab" id="auth-tab-login" aria-controls="auth-form" data-auth-tab="login">Entrar</button>
        <button type="button" role="tab" id="auth-tab-register" aria-controls="auth-form" data-auth-tab="register">Criar conta</button>
        </div>
        <form class="modal-form" id="auth-form" data-auth-form novalidate>
        <div class="field-wrap" data-register-field>
        <label for="auth-name">Nome</label>
        <input id="auth-name" name="nome" autocomplete="name" maxlength="40">
        <span class="field-error" data-error="nome">
        </span>
        </div>
        <div class="field-wrap" data-register-field>
        <label for="auth-cpf">CPF</label>
        <input id="auth-cpf" name="cpf" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="000.000.000-00">
        <span class="field-error" data-error="cpf">
        </span>
        </div>
        <div class="field-wrap">
        <label for="auth-email">E-mail</label>
        <input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="120">
        <span class="field-error" data-error="email">
        </span>
        </div>
        <div class="field-wrap">
        <label for="auth-password">Senha</label>
        <input id="auth-password" name="senha" type="password" autocomplete="current-password" required>
        <span class="field-error" data-error="senha">
        </span>
        </div>
        <div class="terms-acceptance" data-register-field hidden>
        <label class="terms-check" for="auth-accept-terms">
        <input id="auth-accept-terms" name="aceita_termos" type="checkbox" value="1">
        <span>Li e aceito os Termos de Uso.</span>
        </label>
        <button class="terms-inline-link" type="button" data-open-terms data-terms-document="uso">Ler Termos de Uso</button>
        <span class="field-error" data-error="aceita_termos"></span>
        </div>
        <div class="terms-acceptance" data-register-field hidden>
        <label class="terms-check" for="auth-accept-consent">
        <input id="auth-accept-consent" name="consentiu_dados" type="checkbox" value="1">
        <span>Li e dou consentimento para o tratamento dos meus dados pessoais.</span>
        </label>
        <button class="terms-inline-link" type="button" data-open-terms data-terms-document="consentimento">Ler Termo de Consentimento</button>
        <span class="field-error" data-error="consentiu_dados"></span>
        </div>
        <p class="form-error" data-form-error role="alert">
        </p>
        <button class="button button-primary modal-submit" type="submit">Entrar <span aria-hidden="true">↗</span>
        </button>
        </form>
        </section>
        </div>
        <div class="modal-backdrop terms-backdrop" data-terms-modal hidden>
        <section class="modal terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title" aria-describedby="terms-description" tabindex="-1">
        <button class="modal-close" type="button" data-close-terms aria-label="Fechar termos">×</button>
        <p class="auth-kicker">Informações legais</p>
        <h2 id="terms-title">Termos e consentimento</h2>
        <p id="terms-description">Consulte os termos que regulam o uso do Parry Help e o tratamento de dados pessoais.</p>
        <div class="terms-tabs" role="tablist" aria-label="Documentos legais">
        <button type="button" role="tab" id="terms-tab-uso" aria-selected="true" data-terms-tab="uso">Termos de Uso</button>
        <button type="button" role="tab" id="terms-tab-consentimento" aria-selected="false" data-terms-tab="consentimento">Consentimento de dados</button>
        </div>
        <div class="terms-document" data-terms-content role="region" aria-labelledby="terms-tab-uso" tabindex="0" aria-live="polite">
        <p>Carregando documento…</p>
        </div>
        </section>
        </div>
        <div class="toast" data-toast role="status" aria-live="polite">
        </div>
        <div class="consent-banner" data-consent hidden>
        <p>Usamos armazenamento local para manter sua sessão e preferência de tema.</p>
        <button class="button button-small button-primary" data-consent-dismiss>Entendi</button>
        </div>`;
  document
    .querySelectorAll("[data-year]")
    .forEach((node) => (node.textContent = String(new Date().getFullYear())));
  document.querySelectorAll(".footer-nav-column").forEach((column) => {
    if (column.querySelector("h2")?.textContent.trim().toLowerCase() !== "legal") return;
    if (column.querySelector("[data-open-terms]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.openTerms = "";
    button.dataset.termsDocument = "uso";
    button.textContent = "Termos de uso e consentimento";
    column.append(button);
  });
  let toastTimer;
  const toast = document.querySelector("[data-toast]");
  function showToast(message, error = false) {
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.kind = error ? "error" : "success";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3600);
  }
  let previousFocus;
  let termsPreviousFocus;
  let termsRequest = 0;
  function validCPF(value) {
    const digits = value.replace(/\D/g, "");
    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
    const check = (length) => {
      let total = 0;
      for (let index = 0; index < length; index += 1)
        total += Number(digits[index]) * (length + 1 - index);
      const remainder = (total * 10) % 11;
      return (remainder === 10 ? 0 : remainder) === Number(digits[length]);
    };
    return check(9) && check(10);
  }
  function setAuthMode(mode) {
    const register = mode === "register";
    document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
      const active = tab.dataset.authTab === mode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });
    document.querySelectorAll("[data-register-field]").forEach((field) => {
      field.hidden = !register;
      const input = field.querySelector("input");
      input.required = register;
    });
    document.querySelector("#auth-title").textContent = register
      ? "Crie sua conta."
      : "Entre na conversa.";
    document.querySelector("[data-auth-description]").textContent = register
      ? "Uma comunidade melhor começa com a sua experiência."
      : "Acompanhe suas avaliações e ajude outras pessoas a escolher.";
    document.querySelector(".modal-submit").innerHTML = register
      ? 'Criar minha conta <span aria-hidden="true">↗</span>'
      : 'Entrar <span aria-hidden="true">↗</span>';
    document.querySelector("#auth-password").autocomplete = register
      ? "new-password"
      : "current-password";
    document.querySelectorAll("[data-error]").forEach((node) => {
      node.textContent = "";
      node.parentElement.querySelector("input")?.removeAttribute("aria-invalid");
    });
    document.querySelector("[data-form-error]").textContent = "";
  }
  function openAuth(mode = "login") {
    const modal = document.querySelector("[data-auth-modal]");
    if (!modal) return;
    previousFocus = document.activeElement;
    setAuthMode(mode);
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    modal.style.display = "grid";
    document.body.classList.add("modal-open");
    [...modal.querySelectorAll("input:not([type=hidden]):not([disabled])")]
      .find((input) => input.offsetParent !== null)
      ?.focus();
  }
  function closeAuth() {
    const modal = document.querySelector("[data-auth-modal]");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    previousFocus?.focus?.();
  }
  function renderTerms(markdown) {
    const content = document.querySelector("[data-terms-content]");
    if (!content) return;
    content.replaceChildren();
    let list = null;
    for (const rawLine of markdown.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) {
        list = null;
        continue;
      }
      const heading = line.match(/^#{1,3}\s+(.*)$/) ||
        (line.startsWith("CLÁUSULA ") || line.startsWith("TERMO ") ? [line, line] : null);
      if (heading) {
        list = null;
        const node = document.createElement("h3");
        node.textContent = heading[1];
        content.append(node);
        continue;
      }
      const bullet = line.match(/^\*\s+(.*)$/);
      const numbered = line.match(/^\d+\.\s+(.*)$/);
      if (bullet || numbered) {
        const kind = bullet ? "ul" : "ol";
        if (!list || list.tagName.toLowerCase() !== kind) {
          list = document.createElement(kind);
          content.append(list);
        }
        const item = document.createElement("li");
        item.textContent = (bullet || numbered)[1];
        list.append(item);
        continue;
      }
      list = null;
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      content.append(paragraph);
    }
  }
  async function selectTerms(documentName) {
    const name = documentName === "consentimento" ? "consentimento" : "uso";
    const modal = document.querySelector("[data-terms-modal]");
    const content = modal?.querySelector("[data-terms-content]");
    if (!modal || !content) return;
    modal.dataset.activeDocument = name;
    modal.querySelectorAll("[data-terms-tab]").forEach((tab) => {
      const active = tab.dataset.termsTab === name;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    content.setAttribute("aria-labelledby", `terms-tab-${name}`);
    content.innerHTML = "<p>Carregando documento…</p>";
    const request = ++termsRequest;
    try {
      const file = name === "consentimento"
        ? "legal/termo-consentimento.md"
        : "legal/termo-de-uso.md";
      const response = await fetch(file);
      if (!response.ok) throw new Error("Não foi possível carregar o documento.");
      const markdown = await response.text();
      if (request === termsRequest) renderTerms(markdown);
    } catch {
      if (request === termsRequest)
        content.innerHTML = "<p>Não foi possível carregar este documento. Tente novamente.</p>";
    }
  }
  function openTerms(documentName = "uso") {
    const modal = document.querySelector("[data-terms-modal]");
    if (!modal) return;
    termsPreviousFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    modal.style.display = "grid";
    document.body.classList.add("modal-open");
    selectTerms(documentName);
    modal.querySelector("[data-close-terms]")?.focus();
  }
  function closeTerms() {
    const modal = document.querySelector("[data-terms-modal]");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";
    if (document.querySelector("[data-auth-modal]:not([hidden])"))
      document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    termsPreviousFocus?.focus?.();
  }
  document.querySelectorAll("[data-terms-tab]").forEach((tab) => {
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const tabs = [...document.querySelectorAll("[data-terms-tab]")];
      const nextIndex = (tabs.indexOf(tab) + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      tabs[nextIndex].focus();
      selectTerms(tabs[nextIndex].dataset.termsTab);
    });
  });
  // Bind the static header controls directly; the delegated handler below also
  // supports auth buttons rendered later by page-specific scripts.
  document.querySelectorAll("[data-open-auth]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openAuth(button.dataset.authMode);
    });
  });
  function updateAuth() {
    const user = storedUser();
    document
      .querySelectorAll('[data-open-auth][data-auth-mode="login"]')
      .forEach((button) => (button.hidden = Boolean(user)));
    document
      .querySelectorAll('[data-open-auth][data-auth-mode="register"]')
      .forEach((button) => (button.hidden = Boolean(user)));
    document
      .querySelectorAll(".account-link")
      .forEach((link) => (link.hidden = !user));
    document
      .querySelectorAll("[data-logout]")
      .forEach((button) => (button.hidden = !user));
  }
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const termsLink = target?.closest("[data-open-terms]");
    if (termsLink) {
      event.preventDefault();
      event.stopPropagation();
      openTerms(termsLink.dataset.termsDocument || "uso");
    }
    const open = target?.closest("[data-open-auth]");
    if (open) openAuth(open.dataset.authMode);
    if (target?.closest("[data-close-modal]")) closeAuth();
    if (event.target === document.querySelector("[data-auth-modal]")) closeAuth();
    if (target?.closest("[data-close-terms]")) closeTerms();
    if (event.target === document.querySelector("[data-terms-modal]")) closeTerms();
    const tab = target?.closest("[data-auth-tab]");
    if (tab) setAuthMode(tab.dataset.authTab);
    const termsTab = target?.closest("[data-terms-tab]");
    if (termsTab) selectTerms(termsTab.dataset.termsTab);
    if (target?.closest("[data-logout]")) {
      localStorage.removeItem("taxatio_usuario");
      updateAuth();
      showToast("Sua sessão foi encerrada.");
    }
    if (target?.closest("[data-theme-toggle]")) {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("taxatio_theme", next);
    }
    if (target?.closest("[data-mobile-menu]")) {
      const nav = document.querySelector("[data-mobile-nav]");
      nav.hidden = !nav.hidden;
      event.target
        .closest("[data-mobile-menu]")
        .setAttribute("aria-expanded", String(!nav.hidden));
    }
    if (target?.closest("[data-consent-dismiss]")) {
      localStorage.setItem("taxatio_consent_seen", "1");
      document.querySelector("[data-consent]").hidden = true;
    }
  });
  document.addEventListener("keydown", (event) => {
    const modal = document.querySelector("[data-auth-modal]");
    if (event.key === "Escape") {
      if (!document.querySelector("[data-terms-modal]")?.hidden) closeTerms();
      else closeAuth();
      const nav = document.querySelector("[data-mobile-nav]");
      if (nav) {
        nav.hidden = true;
        document
          .querySelector("[data-mobile-menu]")
          ?.setAttribute("aria-expanded", "false");
      }
    }
    const termsModal = document.querySelector("[data-terms-modal]");
    const activeModal = termsModal && !termsModal.hidden ? termsModal : modal && !modal.hidden ? modal : null;
    if (event.key === "Tab" && activeModal) {
      const focusables = [
        ...activeModal.querySelectorAll(
          "button:not([hidden]):not(:disabled),input:not([type=hidden]):not([disabled]),[tabindex='0']",
        ),
      ].filter((el) => el.offsetParent !== null);
      if (event.shiftKey && document.activeElement === focusables[0]) {
        event.preventDefault();
        focusables.at(-1).focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === focusables.at(-1)
      ) {
        event.preventDefault();
        focusables[0].focus();
      }
    }
  });
  document.querySelectorAll("[data-search-form]").forEach((form) =>
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = new FormData(form).get("q")?.toString().trim() || "";
      window.location.href = `catalogo.html${
        query
          ? `?q=${encodeURIComponent(query)}
        `
          : ""
      }`;
    }),
  );
  document
    .querySelector("[data-auth-form]")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const values = new FormData(form);
      const isRegister =
        document.querySelector('[data-auth-tab][aria-selected="true"]')?.dataset
          .authTab === "register";
      const data = Object.fromEntries(
        ["nome", "cpf", "email", "senha"].map((key) => [
          key,
          String(values.get(key) || "").trim(),
        ]),
      );
      document
        .querySelectorAll("[data-error]")
        .forEach((node) => {
          node.textContent = "";
          node.parentElement.querySelector("input")?.removeAttribute("aria-invalid");
        });
      document.querySelector("[data-form-error]").textContent = "";
      if (isRegister && !data.nome)
        document.querySelector('[data-error="nome"]').textContent =
          "Informe seu nome.";
      if (isRegister && !validCPF(data.cpf))
        document.querySelector('[data-error="cpf"]').textContent =
          "Digite um CPF válido.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        document.querySelector('[data-error="email"]').textContent =
          "Digite um e-mail válido.";
      if (data.senha.length < 6)
        document.querySelector('[data-error="senha"]').textContent =
          "A senha precisa ter ao menos 6 caracteres.";
      if (isRegister && !form.elements.aceita_termos.checked)
        document.querySelector('[data-error="aceita_termos"]').textContent =
          "Aceite os Termos de Uso para criar sua conta.";
      if (isRegister && !form.elements.consentiu_dados.checked)
        document.querySelector('[data-error="consentiu_dados"]').textContent =
          "O consentimento para tratamento de dados é necessário para criar sua conta.";
      document.querySelectorAll("[data-error]").forEach((node) => {
        if (node.textContent) node.parentElement.querySelector("input")?.setAttribute("aria-invalid", "true");
      });
      if (document.querySelector(".field-error:not(:empty)")) return;
      if (isRegister) {
        data.aceita_termos = true;
        data.consentiu_dados = true;
      }
      const submit = form.querySelector("[type=submit]");
      submit.disabled = true;
      try {
        const user = await apiFetch(
          isRegister ? "/usuarios" : "/usuarios/login",
          {
            method: "POST",
            body: JSON.stringify(
              isRegister
                ? data
                : {
                    email: data.email,
                    senha: data.senha,
                  },
            ),
          },
        );
        localStorage.setItem("taxatio_usuario", JSON.stringify(user));
        form.reset();
        closeAuth();
        updateAuth();
        showToast(
          isRegister
            ? "Conta criada. Bem-vindo ao Parry Help."
            : `Olá, ${user.nome.split(" ")[0]}.`,
        );
        document.dispatchEvent(
          new CustomEvent("parryhelp:login", {
            detail: user,
          }),
        );
      } catch (error) {
        document.querySelector("[data-form-error]").textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    });
  document.querySelectorAll('input[name="cpf"]').forEach((input) =>
    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D/g, "").slice(0, 11);
      input.value = digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }),
  );
  const savedTheme = localStorage.getItem("taxatio_theme");
  document.documentElement.dataset.theme =
    savedTheme === "light" || savedTheme === "dark"
      ? savedTheme
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  if (!localStorage.getItem("taxatio_consent_seen"))
    document.querySelector("[data-consent]")?.removeAttribute("hidden");
  updateAuth();
  window.ParryHelp = {
    API_URL,
    apiFetch,
    escapeHTML,
    showToast,
    getUsuarioLogado: storedUser,
    openAuth,
    closeAuth,
    openTerms,
    closeTerms,
    updateAuth,
  };
})();
