/* ============================================
   Taxatio — common.js
   Comportamento compartilhado entre páginas:
   sombra do header ao rolar + fábrica do
   campo de formas flutuantes do fundo.
   Carregar antes do JS específico da página.
   ============================================ */

window.Taxatio = (function () {
  "use strict";

  const icons = {
    circleFilled: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${c}"/></svg>`,
    circleOutline: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="${c}" stroke-width="1.6" fill="none"/></svg>`,
    triangleOutline: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3 L21 20 H3 Z" stroke="${c}" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>`,
    triangleSmall: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 4 L20 12 L6 20 Z" stroke="${c}" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>`,
    square: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="${c}" stroke-width="1.6" fill="none"/></svg>`,
    squareFilled: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="${c}"/></svg>`,
    diamond: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" stroke="${c}" stroke-width="1.6" fill="none" transform="rotate(45 12 12)"/></svg>`,
    plus: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3 V21 M3 12 H21" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    plusThick: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 2 V22 M2 12 H22" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/></svg>`,
    x: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 5 L19 19 M19 5 L5 19" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
    sparkle: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 2 L12 22 M2 12 L22 12 M5 5 L19 19 M19 5 L5 19" stroke="${c}" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/></svg>`,
    asterisk: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 4 V20 M5 8 L19 16 M19 8 L5 16" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    ring: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" stroke="${c}" stroke-width="1.5" fill="none"/></svg>`,
    chevron: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M9 5 L16 12 L9 19" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
    dot: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="${c}"/></svg>`,
    plane: (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M21 3 L3 10.5 L11 13 L13.5 21 Z" stroke="${c}" stroke-width="1.4" stroke-linejoin="round" fill="${c}" fill-opacity="0.25"/></svg>`,
  };

  const PALETTE = {
    bright: "#3b5bff",
    soft: "#c9d2ff",
    faint: "rgba(237,239,253,0.55)",
  };

  /**
   * Cria o campo de formas flutuantes dentro de um container.
   * @param {Object} opts
   * @param {string} opts.containerId - id do elemento onde as formas entram
   * @param {Array}  opts.layout - array de { icon, x, y, size, color, depth }
   * @param {number} [opts.narrowBreakpoint=760] - abaixo disso, só formas de canto
   * @param {number} [opts.parallaxStrength=26] - intensidade do parallax em px
   */
  function createShapeField(opts) {
    const field = document.getElementById(opts.containerId);
    if (!field) return;

    const narrowBreakpoint = opts.narrowBreakpoint || 760;
    const parallaxStrength = opts.parallaxStrength || 26;
    const isNarrow = window.innerWidth < narrowBreakpoint;

    const visibleLayout = isNarrow
      ? opts.layout.filter((item) => item.x <= 14 || item.x >= 86)
      : opts.layout;

    const frag = document.createDocumentFragment();
    const wraps = [];

    visibleLayout.forEach((item) => {
      const wrap = document.createElement("div");
      wrap.className = "shape-wrap";
      wrap.style.left = item.x + "%";
      wrap.style.top = item.y + "%";
      wrap.dataset.depth = item.depth;

      const inner = document.createElement("div");
      inner.className = "shape";
      const dur = (7 + Math.random() * 8).toFixed(1);
      const delay = (-Math.random() * dur).toFixed(1);
      const tx = (Math.random() * 26 - 13).toFixed(0);
      const ty = (Math.random() * 26 - 13).toFixed(0);
      const rot = (Math.random() * 16 - 8).toFixed(0);
      inner.style.setProperty("--dur", dur + "s");
      inner.style.setProperty("--delay", delay + "s");
      inner.style.setProperty("--tx", tx + "px");
      inner.style.setProperty("--ty", ty + "px");
      inner.style.setProperty("--rot", rot + "deg");

      const size = isNarrow ? Math.round(item.size * 0.65) : item.size;
      inner.innerHTML = icons[item.icon](size, item.color);
      inner.style.opacity = isNarrow ? 0.8 : 0.85;

      wrap.appendChild(inner);
      frag.appendChild(wrap);
      wraps.push(wrap);
    });

    field.appendChild(frag);

    // parallax suave com o mouse, relativo à janela inteira
    let rafId = null;
    let targetX = 0, targetY = 0;

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
      if (!rafId) rafId = requestAnimationFrame(applyParallax);
    });

    function applyParallax() {
      wraps.forEach((wrap) => {
        const depth = parseFloat(wrap.dataset.depth) || 0.6;
        const px = targetX * parallaxStrength * depth;
        const py = targetY * parallaxStrength * depth;
        wrap.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      });
      rafId = null;
    }
  }

  function initHeaderScroll() {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    window.addEventListener(
      "scroll",
      () => {
        header.style.boxShadow = window.scrollY > 8 ? "0 12px 28px rgba(2,4,16,0.35)" : "none";
      },
      { passive: true }
    );
  }

  return {
    icons,
    PALETTE,
    createShapeField,
    initHeaderScroll,
  };
})();