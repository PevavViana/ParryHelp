(() => {
  const root = document.querySelector("[data-account-content]");
  const escape = ParryHelp.escapeHTML;
  async function load() {
    const user = ParryHelp.getUsuarioLogado();
    if (!user) {
      root.innerHTML = `<div class="empty-state">
        <span class="empty-mark">↗</span>
        <h2>Entre para abrir seu espaço.</h2>
        <p>Use seu cadastro para acompanhar e editar suas avaliações.</p>
        <button class="button button-primary" data-open-auth data-auth-mode="login">Entrar no Parry Help</button>
        </div>`;
      return;
    }
    root.innerHTML = '<div class="skeleton-row"></div>';
    try {
      const [profile, history, products] = await Promise.all([
        ParryHelp.apiFetch(`/usuarios/${Number(user.id)}`),
        ParryHelp.apiFetch(`/usuarios/${Number(user.id)}/avaliacoes`),
        ParryHelp.apiFetch("/produtos"),
      ]);
      history.forEach((review) => {
        review.produto_id = products.find(
          (product) => product.nome === review.produto_nome,
        )?.id;
      });
      render(profile, history);
    } catch (error) {
      root.innerHTML = `<div class="error-state">
        <h2>Não foi possível carregar sua conta.</h2>
        <p>${escape(error.message)}</p>
        <button class="button button-primary" data-retry>Recarregar ↻</button>
        </div>`;
      root.querySelector("[data-retry]").addEventListener("click", load);
    }
  }
  function render(user, reviews) {
    root.innerHTML = `<div class="account-summary">
        <section class="account-panel account-profile-panel">
        <div class="account-panel-heading">
        <h2>Seus dados</h2>
        <button class="quiet-button" data-edit-profile>Editar dados <span aria-hidden="true">↗</span></button>
        </div>
        <dl>
        <div>
        <dt>Nome</dt>
        <dd>${escape(user.nome)}</dd>
        </div>
        <div>
        <dt>E-mail</dt>
        <dd>${escape(user.email)}</dd>
        </div>
        </dl>
        <div data-profile-form>
        </div>
        </section>
        <section class="account-panel">
        <h2>Preferências</h2>
        <p>Escolha o tema que fica mais confortável para você.</p>
        <div class="theme-choice">
        <button class="button button-quiet" data-set-theme="light">Tema claro</button>
        <button class="button button-quiet" data-set-theme="dark">Tema escuro</button>
        <button class="button button-quiet" data-set-theme="system">Seguir dispositivo</button>
        </div>
        </section>
        </div>
        <section class="account-reviews">
        <div class="account-section-heading"><div><h2>Suas avaliações</h2><p>O histórico das experiências que você compartilhou.</p></div><span class="account-review-count">${reviews.length}</span></div>${
          reviews.length
            ? reviews
                .map(
                  (
                    review,
                  ) => `<article class="review-item"><div class="review-head"><strong>${escape(
                    review.produto_nome || "Produto",
                  )}
        </strong><span>${Number(review.nota).toFixed(1)}
        / 10 · ${escape(review.data || "")}</span></div><h3>${escape(
          review.titulo,
        )}
        </h3><p>${escape(review.descricao)}
        </p><a class="mini-link" href="produto.html?id=${Number(review.produto_id || 0)}">Abrir produto ↗</a></article>`,
                )
                .join("")
            : `<div class="empty-state account-empty"><h2>Sua primeira avaliação ainda está por vir.</h2><p>Compartilhe uma experiência para ajudar a próxima pessoa a escolher.</p><a class="button button-primary" href="catalogo.html">Explorar produtos <span aria-hidden="true">↗</span></a></div>`
        }</section>
        <section class="account-panel danger-zone">
        <div class="danger-copy">
        <h2>Encerrar conta</h2>
        <p>A remoção apaga seu perfil e suas avaliações de forma permanente.</p>
        </div>
        <button class="quiet-button" data-delete-account>Excluir minha conta</button>
        </section>`;
    root
      .querySelector("[data-edit-profile]")
      .addEventListener("click", () => editProfile(user));
    root.querySelectorAll("[data-set-theme]").forEach((button) =>
      button.addEventListener("click", () => {
        const choice = button.dataset.setTheme;
        if (choice === "system") {
          localStorage.removeItem("taxatio_theme");
          document.documentElement.dataset.theme = matchMedia(
            "(prefers-color-scheme: dark)",
          ).matches
            ? "dark"
            : "light";
        } else {
          localStorage.setItem("taxatio_theme", choice);
          document.documentElement.dataset.theme = choice;
        }
        ParryHelp.showToast("Preferência de tema atualizada.");
      }),
    );
    root
      .querySelector("[data-delete-account]")
      .addEventListener("click", async () => {
        if (
          !window.confirm(
            "Excluir sua conta e todas as avaliações? Esta ação não pode ser desfeita.",
          )
        )
          return;
        try {
          await ParryHelp.apiFetch(`/usuarios/${Number(user.id)}`, {
            method: "DELETE",
          });
          localStorage.removeItem("taxatio_usuario");
          ParryHelp.updateAuth();
          ParryHelp.showToast("Conta excluída.");
          load();
        } catch (error) {
          ParryHelp.showToast(error.message, true);
        }
      });
  }
  function editProfile(user) {
    const target = root.querySelector("[data-profile-form]");
    target.innerHTML = `<form class="modal-form" data-profile-edit novalidate>
        <div class="field-wrap">
        <label for="profile-name">Nome</label>
        <input id="profile-name" name="nome" maxlength="40" required value="${escape(user.nome)}">
        </div>
        <div class="field-wrap">
        <label for="profile-email">E-mail</label>
        <input id="profile-email" name="email" type="email" maxlength="120" required value="${escape(user.email)}">
        </div>
        <div class="field-wrap">
        <label for="profile-password">Nova senha <span class="product-meta">(opcional)</span>
        </label>
        <input id="profile-password" name="senha" type="password" minlength="6" autocomplete="new-password">
        </div>
        <p class="form-error" data-profile-error role="alert">
        </p>
        <button class="button button-primary">Salvar dados</button>
        </form>`;
    target.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const fields = Object.fromEntries(new FormData(event.currentTarget));
      const error = target.querySelector("[data-profile-error]");
      if (
        !fields.nome.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
      ) {
        error.textContent = "Informe um nome e um e-mail válidos.";
        return;
      }
      const payload = {
        nome: fields.nome.trim(),
        email: fields.email.trim(),
      };
      if (fields.senha) payload.senha = fields.senha;
      try {
        const updated = await ParryHelp.apiFetch(`/usuarios/${Number(user.id)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        localStorage.setItem("taxatio_usuario", JSON.stringify(updated));
        ParryHelp.updateAuth();
        ParryHelp.showToast("Seus dados foram atualizados.");
        load();
      } catch (failure) {
        error.textContent = failure.message;
      }
    });
  }
  load();
})();
