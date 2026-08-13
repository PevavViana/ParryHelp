/* ============================================
   Taxatio — avaliacoes.js
   Específico da página de avaliações. Usa as
   funções compartilhadas de common.js.

   IMPORTANTE: os dados abaixo (MOCK_PRODUCTS)
   são só fixture de desenvolvimento. Quando o
   backend estiver pronto, troque a função
   loadProducts() por um fetch real — o resto
   do arquivo (render + filtros) já foi escrito
   pra funcionar com qualquer array no mesmo
   formato, sem precisar mexer no HTML/CSS.
   ============================================ */
(function () {
  "use strict";

  /* ---------- fixture de desenvolvimento ---------- */
  const MOCK_PRODUCTS = [
    {
      id: 1,
      name: "Fone Bluetooth AirSound Pro",
      category: "Eletrônicos",
      subcategory: "Áudio",
      tags: [
        { label: "Bateria viciada", type: "danger" },
        { label: "Ruído no microfone", type: "warn" },
      ],
      excerpt: "Comprei há três meses e a bateria já não dura nem duas horas de uso contínuo. O suporte demorou para responder.",
      lastReviewDaysAgo: 2,
      score: 7.8,
      resolvedPercent: 76,
      complaints: 1249,
      complaintsToday: 33,
    },
    {
      id: 2,
      name: "Smartwatch Pulse X2",
      category: "Eletrônicos",
      subcategory: "Wearables",
      tags: [
        { label: "Tela risca fácil", type: "warn" },
        { label: "App trava", type: "danger" },
        { label: "Entrega atrasada", type: "info" },
      ],
      excerpt: "O relógio é bonito, mas o aplicativo desconecta sozinho quase todo dia. Já reinstalei três vezes.",
      lastReviewDaysAgo: 1,
      score: 6.4,
      resolvedPercent: 58,
      complaints: 812,
      complaintsToday: 21,
    },
    {
      id: 3,
      name: "Liquidificador Turbo 900W",
      category: "Eletrodomésticos",
      subcategory: "Cozinha",
      tags: [
        { label: "Motor superaquece", type: "danger" },
        { label: "Vazamento na base", type: "danger" },
      ],
      excerpt: "Usei cinco vezes e o motor começou a soltar cheiro de queimado. Pedi troca e ainda estou esperando.",
      lastReviewDaysAgo: 4,
      score: 5.1,
      resolvedPercent: 41,
      complaints: 530,
      complaintsToday: 47,
    },
    {
      id: 4,
      name: "Cadeira Gamer FlexBack",
      category: "Casa e Escritório",
      subcategory: "Mobiliário",
      tags: [
        { label: "Espuma amassa rápido", type: "warn" },
        { label: "Peça veio faltando", type: "danger" },
      ],
      excerpt: "Depois de um mês o encosto já não firma mais na posição. Pra quem trabalha sentado o dia todo, incomoda.",
      lastReviewDaysAgo: 6,
      score: 6.9,
      resolvedPercent: 64,
      complaints: 398,
      complaintsToday: 9,
    },
    {
      id: 5,
      name: "Câmera de Segurança WatchHome",
      category: "Casa Inteligente",
      subcategory: "Segurança",
      tags: [
        { label: "Conexão instável", type: "warn" },
        { label: "Cobrança indevida na nuvem", type: "danger" },
      ],
      excerpt: "A imagem trava em horários de pico e o app cobrou um plano que eu não assinei. Ainda tentando resolver.",
      lastReviewDaysAgo: 3,
      score: 5.7,
      resolvedPercent: 49,
      complaints: 667,
      complaintsToday: 58,
    },
    {
      id: 6,
      name: "Notebook Core Slim 14”",
      category: "Eletrônicos",
      subcategory: "Computadores",
      tags: [
        { label: "Ventoinha barulhenta", type: "warn" },
        { label: "Divergência de anúncio", type: "info" },
      ],
      excerpt: "Anunciado com 16GB de RAM, chegou com 8GB. A loja disse que era 'erro de cadastro' e não resolveu.",
      lastReviewDaysAgo: 1,
      score: 4.6,
      resolvedPercent: 33,
      complaints: 921,
      complaintsToday: 64,
    },
  ];

  /** Troque por um fetch real quando o backend existir, ex:
   *  async function loadProducts() {
   *    const res = await fetch("/api/products");
   *    return res.json();
   *  }
   */
  function loadProducts() {
    return MOCK_PRODUCTS;
  }

  const RATING_FILTERS = [
    { id: "any", label: "Qualquer nota", min: 0, max: 10 },
    { id: "excellent", label: "9 ou mais — Excelente", min: 9, max: 10 },
    { id: "good", label: "7 a 8.9 — Bom", min: 7, max: 8.9 },
    { id: "regular", label: "5 a 6.9 — Regular", min: 5, max: 6.9 },
    { id: "low", label: "Abaixo de 5", min: 0, max: 4.9 },
  ];

  const state = {
    products: loadProducts(),
    category: null,
    ratingId: "any",
  };

  /* ---------- helpers ---------- */
  function formatCount(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
  }

  function boxIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L20 7 V17 L12 21 L4 17 V7 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M4 7 L12 11 L20 7 M12 11 V21" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
  }

  function getFilteredProducts() {
    const rating = RATING_FILTERS.find((r) => r.id === state.ratingId) || RATING_FILTERS[0];
    return state.products.filter((p) => {
      const matchesCategory = !state.category || p.category === state.category;
      const matchesRating = p.score >= rating.min && p.score <= rating.max;
      return matchesCategory && matchesRating;
    });
  }

  /* ---------- render: sidebar — categorias ---------- */
  function renderCategoryFilters() {
    const el = document.getElementById("categoryFilters");
    if (!el) return;

    const counts = state.products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    const categories = Object.keys(counts).sort();

    const allItem = `
      <li>
        <button class="filter-item ${!state.category ? "is-active" : ""}" data-category="">
          <span>Todas as categorias</span>
          <span class="filter-count">${formatCount(state.products.length)}</span>
        </button>
      </li>`;

    const items = categories
      .map(
        (cat) => `
      <li>
        <button class="filter-item ${state.category === cat ? "is-active" : ""}" data-category="${cat}">
          <span>${cat}</span>
          <span class="filter-count">${formatCount(counts[cat])}</span>
        </button>
      </li>`
      )
      .join("");

    el.innerHTML = allItem + items;

    el.querySelectorAll("[data-category]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.dataset.category || null;
        renderCategoryFilters();
        renderProductList();
      });
    });
  }

  /* ---------- render: sidebar — nota de satisfação ---------- */
  function renderRatingFilters() {
    const el = document.getElementById("ratingFilters");
    if (!el) return;

    el.innerHTML = RATING_FILTERS.map(
      (r) => `
      <li>
        <button class="rating-item ${state.ratingId === r.id ? "is-active" : ""}" data-rating="${r.id}">
          <span class="radio-dot"></span>
          <span>${r.label}</span>
        </button>
      </li>`
    ).join("");

    el.querySelectorAll("[data-rating]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.ratingId = btn.dataset.rating;
        renderRatingFilters();
        renderProductList();
      });
    });
  }

  /* ---------- render: sidebar — mais reclamados ---------- */
  function renderMostReported() {
    const el = document.getElementById("mostReportedList");
    if (!el) return;

    const top = [...state.products]
      .sort((a, b) => b.complaintsToday - a.complaintsToday)
      .slice(0, 6);

    el.innerHTML = top
      .map(
        (p) => `
      <li class="reported-item">
        <span>${p.name}</span>
        <span class="reported-badge">+${p.complaintsToday} hoje</span>
      </li>`
      )
      .join("");
  }

  /* ---------- render: lista de produtos ---------- */
  function tagClass(type) {
    if (type === "danger") return "tag--danger";
    if (type === "warn") return "tag--warn";
    return "tag--info";
  }

  function renderProductList() {
    const el = document.getElementById("productList");
    if (!el) return;

    const filtered = getFilteredProducts();

    if (filtered.length === 0) {
      el.innerHTML = `<p class="panel-empty">Nenhum produto encontrado com esses filtros.</p>`;
      return;
    }

    el.innerHTML = filtered
      .map(
        (p) => `
      <article class="product-card">
        <div class="product-thumb">${boxIcon()}</div>

        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-category">${p.category} · ${p.subcategory}</p>

          <div class="tag-row">
            ${p.tags.map((t) => `<span class="tag ${tagClass(t.type)}">${t.label}</span>`).join("")}
          </div>

          <p class="product-excerpt">“${p.excerpt}”</p>
          <p class="product-meta">Última avaliação · ${p.lastReviewDaysAgo === 1 ? "1 dia" : p.lastReviewDaysAgo + " dias"} atrás</p>
        </div>

        <div class="product-score">
          <span class="score-label">Satisfação geral</span>
          <span class="score-value">${p.score.toFixed(1)}<small>/10</small></span>

          <div class="score-progress">
            <div class="score-progress-labels">
              <span>Resolvidos</span>
              <span>${p.resolvedPercent}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${p.resolvedPercent}%"></div>
            </div>
          </div>

          <span class="complaints-count">${p.complaints.toLocaleString("pt-BR")} reclamações</span>
          <button class="btn btn-primary btn-sm">Ver todas as reclamações</button>
        </div>
      </article>`
      )
      .join("");
  }

  /* ---------- fundo animado (mais discreto que o da home) ---------- */
  const B = Taxatio.PALETTE;
  const reviewsShapeLayout = [
    { icon: "circleFilled", x: 3, y: 8, size: 46, color: B.bright, depth: 0.5 },
    { icon: "triangleOutline", x: 9, y: 4, size: 20, color: B.faint, depth: 0.9 },
    { icon: "plus", x: 15, y: 12, size: 18, color: B.faint, depth: 1 },
    { icon: "x", x: 6, y: 34, size: 22, color: B.soft, depth: 0.7 },
    { icon: "diamond", x: 3, y: 55, size: 14, color: B.faint, depth: 1 },
    { icon: "circleOutline", x: 8, y: 72, size: 30, color: B.soft, depth: 0.5 },
    { icon: "chevron", x: 4, y: 90, size: 18, color: B.faint, depth: 0.9 },

    { icon: "circleFilled", x: 96, y: 6, size: 40, color: B.bright, depth: 0.5 },
    { icon: "square", x: 91, y: 20, size: 24, color: B.faint, depth: 0.8 },
    { icon: "x", x: 97, y: 38, size: 20, color: B.soft, depth: 0.7 },
    { icon: "sparkle", x: 90, y: 52, size: 24, color: B.faint, depth: 0.85 },
    { icon: "circleFilled", x: 95, y: 78, size: 52, color: B.bright, depth: 0.4 },
    { icon: "diamond", x: 88, y: 90, size: 16, color: B.faint, depth: 1 },
  ];

  Taxatio.initHeaderScroll();
  Taxatio.createShapeField({ containerId: "shapeField", layout: reviewsShapeLayout });

  renderCategoryFilters();
  renderRatingFilters();
  renderMostReported();
  renderProductList();
})();