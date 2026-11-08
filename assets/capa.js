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
  // entrar é imediato: tocou, ele cresce na hora (sente o toque), explode de alegria (uma chuva de squircles e pontinhos
  // da paleta voando para todo lado), a capa some e ele voa pequenininho para o lugar do ummbigo flutuante
  var PALETA = ['#F48591', '#FA8D85', '#FEA283', '#FFB872', '#8DA599', '#8D96C1', '#C18EA9', '#FFFBF3'];
  function entra() {
    if (foi) return; foi = true; cancelAnimationFrame(anim);
    var fl = document.getElementById('flutua'); if (fl) fl.style.visibility = 'hidden'; // o ummbigo só aparece quando ele pousar
    var um = document.querySelector('#flutua span'), r = sp.getBoundingClientRect();
    var alvo = um ? um.getBoundingClientRect() : { left: innerWidth / 2 - 20, top: innerHeight - 70, width: 40, height: 40 };
    var cx0 = r.left + r.width / 2, cy0 = r.top + r.height / 2;
    var dx = (alvo.left + alvo.width / 2) - cx0, dy = (alvo.top + alvo.height / 2) - cy0, k = alvo.width / r.width;
    sp.animate([
      { transform: 'none' },
      { transform: 'scale(1.55)', offset: .16 },
      { transform: 'scale(1.35) rotate(8deg)', offset: .26 },
      { transform: 'translate(' + dx * .4 + 'px,' + (dy * .4 - 120) + 'px) rotate(-120deg) scale(.7)', offset: .55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(-360deg) scale(' + k * 1.3 + ',' + k * .75 + ')', offset: .85 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(-360deg) scale(' + k + ')' }
    ], { duration: 950, easing: 'cubic-bezier(.3,.6,.3,1)', fill: 'forwards' });
    setTimeout(function () {
      // a explosão de alegria
      for (var i = 0; i < 26; i++) {
        var p = document.createElement('i'), tam = 10 + Math.random() * 26, ang = Math.random() * Math.PI * 2, dist = 140 + Math.random() * Math.max(innerWidth, innerHeight) * .45;
        p.className = 'confete' + (i % 3 ? ' sq' : ''); p.style.width = p.style.height = tam + 'px'; p.style.left = cx0 + 'px'; p.style.top = cy0 + 'px';
        p.style.background = PALETA[i % PALETA.length]; document.body.appendChild(p);
        p.animate([
          { transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + Math.cos(ang) * dist + 'px), calc(-50% + ' + Math.sin(ang) * dist + 'px)) scale(1) rotate(' + (Math.random() * 540 - 270) + 'deg)', opacity: 1, offset: .7 },
          { transform: 'translate(calc(-50% + ' + Math.cos(ang) * dist * 1.1 + 'px), calc(-50% + ' + (Math.sin(ang) * dist * 1.1 + 60) + 'px)) scale(.6)', opacity: 0 }
        ], { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.1,.8,.3,1)' }).onfinish = (function (q) { return function () { q.remove() } })(p);
      }
      document.documentElement.classList.remove('com-capa');
      capa.style.background = 'transparent'; capa.style.pointerEvents = 'none';
      capa.animate([{ backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg') }, { backgroundColor: 'rgba(0,0,0,0)' }], { duration: 380, easing: 'ease-out' });
      // a trilha sobe em cascata e as letras do título caem lá em cima, uma por uma
      [].forEach.call(document.querySelectorAll('#grid .card'), function (c, i) {
        c.animate([{ translate: '0 120px', opacity: 0, scale: '.85' }, { translate: '0 -12px', opacity: 1, scale: '1.02', offset: .7 }, { translate: '0 0', opacity: 1, scale: '1' }], { duration: 750, delay: Math.min(i, 8) * 80, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' });
      });
      [].forEach.call(bt.children, function (l, i) {
        if (!l.offsetWidth) return;
        l.animate([{ translate: '0 -160px', rotate: (i % 2 ? 25 : -25) + 'deg', opacity: 0 }, { translate: '0 10px', rotate: '0deg', opacity: 1, offset: .65 }, { translate: '0 -6px', offset: .82 }, { translate: '0 0', rotate: '0deg', opacity: 1 }], { duration: 700, delay: 120 + i * 100, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' });
      });
    }, 150);
    // pousou no lugar do ummbigo: o ummbigo aparece dando um pulinho e sai um anel
    setTimeout(function () {
      var cx = alvo.left + alvo.width / 2, cy = alvo.top + alvo.height / 2;
      var anel = document.createElement('div'); anel.className = 'anel'; anel.style.left = cx + 'px'; anel.style.top = cy + 'px'; document.body.appendChild(anel);
      anel.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(3)', opacity: 0 }], { duration: 700, easing: 'ease-out' }).onfinish = function () { anel.remove() };
      if (um) um.parentElement.animate([{ scale: '1.6' }, { scale: '.85', offset: .5 }, { scale: '1' }], { duration: 550, easing: 'cubic-bezier(.3,.7,.4,1)' });
      if (fl) fl.style.visibility = '';
      capa.remove();
    }, 930);
  }
})();
