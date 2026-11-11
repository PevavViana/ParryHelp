(() => {
  const search = document.querySelector("#compare-search");
  const options = document.querySelector("#compare-product-options");
  const searchHint = document.querySelector("[data-compare-search-hint]");
  const content = document.querySelector("[data-compare-content]");
  const clearButton = document.querySelector("[data-clear-compare]");
  const escape = ParryHelp.escapeHTML;
  let products = [];
  let categories = [];
  let reviews = [];
  const productUrl = (productId) => `produto.html?id=${Number(productId)}`;
  function selectedProducts() {
    const ids = JSON.parse(sessionStorage.getItem("taxatio_compare") || "[]");
    return ids
      .map((id) =>
        products.find((product) => Number(product.id) === Number(id)),
      )
      .filter(Boolean);
  }
  function render() {
    const selected = selectedProducts();
    const count = (product) =>
      reviews.filter(
        (review) => Number(review.produto_id) === Number(product.id),
      ).length;
    content.innerHTML = !selected.length
      ? `<div class="empty-state">
        <h2>Sua comparação começa aqui.</h2>
        <p>Adicione produtos para conferir nota, categoria e volume de avaliações lado a lado.</p>
        <a class="text-link" href="catalogo.html">Explorar catálogo ↗</a>
        </div>`
      : `<div class="compare-table-wrap">
        <table class="compare-table">
        <caption class="sr-only">Comparação entre produtos selecionados</caption>
        <tbody>
        <tr>
        <th scope="row">Produto</th>${selected
          .map(
            (product) => `<td><span class="compare-product-name">${escape(
              product.nome,
            )}
        </span><button class="compare-remove" data-remove="${Number(product.id)}">Remover ×</button></td>`,
          )
          .join("")}</tr>
        <tr>
        <th scope="row">Categoria</th>${selected
          .map(
            (product) => `<td>${escape(
              categories.find(
                (category) =>
                  Number(category.id) === Number(product.categoria_id),
              )?.nome || "Sem categoria",
            )}
        </td>`,
          )
          .join("")}</tr>
        <tr>
        <th scope="row">Nota da comunidade</th>${selected
          .map(
            (product) => `<td><strong class="proof-number">${Number(
              product.media_notas || 0,
            ).toFixed(1)}
        </strong> / 10</td>`,
          )
          .join("")}</tr>
        <tr>
        <th scope="row">Avaliações</th>${selected
          .map(
            (product) => `<td>${count(product)}
        ${count(product) === 1 ? "avaliação" : "avaliações"}
        </td>`,
          )
          .join("")}</tr>
        <tr>
        <th scope="row">Descrição</th>${selected
          .map(
            (product) => `<td>${escape(product.descricao)}
        </td>`,
          )
          .join("")}</tr>
        <tr>
        <th scope="row">Ficha completa</th>${selected.map((product) => `<td><a class="mini-link" href="${productUrl(product.id)}">Ver produto ↗</a></td>`).join("")}</tr>
        </tbody>
        </table>
        </div>`;
    content.querySelectorAll("[data-remove]").forEach((button) =>
      button.addEventListener("click", () => {
        sessionStorage.setItem(
          "taxatio_compare",
          JSON.stringify(
            selected
              .filter(
                (item) => Number(item.id) !== Number(button.dataset.remove),
              )
              .map((item) => Number(item.id)),
          ),
        );
        render();
        renderOptions(search.value);
      }),
    );
  }
  function closeOptions() {
    options.hidden = true;
    search.setAttribute("aria-expanded", "false");
  }
  function addProduct(productId) {
    const chosen = selectedProducts().map((product) => Number(product.id));
    if (chosen.length >= 3 || chosen.includes(Number(productId))) return;
    sessionStorage.setItem(
      "taxatio_compare",
      JSON.stringify([...chosen, Number(productId)]),
    );
    search.value = "";
    render();
    renderOptions("");
    search.focus();
  }
  function renderOptions(query) {
    const chosen = selectedProducts().map((product) => Number(product.id));
    clearButton.hidden = chosen.length === 0;
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    const matches = products
      .filter((product) => !chosen.includes(Number(product.id)))
      .filter((product) => {
        const category = categories.find(
          (item) => Number(item.id) === Number(product.categoria_id),
        )?.nome || "";
        return `${product.nome} ${category}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery);
      })
      .slice(0, 8);
    const atLimit = chosen.length >= 3;
    search.disabled = atLimit;
    search.placeholder = atLimit ? "Limite de três produtos atingido" : "Digite o nome de um produto";
    if (atLimit) {
      searchHint.textContent = "Remova um produto da comparação para adicionar outro.";
    } else if (!normalizedQuery) {
      searchHint.textContent = "Pesquise para encontrar produtos disponíveis.";
    } else if (!matches.length) {
      searchHint.textContent = "Nenhum produto encontrado com esse nome.";
    } else {
      searchHint.textContent = `${matches.length} ${matches.length === 1 ? "produto disponível" : "produtos disponíveis"}.`;
    }
    options.innerHTML = matches.map((product) => {
      const category = categories.find(
        (item) => Number(item.id) === Number(product.categoria_id),
      )?.nome || "Sem categoria";
      return `<button class="compare-search-option" type="button" role="option" data-option-product="${Number(product.id)}">
        <span><strong>${escape(product.nome)}</strong><small>${escape(category)}</small></span>
        <span class="compare-option-score">${Number(product.media_notas || 0).toFixed(1)}<small>/10</small></span>
      </button>`;
    }).join("");
    options.hidden = !normalizedQuery || !matches.length || atLimit;
    search.setAttribute("aria-expanded", String(!options.hidden));
    options.querySelectorAll("[data-option-product]").forEach((option) => {
      option.addEventListener("click", () => addProduct(option.dataset.optionProduct));
    });
  }
  search.addEventListener("input", () => renderOptions(search.value));
  search.addEventListener("keydown", (event) => {
    const optionButtons = [...options.querySelectorAll("[data-option-product]")];
    if (event.key === "ArrowDown" && optionButtons.length) {
      event.preventDefault();
      options.hidden = false;
      search.setAttribute("aria-expanded", "true");
      optionButtons[0].focus();
    } else if (event.key === "Escape") {
      closeOptions();
    }
  });
  options.addEventListener("keydown", (event) => {
    const optionButtons = [...options.querySelectorAll("[data-option-product]")];
    const currentIndex = optionButtons.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      optionButtons[(currentIndex + direction + optionButtons.length) % optionButtons.length]?.focus();
    } else if (event.key === "Escape") {
      closeOptions();
      search.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".compare-search")) closeOptions();
  });
  document
    .querySelector("[data-clear-compare]")
    .addEventListener("click", () => {
      sessionStorage.removeItem("taxatio_compare");
      render();
      renderOptions("");
    });
  async function load() {
    try {
      [products, categories, reviews] = await Promise.all([
        ParryHelp.apiFetch("/produtos"),
        ParryHelp.apiFetch("/categorias"),
        ParryHelp.apiFetch("/avaliacoes"),
      ]);

      render();
      renderOptions("");
    } catch (error) {
      content.innerHTML = `<div class="error-state">
        <h2>Falha ao carregar os dados.</h2>
        <p>${escape(error.message)}</p>
        <button class="button button-primary" type="button" data-compare-retry>Tentar novamente ↻</button>
        </div>`;
      content.querySelector("[data-compare-retry]").addEventListener("click", load);
    }
  }

  load();
})();
