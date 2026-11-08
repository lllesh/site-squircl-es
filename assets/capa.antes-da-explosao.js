/* a capa (entrada do site): quem entra no domínio vê só o fundo com a cor e o ummbigo grande no meio da tela
   (o título e o ummbigo são um ser só: um squircle com o pontinho). Clicou nele: ele amassa, dá um pulão girando,
   faz um arco e cai no lugar do ummbigo flutuante; a capa se abre num círculo, a trilha sobe em cascata
   e as letras do título caem lá em cima, uma por uma. */
(function () {
  var bt = document.getElementById('titulo'); if (!bt) return;
  var capa = document.createElement('div'); capa.id = 'capa';
  capa.innerHTML = '<button type="button" class="unico" aria-label="entrar"><span><i class="pontinho"></i></span></button>';
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
    var um = document.querySelector('#flutua span'), r = sp.getBoundingClientRect();
    var alvo = um ? um.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight - 60, width: 40, height: 40 };
    var dx = (alvo.left + alvo.width / 2) - (r.left + r.width / 2), dy = (alvo.top + alvo.height / 2) - (r.top + r.height / 2), k = alvo.width / r.width;
    var sobe = -Math.min(260, innerHeight * .3);
    // 1) amassa  2) pulão para cima girando e crescendo  3) arco até o ummbigo, encolhendo  4) cai amassando e assenta
    sp.animate([
      { transform: 'none' },
      { transform: 'scale(1.25, .72)', offset: .1 },
      { transform: 'translate(0,' + sobe + 'px) rotate(-200deg) scale(1.2)', offset: .36 },
      { transform: 'translate(' + dx * .55 + 'px,' + (sobe * .6 + dy * .3) + 'px) rotate(-330deg) scale(' + Math.max(k, .45) + ')', offset: .58 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(-360deg) scale(' + k * 1.35 + ',' + k * .7 + ')', offset: .8 },
      { transform: 'translate(' + dx + 'px,' + (dy - 10) + 'px) rotate(-360deg) scale(' + k * .9 + ',' + k * 1.15 + ')', offset: .9 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(-360deg) scale(' + k + ')' }
    ], { duration: 1500, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
    // a capa se abre num círculo que nasce do ummbigo
    var cx = alvo.left + alvo.width / 2, cy = alvo.top + alvo.height / 2, R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 20;
    setTimeout(function () {
      document.documentElement.classList.remove('com-capa');
      var anel = document.createElement('div'); anel.className = 'anel'; anel.style.left = cx + 'px'; anel.style.top = cy + 'px'; document.body.appendChild(anel);
      anel.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(4)', opacity: 0 }], { duration: 900, easing: 'ease-out' }).onfinish = function () { anel.remove() };
      if (um) um.parentElement.animate([{ scale: '1.6' }, { scale: '.85', offset: .5 }, { scale: '1' }], { duration: 600, easing: 'cubic-bezier(.3,.7,.4,1)' });
      capa.animate([{ clipPath: 'circle(' + R + 'px at ' + cx + 'px ' + cy + 'px)' }, { clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)' }], { duration: 900, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' }).onfinish = function () { capa.remove() };
      sp.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' });
      // a trilha sobe em cascata
      [].forEach.call(document.querySelectorAll('#grid .card'), function (c, i) {
        c.animate([{ translate: '0 120px', opacity: 0, scale: '.85' }, { translate: '0 -12px', opacity: 1, scale: '1.02', offset: .7 }, { translate: '0 0', opacity: 1, scale: '1' }], { duration: 800, delay: 120 + Math.min(i, 8) * 90, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' });
      });
      // as letras do título caem lá em cima, uma por uma
      [].forEach.call(bt.children, function (l, i) {
        if (!l.offsetWidth) return;
        l.animate([{ translate: '0 -160px', rotate: (i % 2 ? 25 : -25) + 'deg', opacity: 0 }, { translate: '0 10px', rotate: '0deg', opacity: 1, offset: .65 }, { translate: '0 -6px', offset: .82 }, { translate: '0 0', rotate: '0deg', opacity: 1 }], { duration: 760, delay: 250 + i * 110, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' });
      });
    }, 1380);
  }
})();
