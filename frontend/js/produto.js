/* ============================================
   Taxatio — produto.js
   Página de detalhe de produto. Usa as funções
   compartilhadas de common.js.

   IMPORTANTE: PRODUCT_MOCK abaixo é só fixture
   de desenvolvimento, no mesmo espírito do
   MOCK_PRODUCTS de avaliacoes.js. Quando o
   backend (Flask/PHP) estiver pronto, troque
   loadProduct(id) por um fetch real, ex:

   async function loadProduct(id) {
     const res = await fetch(`/api/produtos/${id}`);
     if (!res.ok) return null;
     return res.json();
   }

   O restante do arquivo (render + interações) já
   foi escrito pra funcionar com qualquer objeto
   nesse mesmo formato, sem precisar mexer no
   HTML/CSS. Campos como `aiSummary`, `pros`,
   `cons` e `ratingBreakdown` devem vir prontos
   da API (o resumo por IA é gerado no backend,
   não no cliente).
   ============================================ */
(function () {
  "use strict";

  /* ---------- fixture de desenvolvimento ---------- */
  const PRODUCT_MOCK = {
    id: 1,
    name: "Fone Bluetooth AirSound Pro",
    brand: "AirSound",
    category: "Eletrônicos",
    subcategory: "Áudio",
    images: 5, // quantidade de placeholders de imagem (troque por array de URLs reais)

    score: 7.8,
    reviewCount: 1249,
    ratingBreakdown: [
      { stars: 5, percent: 38 },
      { stars: 4, percent: 29 },
      { stars: 3, percent: 16 },
      { stars: 2, percent: 9 },
      { stars: 1, percent: 8 },
    ],

    priceAvg: 349.9,
    priceMin: 299.0,
    priceMax: 419.9,

    tags: [
      { label: "Bateria viciada", type: "danger" },
      { label: "Ruído no microfone", type: "warn" },
      { label: "Entrega no prazo", type: "info" },
    ],

    aiSummary:
      "A maioria das avaliações elogia o conforto e a qualidade do som, mas um grupo relevante de compradores relata queda acentuada na duração da bateria após alguns meses de uso. Reclamações sobre o microfone em chamadas também aparecem com frequência, especialmente em ambientes com ruído externo.",
    pros: [
      "Conforto para uso prolongado",
      "Qualidade de som bem avaliada",
      "Pareamento rápido com múltiplos aparelhos",
    ],
    cons: [
      "Bateria perde autonomia com o tempo",
      "Microfone capta ruído em chamadas",
      "Suporte demora a responder",
    ],
    aiGeneratedAt: "2 dias atrás",

    complaintChips: [
      { label: "Bateria viciada", count: 412 },
      { label: "Ruído no microfone", count: 187 },
      { label: "Demora no suporte", count: 94 },
      { label: "Case quebradiço", count: 41 },
    ],

    reviews: [
      {
        id: 101,
        author: "Carla M.",
        verified: true,
        rating: 4,
        date: "há 2 dias",
        helpful: 18,
        text: "Som muito bom e confortável pra usar o dia todo. Só reparei que depois de uns três meses a bateria já não dura o mesmo tanto do início.",
      },
      {
        id: 102,
        author: "Diego F.",
        verified: true,
        rating: 2,
        date: "há 4 dias",
        helpful: 31,
        text: "Em ligações o pessoal reclama que minha voz fica abafada e com chiado. Pra música é ótimo, pra call não recomendo.",
      },
      {
        id: 103,
        author: "Renata S.",
        verified: false,
        rating: 5,
        date: "há 6 dias",
        helpful: 9,
        text: "Comprei pra academia e tá aguentando bem o suor. Pareia rápido com o notebook e o celular ao mesmo tempo.",
      },
      {
        id: 104,
        author: "Lucas P.",
        verified: true,
        rating: 3,
        date: "há 1 semana",
        helpful: 12,
        text: "Custo-benefício razoável. Abri chamado por causa da bateria e o suporte demorou mais de uma semana pra responder.",
      },
      {
        id: 105,
        author: "Bianca T.",
        verified: true,
        rating: 5,
        date: "há 2 semanas",
        helpful: 7,
        text: "Uso há dois meses e não tive nenhum problema até agora. Case veio com um leve risco mas nada que atrapalhe.",
      },
    ],

    related: [
      { id: 2, name: "Smartwatch Pulse X2", score: 6.4, reviewCount: 812 },
      { id: 6, name: "Notebook Core Slim 14”", score: 4.6, reviewCount: 921 },
      { id: 5, name: "Câmera de Segurança WatchHome", score: 5.7, reviewCount: 667 },
    ],

    trending: [
      { label: "Categoria", value: "Áudio" },
      { label: "Posição no ranking", value: "#4 em Eletrônicos" },
      { label: "Reclamações hoje", value: "33" },
    ],
  };

  /** Troque por um fetch real quando o backend existir. */
  function loadProduct(id) {
    return PRODUCT_MOCK;
  }

  const SORT_OPTIONS = [
    { id: "recent", label: "Mais recentes" },
    { id: "helpful", label: "Mais úteis" },
    { id: "highest", label: "Maior nota" },
    { id: "lowest", label: "Menor nota" },
  ];
  const REVIEWS_PAGE_SIZE = 3;

  const state = {
    product: null,
    sortBy: "recent",
    visibleCount: REVIEWS_PAGE_SIZE,
    activeThumb: 0,
  };

  /* ---------- helpers ---------- */
  function formatBRL(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatCount(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
  }

  function boxIcon() {
    return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 L20 7 V17 L12 21 L4 17 V7 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M4 7 L12 11 L20 7 M12 11 V21" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
  }

  function starIcon(filled) {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}">
      <path d="M12 2.5 L15 9.2 L22.2 10 L16.8 14.8 L18.4 21.9 L12 18.1 L5.6 21.9 L7.2 14.8 L1.8 10 L9 9.2 Z" stroke="currentColor" stroke-width="${filled ? "0" : "1.3"}" stroke-linejoin="round"/>
    </svg>`;
  }

  function starsRow(rating) {
    const rounded = Math.round(rating);
    let out = "";
    for (let i = 1; i <= 5; i++) out += starIcon(i <= rounded);
    return out;
  }

  function checkIcon() {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12.5 L10 17.5 L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function xIcon() {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  }
  function sparkleIcon() {
    return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2 L12 22 M2 12 L22 12 M5 5 L19 19 M19 5 L5 19" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/></svg>`;
  }
  function shieldIcon() {
    return `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 3 L19 6 V11 C19 15.5 16 19 12 21 C8 19 5 15.5 5 11 V6 Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 12 L11 14 L15.5 9.3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function clockIcon() {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5 V12 L15 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function thumbUpIcon() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M7 21 V10 M2 12 V19 C2 20.1 2.9 21 4 21 H16.6 C17.6 21 18.4 20.3 18.6 19.3 L20.4 11.3 C20.6 10.1 19.7 9 18.5 9 H14 V5.3 C14 3.5 12.5 2.3 11 3.1 C10.6 3.3 10.4 3.7 10.3 4.1 L8.5 9.4 C8.2 10.1 7.6 10.6 7 10.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function tagClass(type) {
    if (type === "danger") return "tag--danger";
    if (type === "warn") return "tag--warn";
    return "tag--info";
  }

  function initials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function getSortedReviews() {
    const reviews = [...state.product.reviews];
    switch (state.sortBy) {
      case "helpful":
        return reviews.sort((a, b) => b.helpful - a.helpful);
      case "highest":
        return reviews.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return reviews.sort((a, b) => a.rating - b.rating);
      case "recent":
      default:
        return reviews; // fixture já vem em ordem cronológica
    }
  }

  /* ---------- render principal: monta o shell inteiro ---------- */
  function renderShell() {
    const shell = document.getElementById("productShell");
    if (!shell) return;
    const p = state.product;

    if (!p) {
      shell.innerHTML = `<p class="panel-empty">Produto não encontrado.</p>`;
      return;
    }

    shell.innerHTML = `
      <nav class="breadcrumb" aria-label="Caminho">
        <a href="index.html">Início</a>
        <span class="crumb-sep">/</span>
        <a href="avaliacoes.html">${p.category}</a>
        <span class="crumb-sep">/</span>
        <span class="crumb-current">${p.name}</span>
      </nav>

      <div class="product-layout">
        <div class="product-main">

          <section class="panel product-header">
            <div class="product-gallery">
              <div class="gallery-main" id="galleryMain">${boxIcon()}</div>
              <div class="gallery-thumbs" id="galleryThumbs"></div>
            </div>

            <div class="product-info-main">
              <div class="product-eyebrow-row">
                <span class="product-category-pill"><a href="avaliacoes.html">${p.category}</a> · ${p.subcategory}</span>
              </div>

              <h1 class="product-title">${p.name}</h1>
              <p class="product-brand">Marca: <span>${p.brand}</span></p>

              <div class="rating-summary-row">
                <span class="stars">${starsRow(p.score / 2)}</span>
                <span class="rating-score-inline">${p.score.toFixed(1)}/10</span>
                <a href="#reviewsSection" class="review-count-link">${p.reviewCount.toLocaleString("pt-BR")} avaliações</a>
              </div>

              <div class="product-price-block">
                <span class="price-label">Preço médio encontrado</span>
                <span class="price-value">${formatBRL(p.priceAvg)}</span>
                <span class="price-range">Faixa: ${formatBRL(p.priceMin)} — ${formatBRL(p.priceMax)}</span>
                <span class="price-disclaimer">Baseado em lojas parceiras. A Taxatio não vende produtos, só avalia.</span>
              </div>

              <div class="tag-row">
                ${p.tags.map((t) => `<span class="tag ${tagClass(t.type)}">${t.label}</span>`).join("")}
              </div>

              <div class="product-actions-row">
                <button class="btn btn-primary" id="rateProductBtn">Avaliar este produto</button>
                <button class="icon-btn" aria-label="Salvar produto">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 3.5 H18 V21 L12 17 L6 21 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
                </button>
                <button class="icon-btn" aria-label="Compartilhar">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="2.6" stroke="currentColor" stroke-width="1.6"/><circle cx="6" cy="12" r="2.6" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="19" r="2.6" stroke="currentColor" stroke-width="1.6"/><path d="M8.3 10.6 L15.7 6.4 M8.3 13.4 L15.7 17.6" stroke="currentColor" stroke-width="1.6"/></svg>
                </button>
              </div>
            </div>
          </section>

          <section class="panel panel--ai">
            <h2 class="panel-title ai-badge">${sparkleIcon()} Resumo gerado por IA</h2>
            <p class="ai-summary-text">${p.aiSummary}</p>
            <div class="ai-prosconds">
              <div>
                <h3 class="ai-list-title ai-list-title--pos">Pontos elogiados</h3>
                <ul class="ai-list ai-list--pos">
                  ${p.pros.map((item) => `<li>${checkIcon()}<span>${item}</span></li>`).join("")}
                </ul>
              </div>
              <div>
                <h3 class="ai-list-title ai-list-title--neg">Pontos criticados</h3>
                <ul class="ai-list ai-list--neg">
                  ${p.cons.map((item) => `<li>${xIcon()}<span>${item}</span></li>`).join("")}
                </ul>
              </div>
            </div>
            <p class="ai-disclaimer">${clockIcon()} Resumo atualizado ${p.aiGeneratedAt} · gerado automaticamente a partir das avaliações, pode conter imprecisões.</p>
          </section>

          <section class="panel">
            <h2 class="panel-title"><span class="panel-title-bar"></span>Distribuição das notas</h2>
            <div class="rating-breakdown">
              <div class="rating-overall">
                <span class="rating-overall-value">${p.score.toFixed(1)}</span>
                <span class="rating-overall-max">de 10</span>
                <span class="rating-overall-count">${p.reviewCount.toLocaleString("pt-BR")} avaliações</span>
              </div>
              <div class="rating-bars" id="ratingBars"></div>
            </div>
          </section>

          <section class="panel">
            <h2 class="panel-title"><span class="panel-title-bar"></span>Reclamações mais citadas</h2>
            <div class="complaint-chip-list" id="complaintChips"></div>
          </section>

          <section class="panel" id="reviewsSection">
            <div class="reviews-toolbar">
              <h2 class="reviews-toolbar-title">Avaliações de quem comprou</h2>
              <div class="sort-select-wrap">
                <label for="sortSelect">Ordenar por</label>
                <select class="sort-select" id="sortSelect"></select>
              </div>
            </div>
            <div class="review-list" id="reviewList"></div>
            <div class="reviews-load-more" id="reviewsLoadMoreWrap"></div>
          </section>

        </div>

        <aside class="sidebar">
          <div class="panel">
            <h2 class="panel-title"><span class="panel-title-bar"></span>Sobre este produto</h2>
            <div id="trendingStats"></div>
          </div>

          <div class="panel">
            <h2 class="panel-title"><span class="panel-title-bar"></span>Produtos relacionados</h2>
            <ul class="related-list" id="relatedList"></ul>
          </div>
        </aside>
      </div>
    `;

    document.getElementById("rateProductBtn").addEventListener("click", () => {
      window.location.hash = "avaliar";
    });

    renderGalleryThumbs();
    renderRatingBars();
    renderComplaintChips();
    renderSortSelect();
    renderReviews();
    renderTrendingStats();
    renderRelated();
  }

  /* ---------- galeria ---------- */
  function renderGalleryThumbs() {
    const el = document.getElementById("galleryThumbs");
    if (!el) return;
    const count = state.product.images || 1;
    el.innerHTML = Array.from({ length: count })
      .map(
        (_, i) => `
      <button class="gallery-thumb ${i === state.activeThumb ? "is-active" : ""}" data-thumb="${i}" aria-label="Ver imagem ${i + 1}">
        ${boxIcon()}
      </button>`
      )
      .join("");

    el.querySelectorAll("[data-thumb]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeThumb = Number(btn.dataset.thumb);
        renderGalleryThumbs();
      });
    });
  }

  /* ---------- distribuição de notas ---------- */
  function renderRatingBars() {
    const el = document.getElementById("ratingBars");
    if (!el) return;
    el.innerHTML = state.product.ratingBreakdown
      .map(
        (row) => `
      <div class="rating-bar-row">
        <span>${row.stars} ${row.stars === 1 ? "estrela" : "estrelas"}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${row.percent}%"></div></div>
        <span>${row.percent}%</span>
      </div>`
      )
      .join("");
  }

  /* ---------- chips de reclamação ---------- */
  function renderComplaintChips() {
    const el = document.getElementById("complaintChips");
    if (!el) return;
    el.innerHTML = state.product.complaintChips
      .map(
        (c) => `
      <span class="complaint-chip">${c.label} <span class="complaint-chip-count">· ${formatCount(c.count)}</span></span>`
      )
      .join("");
  }

  /* ---------- ordenação + lista de avaliações ---------- */
  function renderSortSelect() {
    const el = document.getElementById("sortSelect");
    if (!el) return;
    el.innerHTML = SORT_OPTIONS.map((o) => `<option value="${o.id}">${o.label}</option>`).join("");
    el.value = state.sortBy;
    el.addEventListener("change", () => {
      state.sortBy = el.value;
      state.visibleCount = REVIEWS_PAGE_SIZE;
      renderReviews();
    });
  }

  function renderReviews() {
    const el = document.getElementById("reviewList");
    const loadMoreWrap = document.getElementById("reviewsLoadMoreWrap");
    if (!el) return;

    const sorted = getSortedReviews();
    const visible = sorted.slice(0, state.visibleCount);

    if (visible.length === 0) {
      el.innerHTML = `<p class="panel-empty">Ainda não há avaliações pra este produto.</p>`;
      loadMoreWrap.innerHTML = "";
      return;
    }

    el.innerHTML = visible
      .map(
        (r) => `
      <article class="review-card">
        <div class="review-card-head">
          <div class="review-avatar">${initials(r.author)}</div>
          <div class="review-author-block">
            <span class="review-author-name">${r.author} ${r.verified ? `<span class="verified-badge">${shieldIcon()} Compra verificada</span>` : ""}</span>
            <div class="review-meta-line">${r.date}</div>
          </div>
          <span class="review-stars-inline">${starsRow(r.rating)}</span>
        </div>
        <p class="review-text">${r.text}</p>
        <div class="review-card-footer">
          <button class="btn-helpful" type="button" data-review="${r.id}">${thumbUpIcon()} Útil (${r.helpful})</button>
        </div>
      </article>`
      )
      .join("");

    el.querySelectorAll("[data-review]").forEach((btn) => {
      btn.addEventListener("click", () => {
        // placeholder: incrementa só visualmente até existir endpoint de voto
        const current = btn.textContent.match(/\d+/);
        const next = current ? Number(current[0]) + 1 : 1;
        btn.innerHTML = `${thumbUpIcon()} Útil (${next})`;
        btn.disabled = true;
      });
    });

    if (state.visibleCount < sorted.length) {
      loadMoreWrap.innerHTML = `<button class="btn btn-outline btn-sm" id="loadMoreReviews">Ver mais avaliações</button>`;
      document.getElementById("loadMoreReviews").addEventListener("click", () => {
        state.visibleCount += REVIEWS_PAGE_SIZE;
        renderReviews();
      });
    } else {
      loadMoreWrap.innerHTML = "";
    }
  }

  /* ---------- sidebar: sobre este produto ---------- */
  function renderTrendingStats() {
    const el = document.getElementById("trendingStats");
    if (!el) return;
    el.innerHTML = state.product.trending
      .map((s) => `<div class="stat-row"><span>${s.label}</span><strong>${s.value}</strong></div>`)
      .join("");
  }

  /* ---------- sidebar: relacionados ---------- */
  function renderRelated() {
    const el = document.getElementById("relatedList");
    if (!el) return;
    el.innerHTML = state.product.related
      .map(
        (r) => `
      <li>
        <a class="related-item" href="produto.html?id=${r.id}">
          <span class="related-thumb">${boxIcon()}</span>
          <span class="related-info">
            <span class="related-name">${r.name}</span>
            <span class="related-meta">${r.score.toFixed(1)}/10 · ${formatCount(r.reviewCount)} avaliações</span>
          </span>
        </a>
      </li>`
      )
      .join("");
  }

  /* ---------- fundo animado (bem discreto, igual avaliações) ---------- */
  function initShapeField() {
    const B = Taxatio.PALETTE;
    const layout = [
      { icon: "circleFilled", x: 3, y: 8, size: 44, color: B.bright, depth: 0.5 },
      { icon: "plus", x: 8, y: 20, size: 16, color: B.faint, depth: 1 },
      { icon: "circleOutline", x: 5, y: 60, size: 26, color: B.soft, depth: 0.5 },
      { icon: "diamond", x: 9, y: 88, size: 14, color: B.faint, depth: 1 },
      { icon: "circleFilled", x: 96, y: 10, size: 38, color: B.bright, depth: 0.5 },
      { icon: "x", x: 92, y: 40, size: 18, color: B.soft, depth: 0.7 },
      { icon: "sparkle", x: 96, y: 66, size: 22, color: B.faint, depth: 0.85 },
      { icon: "circleFilled", x: 90, y: 90, size: 46, color: B.bright, depth: 0.4 },
    ];
    Taxatio.createShapeField({ containerId: "shapeField", layout });
  }

  /* ---------- init ---------- */
  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    return Number.isFinite(id) && id > 0 ? id : PRODUCT_MOCK.id;
  }

  Taxatio.initHeaderScroll();
  initShapeField();

  state.product = loadProduct(getProductIdFromUrl());
  renderShell();
})();