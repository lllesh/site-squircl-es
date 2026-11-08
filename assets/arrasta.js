/* todo squircle é arrastável e desliza: os cartões, as letras do título e o squircle de envio.
   Apertou: ele cresce (sente o toque). Arrastou: vai junto com o dedo. Soltou: sai deslizando com o impulso e volta
   para o lugar dele com mola (eles moram numa grade, então sempre voltam). Tocar sem arrastar continua fazendo o que fazia.
   No celular, deslizar para cima/baixo rola a página; para arrastar em qualquer direção é só segurar um instantinho antes. */
(function () {
  var SEL = '#grid .card, #titulo span, #entrada .card.entrada, #menus .minion, #menu-painel .card';
  var el = null, x0 = 0, y0 = 0, andou = 0, ativo = false, hist = [], segura = 0, soltouArrastado = false;
  function acha(t) { return t && t.closest ? t.closest(SEL) : null }
  function poe(e, x, y) { e.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px' }
  function comeca() { ativo = true; el.classList.add('arrastando') }
  document.addEventListener('pointerdown', function (e) {
    var a = acha(e.target); if (!a || e.button > 0) return;
    if (a._volta) cancelAnimationFrame(a._volta);
    el = a; x0 = e.clientX; y0 = e.clientY; andou = 0; ativo = false; hist = [[e.clientX, e.clientY, performance.now()]];
    el.classList.add('apertado');
    if (e.pointerType === 'mouse') comeca(); else segura = setTimeout(function () { if (el && andou < 8) { comeca(); if (navigator.vibrate) navigator.vibrate(8) } }, 220);
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (!el) return; andou = Math.max(andou, Math.hypot(e.clientX - x0, e.clientY - y0));
    hist.push([e.clientX, e.clientY, performance.now()]); if (hist.length > 6) hist.shift();
    if (!ativo && e.pointerType !== 'mouse' && andou > 8 && Math.abs(e.clientX - x0) > Math.abs(e.clientY - y0)) comeca(); // de lado: arrasta na hora
    if (ativo && andou > 3) poe(el, e.clientX - x0, e.clientY - y0);
  }, true);
  document.addEventListener('touchmove', function (e) { if (el && ativo) e.preventDefault() }, { passive: false });
  function larga(e, cancelou) {
    if (!el) return; clearTimeout(segura); var a = el; el = null; a.classList.remove('apertado', 'arrastando');
    if (!ativo || andou <= 3) { a.style.translate = ''; return }
    soltouArrastado = true; setTimeout(function () { soltouArrastado = false }, 60);
    // sai deslizando com o impulso e volta para o lugar com mola
    var p = hist[0], z = hist[hist.length - 1], dt = Math.max(16, z[2] - p[2]);
    var vx = cancelou ? 0 : (z[0] - p[0]) / dt, vy = cancelou ? 0 : (z[1] - p[1]) / dt;
    var sx = (z[0] - x0), sy = (z[1] - y0), t0 = performance.now();
    (function volta(t) {
      var q = (t - t0) / 1000, am = Math.exp(-5.5 * q);
      var x = (sx * Math.cos(13 * q) + vx * 90 * Math.sin(13 * q)) * am, y = (sy * Math.cos(13 * q) + vy * 90 * Math.sin(13 * q)) * am;
      poe(a, x, y); if (q < 1.3) a._volta = requestAnimationFrame(volta); else { a.style.translate = ''; a._volta = 0 }
    })(t0);
  }
  document.addEventListener('pointerup', function (e) { larga(e, false) }, true);
  document.addEventListener('pointercancel', function (e) { larga(e, true) }, true);
  // arrastou: o clique que vem depois não conta (não copia link, não troca cor, não abre nada)
  document.addEventListener('click', function (e) { if (soltouArrastado && acha(e.target)) { e.stopPropagation(); e.preventDefault(); soltouArrastado = false } }, true);
})();
