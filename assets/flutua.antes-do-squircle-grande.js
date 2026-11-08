/* o "+" com o MESMO código da bonequinha do x.squircl.es/float (Framer):
   - a caixa (90 : 70 da imagem) gira 360° a cada 4 s, linear, sem parar (loop) — a imagem fica deslocada dentro dela
     (sobra de 20/90 à direita), então anda em roda pela tela enquanto gira;
   - mouse em cima: cresce 1.1 com mola (stiffness 400, damping 30); segurando: cursor "grabbing";
   - arrasta e solta com impulso (dragMomentum: power 0.8, timeConstant 700 ms), sem sair da tela;
   - toque sem arrastar abre a escolha dos vídeos. Estacionado em cima à esquerda, na linha dos cartões. */
(function () {
  var b = document.getElementById('flutua'), inp = document.getElementById('arquivos'); if (!b) return;
  var CHAVE = 'vids-ummbigo-g', pos = null; try { pos = JSON.parse(localStorage.getItem(CHAVE) || 'null') } catch (e) {}
  function limita(x, y) { return { x: Math.max(0, Math.min(innerWidth - b.offsetWidth, x)), y: Math.max(0, Math.min(innerHeight - b.offsetHeight, y)) } }
  function poe(x, y) { var p = limita(x, y); b.style.left = p.x + 'px'; b.style.top = p.y + 'px'; return p }
  function linha() { var c = document.querySelector('#grid .card'); if (c) return Math.round(c.getBoundingClientRect().left); var g = document.getElementById('grid'); return g ? Math.round(g.getBoundingClientRect().left + parseFloat(getComputedStyle(g).paddingLeft)) : 22 }
  // o ummbigo nunca começa em cima das letras do título: se o lugar guardado cair em cima delas, volta para o cantinho de cima
  function emCimaDasLetras(p) { var t = document.getElementById('titulo'); if (!t || !p) return false; var r = t.getBoundingClientRect(), m = 30; return p.x + b.offsetWidth > r.left - m && p.x < r.right + m && p.y + b.offsetHeight > r.top - m && p.y < r.bottom + m }
  function inicio() { pos = pos && !emCimaDasLetras(pos) ? poe(pos.x, pos.y) : poe(linha(), 22) }
  inicio(); addEventListener('resize', function () { pos = poe(pos.x, pos.y) });
  var espera = setInterval(function () { if (document.querySelector('#grid .card')) { clearInterval(espera); var tem = null; try { tem = localStorage.getItem(CHAVE) } catch (e) {} if (!tem || emCimaDasLetras(pos)) pos = poe(linha(), 22) } }, 150);

  var arrastando = false, andou = 0, dx = 0, dy = 0, sx = 0, sy = 0, hist = [], anim = 0;
  b.addEventListener('pointerdown', function (e) {
    if (aberto) { arrastando = true; andou = 0; e.preventDefault(); return }
    cancelAnimationFrame(anim); arrastando = true; andou = 0; sx = e.clientX; sy = e.clientY; hist = [[e.clientX, e.clientY, performance.now()]];
    var r = { left: parseFloat(b.style.left), top: parseFloat(b.style.top) }; dx = e.clientX - r.left; dy = e.clientY - r.top;
    b.setPointerCapture(e.pointerId); b.classList.add('segurando'); e.preventDefault();
  });
  b.addEventListener('pointermove', function (e) {
    if (!arrastando || aberto) return; andou = Math.max(andou, Math.hypot(e.clientX - sx, e.clientY - sy));
    hist.push([e.clientX, e.clientY, performance.now()]); if (hist.length > 6) hist.shift();
    if (andou > 2) pos = poe(e.clientX - dx, e.clientY - dy);
  });
  function guarda() { try { localStorage.setItem(CHAVE, JSON.stringify(pos)) } catch (e) {} }
  // tocou no ummbigo: ele sente o toque e fica ENORME no meio da tela (quase a largura toda) e FICA grande,
  // porque é dentro dele que o vídeo/foto vai entrar. Grande: tocar nele abre a escolha, soltar um arquivo em cima envia.
  // Tocar fora dele (ou Esc) faz ele voltar a ser pequenininho.
  var aberto = false, grande = null;
  function abre() {
    if (aberto) return; aberto = true; cancelAnimationFrame(anim); b.classList.add('gigante');
    var sp = b.querySelector('span'), r = sp.getBoundingClientRect(), bx = b.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    b.style.transformOrigin = (cx - bx.left) + 'px ' + (cy - bx.top) + 'px';
    var S = Math.min(innerWidth * .88, innerHeight * .8) / sp.offsetWidth, tx = innerWidth / 2 - cx, ty = innerHeight / 2 - cy;
    var no = tx + 'px ' + ty + 'px';
    grande = [{ scale: String(S), translate: no }];
    b.animate([
      { scale: '1.5', translate: '0 0' },
      { scale: '1.7 1.2', translate: '0 4px', offset: .1 },
      { scale: String(S * 1.07), translate: no, offset: .55 },
      { scale: String(S * .97), translate: no, offset: .78 },
      { scale: String(S), translate: no }
    ], { duration: 820, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
  }
  function fecha() {
    if (!aberto) return; aberto = false;
    b.getAnimations().forEach(function (x) { if (x.effect && x.effect.getKeyframes && x.effect.getKeyframes().some(function (k) { return k.scale })) x.cancel() });
    var an = b.animate(grande.concat([{ scale: '.85', translate: '0 0', offset: .8 }, { scale: '1', translate: '0 0' }]), { duration: 560, easing: 'cubic-bezier(.3,.7,.4,1)' });
    an.onfinish = an.oncancel = function () { if (!aberto) { b.classList.remove('gigante'); b.style.transformOrigin = '' } };
  }
  document.addEventListener('pointerdown', function (e) { if (aberto && !b.contains(e.target)) fecha() }, true);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') fecha() });
  b.addEventListener('dragover', function (e) { if (aberto) { e.preventDefault(); e.stopPropagation() } });
  b.addEventListener('drop', function (e) {
    if (!aberto || !inp) return; e.preventDefault(); e.stopPropagation();
    try { var dt = new DataTransfer(); [].forEach.call(e.dataTransfer.files || [], function (f) { if (/^video\//.test(f.type)) dt.items.add(f) }); if (dt.files.length) { inp.files = dt.files; inp.dispatchEvent(new Event('change')); if (inp.onchange) inp.onchange() } } catch (x) {}
    fecha();
  });
  function solta() {
    if (!arrastando) return; arrastando = false; b.classList.remove('segurando');
    if (andou <= 2 || aberto) { if (!aberto) abre(); else { inp && inp.click(); fecha() } return }
    // impulso (igual ao dragMomentum do Framer): alvo = posição + velocidade × 0.8, chegando em ~700 ms
    var a = hist[0], z = hist[hist.length - 1], dt = Math.max(16, z[2] - a[2]);
    var vx = (z[0] - a[0]) / dt * 1000, vy = (z[1] - a[1]) / dt * 1000;
    var x0 = pos.x, y0 = pos.y, fim = limita(x0 + vx * 1.2, y0 + vy * 1.2), t0 = performance.now();
    (function passo(t) {
      var k = 1 - Math.exp(-(t - t0) / 1100);
      pos = poe(x0 + (fim.x - x0) * k, y0 + (fim.y - y0) * k);
      if (k < .995) anim = requestAnimationFrame(passo); else guarda();
    })(t0);
  }
  b.addEventListener('pointerup', solta);
  b.addEventListener('pointercancel', function () { arrastando = false; b.classList.remove('segurando') });
  // clicou numa letra do título: o ummbigo vem pulando para pertinho dela (logo acima da letra);
  // clicou em outra, ele pula para perto da outra
  var tit = document.getElementById('titulo');
  function vaiPara(ax, ay) {
    if (arrastando) return; cancelAnimationFrame(anim);
    var x0 = pos.x, y0 = pos.y, fim = limita(ax, ay), t0 = performance.now(), D = 520;
    var alto = Math.min(90, 30 + Math.hypot(fim.x - x0, fim.y - y0) / 5);
    (function passo(t) {
      var k = Math.min(1, (t - t0) / D), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      pos = poe(x0 + (fim.x - x0) * e, y0 + (fim.y - y0) * e);
      b.style.translate = '0 ' + (-4 * alto * k * (1 - k)).toFixed(1) + 'px';
      if (k < 1) anim = requestAnimationFrame(passo); else { b.style.translate = ''; guarda() }
    })(t0);
  }
  if (tit) tit.addEventListener('click', function (e) {
    var l = e.target && e.target.closest ? e.target.closest('#titulo span') : null; if (!l) return;
    var r = l.getBoundingClientRect(), sp = b.querySelector('span'), sr = sp.getBoundingClientRect(), br = b.getBoundingClientRect();
    var meio = (sr.left + sr.width / 2) - br.left; // o squircle fica um pouco à esquerda dentro da caixa
    if (aberto) return;
    // o S manda o ummbigo lá para baixo, no meio, logo em cima da barra de endereço
    if (l === tit.lastElementChild) { var vh = window.visualViewport ? visualViewport.height : innerHeight; return vaiPara(innerWidth / 2 - meio, vh - b.offsetHeight - 18) }
    var ay = r.top - b.offsetHeight - 26; if (ay < 8) ay = r.bottom + 26;
    vaiPara(r.left + r.width / 2 - meio, ay);
  });

  // o ummbigo fica para trás quando a página anda e depois vem correndo atrasado ("me esperem!"):
  // primeiro é levado junto com a página, espera um instantinho, e corre de volta ao lugar dando passinhos e se inclinando
  var atraso = 0, ultimoY = scrollY, parouEm = 0, correndo = 0, fase = 0;
  addEventListener('scroll', function () {
    var d = scrollY - ultimoY; ultimoY = scrollY; if (arrastando || aberto) return;
    atraso = Math.max(-260, Math.min(260, atraso - d)); parouEm = performance.now();
    if (!correndo) correndo = requestAnimationFrame(corre);
  }, { passive: true });
  function corre(t) {
    if (t - parouEm > 140) atraso *= 0.9; // percebeu que ficou para trás: sai correndo
    var longe = Math.abs(atraso) > 1.5;
    fase += 0.45;
    var passo = longe && t - parouEm > 140 ? Math.abs(Math.sin(fase)) * Math.min(12, Math.abs(atraso) / 6 + 4) : 0;
    var inclina = longe ? (atraso > 0 ? -1 : 1) * Math.min(14, Math.abs(atraso) / 8) + Math.sin(fase) * 4 : 0;
    b.style.marginTop = (atraso - passo).toFixed(1) + 'px';
    b.style.rotate = inclina.toFixed(1) + 'deg';
    if (longe) correndo = requestAnimationFrame(corre); else { atraso = 0; b.style.marginTop = ''; b.style.rotate = ''; correndo = 0 }
  }
  b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp && inp.click() } });
})();
