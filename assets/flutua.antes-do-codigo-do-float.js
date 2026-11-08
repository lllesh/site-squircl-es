/* o "+" flutuando (como a bonequinha do x.squircl.es/float): passeia devagar na lateral, dá para arrastar para qualquer lugar
   (fica lembrado neste aparelho) e um toque abre a escolha dos vídeos */
(function () {
  var b = document.getElementById('flutua'), inp = document.getElementById('arquivos'); if (!b) return;
  var pos = null; try { pos = JSON.parse(localStorage.getItem('vids-flutua-e') || 'null') } catch (e) {}
  function poe(x, y) {
    x = Math.max(8, Math.min(innerWidth - b.offsetWidth - 8, x)); y = Math.max(8, Math.min(innerHeight - b.offsetHeight - 8, y));
    b.style.left = x + 'px'; b.style.top = y + 'px'; return { x: x, y: y };
  }
  // estacionado em cima à esquerda, alinhado com a borda esquerda da linha dos cartões
  function linha() { var g = document.getElementById('grid'); if (!g) return 22; var c = g.querySelector('.card'); if (c) return Math.round(c.getBoundingClientRect().left); var cs = getComputedStyle(g); return Math.round(g.getBoundingClientRect().left + parseFloat(cs.paddingLeft)) }
  function inicio() { pos = pos ? poe(pos.x, pos.y) : poe(linha(), 22) }
  var espera = setInterval(function () { if (document.querySelector('#grid .card')) { clearInterval(espera); if (!localStorage.getItem('vids-flutua-e')) { pos = null; inicio() } } }, 150);
  inicio(); addEventListener('resize', inicio);
  var arrastando = false, andou = 0, dx = 0, dy = 0, sx = 0, sy = 0;
  b.addEventListener('pointerdown', function (e) {
    arrastando = true; andou = 0; sx = e.clientX; sy = e.clientY; var r = b.getBoundingClientRect(); dx = e.clientX - r.left; dy = e.clientY - r.top;
    b.setPointerCapture(e.pointerId); b.classList.add('segurando');
  });
  b.addEventListener('pointermove', function (e) {
    if (!arrastando) return; andou = Math.max(andou, Math.hypot(e.clientX - sx, e.clientY - sy));
    if (andou > 4) pos = poe(e.clientX - dx, e.clientY - dy);
  });
  function solta() {
    if (!arrastando) return; arrastando = false; b.classList.remove('segurando');
    if (andou > 4) { try { localStorage.setItem('vids-flutua-e', JSON.stringify(pos)) } catch (e) {} }
    else if (inp) inp.click();
  }
  b.addEventListener('pointerup', solta); b.addEventListener('pointercancel', function () { arrastando = false; b.classList.remove('segurando') });
  b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp && inp.click() } });
})();
