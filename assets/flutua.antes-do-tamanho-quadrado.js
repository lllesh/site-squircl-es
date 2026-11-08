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
  // modo joystick (depois do S): o ummbigo fica fixo lá embaixo, no meio; dá para puxar, mas ele sempre volta para esse ponto
  var joy = null; try { joy = JSON.parse(localStorage.getItem(CHAVE + '-joy') || 'null') } catch (e) {}
  function origemJoy() { var vh = window.visualViewport ? visualViewport.height : innerHeight, sp = b.querySelector('span'), meio = sp ? sp.offsetLeft + sp.offsetWidth / 2 : b.offsetWidth / 2; return limita(innerWidth / 2 - meio, vh - b.offsetHeight - 18) }
  function marcaJoy(v) { joy = v ? origemJoy() : null; try { localStorage.setItem(CHAVE + '-joy', joy ? JSON.stringify(joy) : 'null') } catch (e) {} }
  inicio(); if (joy) { joy = origemJoy(); pos = poe(joy.x, joy.y) }
  addEventListener('resize', function () { if (joy) { joy = origemJoy(); pos = poe(joy.x, joy.y) } else pos = poe(pos.x, pos.y) });
  var espera = setInterval(function () { if (document.querySelector('#grid .card')) { clearInterval(espera); var tem = null; try { tem = localStorage.getItem(CHAVE) } catch (e) {} if (!tem || emCimaDasLetras(pos)) pos = poe(linha(), 22) } }, 150);

  var arrastando = false, andou = 0, dx = 0, dy = 0, sx = 0, sy = 0, hist = [], anim = 0;
  b.addEventListener('pointerdown', function (e) {
    cancelAnimationFrame(anim); arrastando = true; andou = 0; sx = e.clientX; sy = e.clientY; hist = [[e.clientX, e.clientY, performance.now()]];
    var r = { left: parseFloat(b.style.left), top: parseFloat(b.style.top) }; dx = e.clientX - r.left; dy = e.clientY - r.top;
    b.setPointerCapture(e.pointerId); b.classList.add('segurando'); e.preventDefault();
  });
  b.addEventListener('pointermove', function (e) {
    if (!arrastando) return; andou = Math.max(andou, Math.hypot(e.clientX - sx, e.clientY - sy));
    hist.push([e.clientX, e.clientY, performance.now()]); if (hist.length > 6) hist.shift();
    if (andou > 2) {
      if (joy) { var ox = e.clientX - dx - joy.x, oy = e.clientY - dy - joy.y, d = Math.hypot(ox, oy) || 1, R = 120, k = R * Math.tanh(d / R) / d; pos = poe(joy.x + ox * k, joy.y + oy * k) }
      else pos = poe(e.clientX - dx, e.clientY - dy);
    }
  });
  function guarda() { try { localStorage.setItem(CHAVE, JSON.stringify(pos)) } catch (e) {} }
  // tocou no ummbigo: a tela escurece (overlay) e, vindo lá de baixo, aparece um squircle IGUALZINHO aos cartões da tela
  // (mesmo formato, mesmo tamanho). É nele que a pessoa dá entrada no que quer mandar: tocar abre a escolha de foto ou vídeo,
  // soltar um arquivo em cima envia. Tocar fora (no escuro) ou Esc: o squircle desce e o escuro some.
  var aberto = false, fundo = document.createElement('div');
  fundo.id = 'entrada';
  fundo.innerHTML = '<div class="card entrada" role="button" tabindex="0" aria-label="selecione foto ou vídeo"><div class="cover"><p>selecione<br>foto ou vídeo</p></div><div class="meta"><div class="name">enviar</div></div></div>';
  document.body.appendChild(fundo);
  var gr = fundo.querySelector('.entrada');
  function abre() {
    if (aberto) return; aberto = true; cancelAnimationFrame(anim);
    var c = document.querySelector('#grid .card'), cr = c ? c.getBoundingClientRect() : null;
    gr.style.width = (cr ? cr.width : Math.min(340, innerWidth - 44)) + 'px'; gr.style.height = (cr ? cr.height : Math.min(340, innerWidth - 44)) + 'px';
    fundo.classList.add('on');
    fundo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });
    gr.animate([
      { transform: 'translateY(' + (innerHeight * .75) + 'px) rotate(8deg) scale(.9)' },
      { transform: 'translateY(-26px) rotate(-2deg) scale(1.03)', offset: .6 },
      { transform: 'translateY(8px) rotate(.5deg)', offset: .82 },
      { transform: 'none' }
    ], { duration: 760, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  function fecha() {
    if (!aberto) return; aberto = false;
    gr.animate([{ transform: 'none' }, { transform: 'translateY(-14px)', offset: .25 }, { transform: 'translateY(' + (innerHeight * .8) + 'px) rotate(6deg) scale(.9)' }], { duration: 480, easing: 'cubic-bezier(.5,0,.75,0)' });
    var an = fundo.animate([{ opacity: 1 }, { opacity: 1, offset: .5 }, { opacity: 0 }], { duration: 480 });
    an.onfinish = function () { if (!aberto) fundo.classList.remove('on') };
  }
  gr.addEventListener('click', function (e) { e.stopPropagation(); if (!aberto) return; inp && inp.click(); fecha() });
  gr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gr.click() } });
  fundo.addEventListener('click', function (e) { if (e.target === fundo) fecha() });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') fecha() });
  fundo.addEventListener('dragover', function (e) { e.preventDefault(); e.stopPropagation() });
  fundo.addEventListener('drop', function (e) {
    if (!inp) return; e.preventDefault(); e.stopPropagation();
    try { var dt = new DataTransfer(); [].forEach.call(e.dataTransfer.files || [], function (f) { if (/^(video|image)\//.test(f.type)) dt.items.add(f) }); if (dt.files.length) { inp.files = dt.files; if (inp.onchange) inp.onchange() } } catch (x) {}
    fecha();
  });
  function solta() {
    if (!arrastando) return; arrastando = false; b.classList.remove('segurando');
    if (andou <= 2) { abre(); return }
    if (joy) {
      // joystick: solta e ele volta sozinho para o ponto de origem, com mola
      var jx = pos.x - joy.x, jy = pos.y - joy.y, j0 = performance.now();
      (function volta(t) {
        var q = (t - j0) / 1000, amort = Math.exp(-7 * q) * Math.cos(16 * q);
        pos = poe(joy.x + jx * amort, joy.y + jy * amort);
        if (q < 1.1) anim = requestAnimationFrame(volta); else { pos = poe(joy.x, joy.y); guarda() }
      })(j0);
      return;
    }
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
    var naCaixa = tit.dataset.caixa === '1' || document.documentElement.classList.contains('titulo-caixa');
    if (naCaixa || !l.offsetWidth) l = tit.querySelector('span.mostra') || tit; // na caixinha: vai para perto da caixinha
    var r = l.getBoundingClientRect(), sp = b.querySelector('span'), sr = sp.getBoundingClientRect(), br = b.getBoundingClientRect();
    var meio = (sr.left + sr.width / 2) - br.left; // o squircle fica um pouco à esquerda dentro da caixa
    if (aberto) return;
    // o S manda o ummbigo lá para baixo, no meio, logo em cima da barra de endereço
    // e a partir daí ele fica fixo ali, como um joystick
    if (!naCaixa && l === tit.lastElementChild) { marcaJoy(true); return vaiPara(joy.x, joy.y) }
    marcaJoy(false);
    var ay = r.top - b.offsetHeight - 26; if (ay < 8) ay = r.bottom + 26;
    vaiPara(r.left + r.width / 2 - meio, ay);
  });

  // o ummbigo fica para trás quando a página anda e depois vem correndo atrasado ("me esperem!"):
  // primeiro é levado junto com a página, espera um instantinho, e corre de volta ao lugar dando passinhos e se inclinando
  var atraso = 0, ultimoY = scrollY, parouEm = 0, correndo = 0, fase = 0;
  addEventListener('scroll', function () {
    var d = scrollY - ultimoY; ultimoY = scrollY; if (arrastando || aberto || joy) return;
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
