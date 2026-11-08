/* squircle desenhado no tamanho exato de cada peça (sem esticar): cantos de superelipse com o arredondado da imagem da
   Dra Lê (n = 3,5). Peças quadradas (letras do VIDS, o "+") = o squircle inteiro; cartões = retângulo com esses cantos. */
(function () {
  var N = 3.52, PASSOS = 14;
  function caminho(w, h, f) {
    var r = Math.min(w, h) * f, e = 2 / N, p = [];
    function canto(cx, cy, a0) { for (var i = 0; i <= PASSOS; i++) { var t = a0 + (Math.PI / 2) * i / PASSOS, c = Math.cos(t), s = Math.sin(t); p.push((cx + r * Math.sign(c) * Math.pow(Math.abs(c), e)).toFixed(1) + ' ' + (cy + r * Math.sign(s) * Math.pow(Math.abs(s), e)).toFixed(1)) } }
    canto(w - r, r, -Math.PI / 2); canto(w - r, h - r, 0); canto(r, h - r, Math.PI / 2); canto(r, r, Math.PI);
    return "path('M" + p.join(' L') + "Z')";
  }
  var PECAS = [['#titulo span', .5], ['#flutua span', .5], ['.card', .3], ['.card .cover', .26]];
  function aplica(el, f) { var w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return; var k = w + 'x' + h; if (el.__sq === k) return; el.__sq = k; el.style.webkitMask = 'none'; el.style.mask = 'none'; el.style.clipPath = caminho(w, h, f) }
  var ro = window.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (x) { aplica(x.target, x.target.__f) }) }) : null;
  function tudo() { PECAS.forEach(function (pc) { document.querySelectorAll(pc[0]).forEach(function (el) { if (el.__f == null) { el.__f = pc[1]; ro && ro.observe(el) } aplica(el, pc[1]) }) }) }
  tudo(); new MutationObserver(tudo).observe(document.getElementById('grid') || document.body, { childList: true, subtree: true });
  addEventListener('load', tudo); addEventListener('resize', tudo);
})();
