/* a capa (entrada do site): quem entra no domínio vê só o fundo com a cor e o squircle unitário no meio da tela.
   Clicou nele: o squircle voa para o lugar do título, a capa some e a trilha (os vídeos) aparece. */
(function () {
  var bt = document.getElementById('titulo'); if (!bt) return;
  var capa = document.createElement('div'); capa.id = 'capa';
  capa.innerHTML = '<button type="button" class="unico" aria-label="entrar"><span>V</span></button>';
  document.body.appendChild(capa);
  var un = capa.querySelector('.unico'), sp = un.querySelector('span');
  document.documentElement.classList.add('com-capa');
  sp.animate([{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .6 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: 'cubic-bezier(.3,.7,.4,1)' });
  // o squircle da capa também sente o toque (cresce quando aperta) e é arrastável, com impulso ao soltar;
  // tocar sem arrastar é que entra no site
  var foi = false, tx = 0, ty = 0, pega = null, hist = [], anim = 0;
  un.style.touchAction = 'none';
  function mexe(x, y) {
    var r = sp.getBoundingClientRect(), bx = r.left - tx, by = r.top - ty;
    tx = Math.max(-bx, Math.min(innerWidth - r.width - bx, x)); ty = Math.max(-by, Math.min(innerHeight - r.height - by, y));
    un.style.translate = tx + 'px ' + ty + 'px';
  }
  un.addEventListener('pointerdown', function (e) {
    if (foi) return; cancelAnimationFrame(anim); un.setPointerCapture(e.pointerId); e.preventDefault();
    pega = { x: e.clientX, y: e.clientY, tx: tx, ty: ty, andou: 0 }; hist = [[e.clientX, e.clientY, performance.now()]];
    un.classList.add('apertado');
  });
  un.addEventListener('pointermove', function (e) {
    if (!pega) return; pega.andou = Math.max(pega.andou, Math.hypot(e.clientX - pega.x, e.clientY - pega.y));
    hist.push([e.clientX, e.clientY, performance.now()]); if (hist.length > 6) hist.shift();
    if (pega.andou > 3) mexe(pega.tx + e.clientX - pega.x, pega.ty + e.clientY - pega.y);
  });
  function larga(e) {
    if (!pega) return; var p = pega; pega = null; un.classList.remove('apertado');
    if (p.andou <= 3) return entra();
    var a = hist[0], z = hist[hist.length - 1], dt = Math.max(16, z[2] - a[2]), vx = (z[0] - a[0]) / dt * 1000, vy = (z[1] - a[1]) / dt * 1000;
    var x0 = tx, y0 = ty, x1 = tx + vx * 1.2, y1 = ty + vy * 1.2, t0 = performance.now();
    (function passo(t) { var k = 1 - Math.exp(-(t - t0) / 1100); mexe(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); if (k < .995) anim = requestAnimationFrame(passo) })(t0);
  }
  un.addEventListener('pointerup', larga);
  un.addEventListener('pointercancel', function () { pega = null; un.classList.remove('apertado') });
  un.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entra() } });
  function entra() {
    if (foi) return; foi = true; cancelAnimationFrame(anim);
    document.documentElement.classList.remove('com-capa');
    var alvo = (bt.querySelector('span.mostra') || bt.querySelector('span')).getBoundingClientRect(), r = sp.getBoundingClientRect();
    var dx = (alvo.left + alvo.width / 2) - (r.left + r.width / 2), dy = (alvo.top + alvo.height / 2) - (r.top + r.height / 2), k = alvo.width / r.width;
    sp.animate([
      { transform: 'none' }, { transform: 'scale(.88)', offset: .15 }, { transform: 'scale(1.12)', offset: .35 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')' }
    ], { duration: 760, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
    var an = capa.animate([{ backgroundColor: getComputedStyle(capa).backgroundColor }, { backgroundColor: getComputedStyle(capa).backgroundColor, offset: .55 }, { backgroundColor: 'transparent' }], { duration: 760, fill: 'forwards' });
    an.onfinish = function () { capa.remove(); [].forEach.call(bt.children, function (l, i) { if (l.offsetWidth) l.animate([{ transform: 'none' }, { transform: 'translateY(-14px) scale(1.12)', offset: .4 }, { transform: 'none' }], { duration: 480, delay: i * 70, easing: 'cubic-bezier(.3,.7,.4,1)' }) }) };
  }
})();
