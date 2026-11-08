/* o "+" com o MESMO código da bonequinha do x.squircl.es/float (Framer):
   - a caixa (90 : 70 da imagem) gira 360° a cada 4 s, linear, sem parar (loop) — a imagem fica deslocada dentro dela
     (sobra de 20/90 à direita), então anda em roda pela tela enquanto gira;
   - mouse em cima: cresce 1.1 com mola (stiffness 400, damping 30); segurando: cursor "grabbing";
   - arrasta e solta com impulso (dragMomentum: power 0.8, timeConstant 700 ms), sem sair da tela;
   - toque sem arrastar abre a escolha dos vídeos. Estacionado em cima à esquerda, na linha dos cartões. */
(function () {
  var b = document.getElementById('flutua'), inp = document.getElementById('arquivos'); if (!b) return;
  var CHAVE = 'vids-flutua-e2', pos = null; try { pos = JSON.parse(localStorage.getItem(CHAVE) || 'null') } catch (e) {}
  function limita(x, y) { return { x: Math.max(0, Math.min(innerWidth - b.offsetWidth, x)), y: Math.max(0, Math.min(innerHeight - b.offsetHeight, y)) } }
  function poe(x, y) { var p = limita(x, y); b.style.left = p.x + 'px'; b.style.top = p.y + 'px'; return p }
  function linha() { var c = document.querySelector('#grid .card'); if (c) return Math.round(c.getBoundingClientRect().left); var g = document.getElementById('grid'); return g ? Math.round(g.getBoundingClientRect().left + parseFloat(getComputedStyle(g).paddingLeft)) : 22 }
  function inicio() { pos = pos ? poe(pos.x, pos.y) : poe(linha(), 22) }
  inicio(); addEventListener('resize', function () { pos = poe(pos.x, pos.y) });
  var espera = setInterval(function () { if (document.querySelector('#grid .card')) { clearInterval(espera); var tem = null; try { tem = localStorage.getItem(CHAVE) } catch (e) {} if (!tem) pos = poe(linha(), 22) } }, 150);

  var arrastando = false, andou = 0, dx = 0, dy = 0, sx = 0, sy = 0, hist = [], anim = 0;
  b.addEventListener('pointerdown', function (e) {
    cancelAnimationFrame(anim); arrastando = true; andou = 0; sx = e.clientX; sy = e.clientY; hist = [[e.clientX, e.clientY, performance.now()]];
    var r = { left: parseFloat(b.style.left), top: parseFloat(b.style.top) }; dx = e.clientX - r.left; dy = e.clientY - r.top;
    b.setPointerCapture(e.pointerId); b.classList.add('segurando'); e.preventDefault();
  });
  b.addEventListener('pointermove', function (e) {
    if (!arrastando) return; andou = Math.max(andou, Math.hypot(e.clientX - sx, e.clientY - sy));
    hist.push([e.clientX, e.clientY, performance.now()]); if (hist.length > 6) hist.shift();
    if (andou > 3) pos = poe(e.clientX - dx, e.clientY - dy);
  });
  function guarda() { try { localStorage.setItem(CHAVE, JSON.stringify(pos)) } catch (e) {} }
  function solta() {
    if (!arrastando) return; arrastando = false; b.classList.remove('segurando');
    if (andou <= 3) { if (inp) inp.click(); return }
    // impulso (igual ao dragMomentum do Framer): alvo = posição + velocidade × 0.8, chegando em ~700 ms
    var a = hist[0], z = hist[hist.length - 1], dt = Math.max(16, z[2] - a[2]);
    var vx = (z[0] - a[0]) / dt * 1000, vy = (z[1] - a[1]) / dt * 1000;
    var x0 = pos.x, y0 = pos.y, fim = limita(x0 + vx * 0.8, y0 + vy * 0.8), t0 = performance.now();
    (function passo(t) {
      var k = 1 - Math.exp(-(t - t0) / 700);
      pos = poe(x0 + (fim.x - x0) * k, y0 + (fim.y - y0) * k);
      if (k < .995) anim = requestAnimationFrame(passo); else guarda();
    })(t0);
  }
  b.addEventListener('pointerup', solta);
  b.addEventListener('pointercancel', function () { arrastando = false; b.classList.remove('segurando') });
  // susto: quando clicam no título e as letras crescem, o "+" leva um susto (pula e treme) e foge para o lado
  var tit = document.getElementById('titulo');
  if (tit) tit.addEventListener('click', function () {
    if (arrastando) return; cancelAnimationFrame(anim);
    setTimeout(function () {
      b.animate([
        { translate: '0 0' }, { translate: '0 -22px', offset: .18 }, { translate: '-5px -18px', offset: .3 }, { translate: '5px -14px', offset: .42 },
        { translate: '-4px -8px', offset: .54 }, { translate: '3px -3px', offset: .66 }, { translate: '0 0' }
      ], { duration: 650, easing: 'ease-out' });
      var lado = pos.x + b.offsetWidth + 130 <= innerWidth ? 1 : -1;
      var x0 = pos.x, y0 = pos.y, fim = limita(x0 + lado * 130, y0), t0 = performance.now();
      (function passo(t) {
        var k = 1 - Math.exp(-(t - t0) / 260);
        pos = poe(x0 + (fim.x - x0) * k, y0 + (fim.y - y0) * k);
        if (k < .995) anim = requestAnimationFrame(passo); else guarda();
      })(t0);
    }, 120);
  });
  b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp && inp.click() } });
})();
