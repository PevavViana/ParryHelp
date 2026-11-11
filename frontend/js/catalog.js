(() => {
  const select = (selector) => document.querySelector(selector);

  const state = {
    products: [],
    categories: [],
    reviews: [],
    category: "",
    rating: "all",
    ranking: "reviews",
    sort: "reviews",
    query: new URLSearchParams(location.search).get("q") || "",
    page: 1,
    failed: false,
  };

  const ratingFilters = [
    { id: "all", label: "Qualquer nota", min: 0 },
    { id: "high", label: "7 ou mais", min: 7 },
    { id: "middle", label: "5 a 6,9", min: 5, max: 6.99 },
    { id: "low", label: "Abaixo de 5", min: 0, max: 4.99 },
  ];

  const reviewList = (productId) =>
    state.reviews
      .filter((review) => Number(review.produto_id) === Number(productId))
      .sort((first, second) => reviewDate(second) - reviewDate(first));

  const reviewDate = (review) => {
    const date = new Date(`${review.data || ""}T00:00:00`);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const productReviews = (productId) => reviewList(productId).length;
  const productRating = (product) => Number(product.media_notas || 0);

  const categoryName = (categoryId) =>
    state.categories.find(
      (category) => Number(category.id) === Number(categoryId),
    )?.nome || "Sem categoria";

  const todayReviewCount = (productId) => {
    const today = new Date().toISOString().slice(0, 10);
    return reviewList(productId).filter((review) => review.data === today).length;
  };

  const productUrl = (productId, anchor = "") =>
    `produto.html?id=${Number(productId)}${anchor}`;

  const daysSinceReview = (review) => {
    if (!review) return null;
    const elapsed = Date.now() - reviewDate(review);
    return Math.max(0, Math.floor(elapsed / 86400000));
  };

  function reportTopics(productId) {
    const counts = new Map();

    reviewList(productId).forEach((review) => {
      const title = String(review.titulo || "").trim();
      if (!title) return;
      const key = title.toLocaleLowerCase("pt-BR");
      const current = counts.get(key) || { title, count: 0 };
      current.count += 1;
      counts.set(key, current);
    });

    return [...counts.values()]
      .sort((first, second) => second.count - first.count)
      .slice(0, 3);
  }

  function topicTone(title) {
    const normalized = String(title || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
    const positiveTerms = [
      "bom",
      "boa",
      "otimo",
      "otima",
      "excelente",
      "impressionante",
      "cumpre",
      "atende",
      "rapido",
      "rapida",
      "confiavel",
      "duravel",
      "facil",
      "qualidade",
      "recomendo",
      "intuitivo",
      "intuitiva",
    ];
    const negativeTerms = [
      "ruim",
      "pessimo",
      "pessima",
      "lento",
      "lenta",
      "demora",
      "falha",
      "problema",
      "quebra",
      "quebrado",
      "fragil",
      "caro",
      "cara",
      "dificil",
      "defeito",
      "nao funciona",
      "nao cumpre",
      "nao atende",
    ];

    if (negativeTerms.some((term) => normalized.includes(term))) {
      return "negative";
    }

    if (positiveTerms.some((term) => normalized.includes(term))) {
      return "positive";
    }

    return "neutral";
  }

  function productsFiltered() {
    const selectedRating = ratingFilters.find(
      (filter) => filter.id === state.rating,
    );
    let products = state.products.filter((product) => {
      const fullText = `${product.nome} ${product.descricao} ${categoryName(product.categoria_id)}`.toLocaleLowerCase("pt-BR");
      const matchesQuery =
        !state.query ||
        fullText.includes(state.query.toLocaleLowerCase("pt-BR"));
      const matchesCategory =
        !state.category || String(product.categoria_id) === state.category;
      const matchesRating =
        state.rating === "all" ||
        (productReviews(product.id) > 0 &&
          productRating(product) >= selectedRating.min &&
          productRating(product) <= (selectedRating.max ?? 10));

      return matchesQuery && matchesCategory && matchesRating;
    });

    if (state.ranking === "category") {
      products = products.filter(
        (product) => String(product.categoria_id) === state.category,
      );
    }

    products.sort(
      state.sort === "rating"
        ? (first, second) => productRating(second) - productRating(first)
        : state.sort === "name"
          ? (first, second) => first.nome.localeCompare(second.nome, "pt-BR")
          : (first, second) =>
              productReviews(second.id) - productReviews(first.id) ||
              productRating(second) - productRating(first),
    );

    return products;
  }

  function clearFilters() {
    state.category = "";
    state.rating = "all";
    state.ranking = "reviews";
    state.query = "";
    state.page = 1;
    history.replaceState(null, "", "catalogo.html");
    render();
  }

  function hasActiveFilters() {
    return Boolean(
      state.query ||
      state.category ||
      state.rating !== "all" ||
      state.ranking !== "reviews",
    );
  }

  function closeFilterDrawer() {
    document.body.classList.remove("catalog-filters-open");
    select("[data-filter-toggle]").setAttribute("aria-expanded", "false");
    select("[data-filter-close]").blur();
    select("[data-filter-toggle]").focus();
  }

  function renderRankingFilters() {
    const rankedOptions = [
      {
        id: "reviews",
        label: "Mais avaliados",
        count: state.reviews.length,
      },
      {
        id: "rating",
        label: "Melhor nota",
        count: state.products.filter((product) => productRating(product) > 0)
          .length,
      },
    ];

    const categoryOptions = state.categories.map((category) => ({
      id: `category-${category.id}`,
      categoryId: String(category.id),
      label: category.nome,
      count: state.products.filter(
        (product) => Number(product.categoria_id) === Number(category.id),
      ).length,
    }));

    select("[data-ranking-filters]").innerHTML = [...rankedOptions, ...categoryOptions]
      .map((option) => {
        const active = option.categoryId
          ? state.category === option.categoryId
          : state.ranking === option.id && !state.category;

        return `<li>
          <button class="filter-button ${active ? "active" : ""}" type="button" data-ranking="${ParryHelp.escapeHTML(option.id)}" ${option.categoryId ? `data-category="${ParryHelp.escapeHTML(option.categoryId)}"` : ""} aria-pressed="${active}">
            <span>${ParryHelp.escapeHTML(option.label)}</span>
            <span class="filter-count">${option.count.toLocaleString("pt-BR")}</span>
          </button>
        </li>`;
      })
      .join("");

    select("[data-ranking-filters]")
      .querySelectorAll("[data-ranking]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          if (button.dataset.category) {
            state.category = button.dataset.category;
            state.ranking = "category";
          } else {
            state.category = "";
            state.ranking = button.dataset.ranking;
            state.sort = button.dataset.ranking;
          }
          state.page = 1;
          render();
        });
      });
  }

  function renderRatingFilters() {
    select("[data-rating-filters]").innerHTML = ratingFilters
      .map(
        (filter) => `<li>
          <button class="filter-button ${state.rating === filter.id ? "active" : ""}" type="button" data-rating="${filter.id}" aria-pressed="${state.rating === filter.id}">
            ${filter.label}
          </button>
        </li>`,
      )
      .join("");

    select("[data-rating-filters]")
      .querySelectorAll("[data-rating]")
      .forEach((button) =>
        button.addEventListener("click", () => {
          state.rating = button.dataset.rating;
          state.page = 1;
          render();
        }),
      );
  }

  function renderTopProducts() {
    const ranked = [...state.products]
      .sort(
        (first, second) =>
          productReviews(second.id) - productReviews(first.id) ||
          productRating(second) - productRating(first),
      )
      .slice(0, 6);

    select("[data-top-products]").innerHTML = ranked.length
      ? ranked
          .map(
            (product, index) => `<li>
              <a href="${productUrl(product.id)}" aria-label="${ParryHelp.escapeHTML(product.nome)}, ${productReviews(product.id)} reclamações">
                <span class="top-rank">${String(index + 1).padStart(2, "0")}</span>
                <span class="top-product-name">${ParryHelp.escapeHTML(product.nome)}</span>
                ${todayReviewCount(product.id) ? `<strong class="top-new-count">+${todayReviewCount(product.id)} hoje</strong>` : ""}
              </a>
            </li>`,
          )
          .join("")
      : '<li class="top-empty">As reclamações da comunidade aparecem aqui.</li>';
  }

  function productCard(product) {
    const reviews = reviewList(product.id);
    const latestReview = reviews[0];
    const rating = productRating(product);
    const ratingPercent = Math.min(100, Math.max(0, rating * 10));
    const image =
      product.imagem_url && /^https?:\/\//i.test(product.imagem_url)
        ? `<img loading="lazy" src="${ParryHelp.escapeHTML(product.imagem_url)}" alt="" onerror="this.remove()">`
        : `<span aria-hidden="true">${ParryHelp.escapeHTML(product.nome.trim().charAt(0).toUpperCase() || "T")}</span>`;
    const topics = reportTopics(product.id);
    const days = daysSinceReview(latestReview);
    const excerpt = latestReview
      ? latestReview.descricao || latestReview.titulo
      : "Ainda não há relatos da comunidade para este produto.";

    return `<article class="product-card" data-product-card="${productUrl(product.id)}" tabindex="0" aria-label="${ParryHelp.escapeHTML(product.nome)}. Abrir ficha do produto.">
      <div class="product-summary">
        <div class="product-thumb" aria-hidden="true">${image}</div>
        <div class="product-info">
          <h2><a href="${productUrl(product.id)}">${ParryHelp.escapeHTML(product.nome)}</a></h2>
          <span class="product-meta">${ParryHelp.escapeHTML(categoryName(product.categoria_id))}</span>
          <div class="product-tags" aria-label="Assuntos recorrentes">
            ${topics.length ? topics.map((topic) => `<span class="problem-tag problem-tag-${topicTone(topic.title)}" title="${topic.count} relatos">${ParryHelp.escapeHTML(topic.title)}</span>`).join("") : '<span class="problem-tag problem-tag-muted">Sem relatos</span>'}
            <label class="compare-check">
              <input type="checkbox" data-compare-product="${Number(product.id)}"> Comparar
            </label>
          </div>
        </div>
      </div>
      <div class="product-report">
        <blockquote>“${ParryHelp.escapeHTML(excerpt)}”</blockquote>
        <p class="last-review">${latestReview ? `Última avaliação: ${days === 0 ? "hoje" : `há ${days} ${days === 1 ? "dia" : "dias"}`}` : "Aguardando a primeira avaliação"}</p>
      </div>
      <div class="product-score">
        <span class="score-label">Satisfação geral</span>
        <strong>${rating.toFixed(1)}<small>/10</small></strong>
        <div class="satisfaction-meter" role="meter" aria-label="Satisfação média" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${rating.toFixed(1)}">
          <span style="width: ${ratingPercent}%"></span>
        </div>
        <span class="satisfaction-label">Satisfação ${Math.round(ratingPercent)}%</span>
        <span class="complaint-count">${reviews.length.toLocaleString("pt-BR")} ${reviews.length === 1 ? "reclamação" : "reclamações"}</span>
        <a class="button button-primary complaints-link" href="${productUrl(product.id, "#avaliacoes")}">Ver todas as reclamações</a>
      </div>
    </article>`;
  }

  function renderLoading() {
    select("[data-product-list]").innerHTML = Array.from(
      { length: 3 },
      () => `<article class="product-card product-skeleton" aria-hidden="true">
        <div class="product-summary"><span class="skeleton-thumb"></span><div class="skeleton-copy"><span></span><span></span><span></span></div></div>
        <div class="skeleton-report"><span></span><span></span><span></span><span></span></div>
        <div class="skeleton-score"><span></span><span></span><span></span><span></span></div>
      </article>`,
    ).join("");
  }

  function renderPagination(totalPages) {
    const root = select("[data-pagination]");

    if (totalPages < 2) {
      root.innerHTML = "";
      return;
    }

    root.innerHTML = `<button class="page-button" type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Página anterior">‹</button>${Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    )
      .map(
        (number) => `<button class="page-button" type="button" data-page="${number}" ${number === state.page ? 'aria-current="page"' : ""}>${number}</button>`,
      )
      .join("")}<button class="page-button" type="button" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""} aria-label="Próxima página">›</button>`;

    root.querySelectorAll("[data-page]").forEach((button) =>
      button.addEventListener("click", () => {
        state.page = Number(button.dataset.page);
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }),
    );
  }

  function render() {
    renderRankingFilters();
    renderRatingFilters();
    renderTopProducts();

    const filtered = productsFiltered();
    const canClearFilters = hasActiveFilters();
    document.querySelectorAll("[data-clear-filters]").forEach((button) => {
      button.hidden = !canClearFilters;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / 6));
    state.page = Math.min(state.page, totalPages);
    const visible = filtered.slice((state.page - 1) * 6, state.page * 6);

    const resultsCount = select("[data-results-count]");
    resultsCount.hidden = state.failed;
    resultsCount.textContent = state.failed
      ? ""
      : `${filtered.length.toLocaleString("pt-BR")} ${filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
    const searchStatus = select("[data-search-status]");
    searchStatus.hidden = state.failed;
    searchStatus.textContent = state.query ? `Busca: “${state.query}”` : "";

    select("[data-product-list]").innerHTML = visible.length
      ? visible.map(productCard).join("")
      : state.failed
        ? `<div class="catalog-state catalog-state-error">
            <div class="catalog-error-shape" aria-hidden="true"><span></span><i></i></div>
            <div class="catalog-state-copy">
              <h2>Não conseguimos carregar os produtos.</h2>
              <p>A conexão com o Parry Help falhou. Tente novamente em instantes.</p>
              <button class="button button-primary" type="button" data-retry>Recarregar catálogo <span aria-hidden="true">↻</span></button>
            </div>
          </div>`
        : `<div class="catalog-state catalog-state-empty">
            <div class="catalog-state-copy">
              <h2>Nenhum produto encontrado.</h2>
              <p>Experimente outra busca ou limpe os filtros para ver o catálogo completo.</p>
            </div>
          </div>`;

    renderPagination(totalPages);

    select("[data-product-list]")
      .querySelector("[data-retry]")
      ?.addEventListener("click", load);

    select("[data-product-list]")
      .querySelectorAll("[data-compare-product]")
      .forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          let ids;
          try {
            ids = JSON.parse(sessionStorage.getItem("taxatio_compare") || "[]");
          } catch {
            ids = [];
          }

          ids = checkbox.checked
            ? [...new Set([...ids, Number(checkbox.dataset.compareProduct)])].slice(-3)
            : ids.filter((id) => id !== Number(checkbox.dataset.compareProduct));

          sessionStorage.setItem("taxatio_compare", JSON.stringify(ids));
          ParryHelp.showToast(
            checkbox.checked && ids.length === 3
              ? "A comparação já tem três produtos."
              : "Seleção atualizada.",
          );
        });
      });

    select("[data-product-list]")
      .querySelectorAll("[data-product-card]")
      .forEach((card) => {
        card.addEventListener("click", (event) => {
          if (event.target.closest("a, button, input, label")) return;
          location.href = card.dataset.productCard;
        });
        card.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" || event.target.closest("a, button, input, label")) return;
          location.href = card.dataset.productCard;
        });
      });
  }

  async function load() {
    state.failed = false;
    select("[data-results-count]").textContent = "Carregando catálogo…";
    renderLoading();

    try {
      [state.categories, state.products, state.reviews] = await Promise.all([
        ParryHelp.apiFetch("/categorias"),
        ParryHelp.apiFetch("/produtos"),
        ParryHelp.apiFetch("/avaliacoes"),
      ]);
    } catch (error) {
      state.failed = true;
      ParryHelp.showToast(error.message, true);
    }

    render();
  }

  document.querySelectorAll("[data-clear-filters]").forEach((button) =>
    button.addEventListener("click", clearFilters),
  );

  select("[data-filter-toggle]").addEventListener("click", () => {
    document.body.classList.add("catalog-filters-open");
    select("[data-filter-toggle]").setAttribute("aria-expanded", "true");
    select("[data-filter-close]").focus();
  });

  select("[data-filter-close]").addEventListener("click", closeFilterDrawer);
  select("[data-filter-backdrop]").addEventListener("click", closeFilterDrawer);
  window.addEventListener("resize", () => {
    if (
      window.innerWidth > 680 &&
      document.body.classList.contains("catalog-filters-open")
    ) {
      closeFilterDrawer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeFilterDrawer();
  });

  load();
})();
