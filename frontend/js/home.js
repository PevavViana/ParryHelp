/* ============================================
   Taxatio — home.js
   Específico da página inicial. Usa as
   funções compartilhadas de common.js.
   ============================================ */
(function () {
  "use strict";

  const B = Taxatio.PALETTE;

  // layout aproximado do print original: cantos mais carregados,
  // meio mais limpo pra não brigar com o título
  const heroShapeLayout = [
    { icon: "circleFilled", x: 4, y: 20, size: 68, color: B.bright, depth: 0.5 },
    { icon: "circleFilled", x: 15, y: 30, size: 40, color: B.bright, depth: 0.7 },
    { icon: "triangleOutline", x: 12, y: 12, size: 22, color: B.faint, depth: 0.9 },
    { icon: "plus", x: 22, y: 18, size: 20, color: B.faint, depth: 1 },
    { icon: "circleOutline", x: 33, y: 10, size: 46, color: B.soft, depth: 0.4 },
    { icon: "diamond", x: 20, y: 27, size: 16, color: B.faint, depth: 1 },
    { icon: "asterisk", x: 41, y: 15, size: 18, color: B.faint, depth: 0.9 },
    { icon: "circleFilled", x: 55, y: 8, size: 26, color: B.bright, depth: 0.6 },
    { icon: "ring", x: 44, y: 4, size: 18, color: B.faint, depth: 0.9 },
    { icon: "triangleSmall", x: 8, y: 46, size: 22, color: B.soft, depth: 0.8 },
    { icon: "x", x: 15, y: 42, size: 26, color: B.soft, depth: 0.7 },
    { icon: "square", x: 15, y: 55, size: 22, color: B.faint, depth: 0.8 },
    { icon: "chevron", x: 7, y: 62, size: 20, color: B.faint, depth: 0.9 },
    { icon: "plane", x: 12, y: 68, size: 70, color: B.soft, depth: 0.35 },
    { icon: "chevron", x: 24, y: 82, size: 18, color: B.faint, depth: 1 },
    { icon: "plusThick", x: 71, y: 30, size: 30, color: B.soft, depth: 0.55 },
    { icon: "chevron", x: 87, y: 20, size: 20, color: B.faint, depth: 0.9 },
    { icon: "diamond", x: 76, y: 13, size: 14, color: B.faint, depth: 1 },
    { icon: "x", x: 84, y: 45, size: 24, color: B.soft, depth: 0.7 },
    { icon: "sparkle", x: 92, y: 42, size: 26, color: B.faint, depth: 0.85 },
    { icon: "square", x: 96, y: 12, size: 60, color: B.bright, depth: 0.45 },
    { icon: "x", x: 96, y: 60, size: 18, color: B.faint, depth: 1 },
    { icon: "plus", x: 71, y: 50, size: 18, color: B.faint, depth: 1 },
    { icon: "circleFilled", x: 87, y: 78, size: 78, color: B.bright, depth: 0.4 },
    { icon: "square", x: 65, y: 92, size: 40, color: B.soft, depth: 0.6 },
    { icon: "circleFilled", x: 75, y: 92, size: 16, color: B.bright, depth: 0.9 },
    { icon: "circleFilled", x: 75, y: 96, size: 16, color: B.bright, depth: 0.9 },
    { icon: "sparkle", x: 79, y: 90, size: 34, color: B.faint, depth: 0.6 },
    { icon: "ring", x: 62, y: 96, size: 18, color: B.faint, depth: 1 },
    { icon: "plus", x: 58, y: 84, size: 18, color: B.faint, depth: 1 },
    { icon: "diamond", x: 92, y: 92, size: 16, color: B.faint, depth: 1 },
    { icon: "dot", x: 51, y: 90, size: 8, color: B.faint, depth: 1.1 },
    { icon: "chevron", x: 33, y: 91, size: 16, color: B.faint, depth: 1 },
    { icon: "dot", x: 26, y: 62, size: 6, color: B.faint, depth: 1.1 },
  ];

  Taxatio.initHeaderScroll();
  Taxatio.createShapeField({ containerId: "shapeField", layout: heroShapeLayout });

  const cta = document.getElementById("ctaBtn");
  if (cta) {
    cta.addEventListener("click", () => {
      cta.style.transform = "scale(0.97)";
      setTimeout(() => (cta.style.transform = ""), 140);
    });
  }
})();