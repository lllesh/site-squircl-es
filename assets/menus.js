/* os quatro menus do ummbigo (o chefe da galera; os squircles são a turma dele).
   Tocar no ummbigo: a tela escurece e quatro squircles saem pulando dele em cruz — cima, baixo, esquerda e direita.
   Puxar o joystick para um lado abre direto o menu daquele lado. Tocar fora (ou Esc) fecha.
   Por enquanto: cima = ENVIAR (o squircle de envio); os outros três usam o Lorem Ipsum da Dra Lê até ela dizer o que são. */
(function () {
  var MENUS = {
    cima: { nome: 'enviar', faz: function () { window.ummbigoEnviar && window.ummbigoEnviar() } },
    esquerda: { nome: 'lorem', texto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    direita: { nome: 'ipsum', texto: 'Sed ut ultrices orci. Sed sed consectetur erat.' },
    baixo: { nome: 'dolor', texto: 'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.' }
  };
  var LUGAR = { cima: [0, -1], baixo: [0, 1], esquerda: [-1, 0], direita: [1, 0] };
  var tela = document.createElement('div'); tela.id = 'menus';
  tela.innerHTML = '<div class="chefe"><i class="pontinho"></i></div>' + Object.keys(MENUS).map(function (k) { return '<button type="button" class="minion" data-lado="' + k + '"><span>' + MENUS[k].nome + '</span></button>' }).join('');
  document.body.appendChild(tela);
  var painel = document.createElement('div'); painel.id = 'menu-painel';
  painel.innerHTML = '<div class="card entrada"><div class="cover"><p></p></div><div class="meta"><div class="name"></div></div></div>';
  document.body.appendChild(painel);
  var aberto = false;
  function distancia() { return Math.min(innerWidth, innerHeight) * .3 }
  function abre() {
    if (aberto) return; aberto = true; tela.classList.add('on');
    tela.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    var d = distancia();
    tela.querySelector('.chefe').animate([{ transform: 'translate(-50%,-50%) scale(.2)' }, { transform: 'translate(-50%,-50%) scale(1.25)', offset: .6 }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 520, easing: 'cubic-bezier(.3,.7,.4,1)' });
    [].forEach.call(tela.querySelectorAll('.minion'), function (m, i) {
      var l = LUGAR[m.dataset.lado], x = l[0] * d, y = l[1] * d;
      m.style.left = 'calc(50% + ' + x + 'px)'; m.style.top = 'calc(50% + ' + y + 'px)';
      m.animate([
        { transform: 'translate(calc(-50% - ' + x + 'px), calc(-50% - ' + y + 'px)) scale(.1) rotate(-90deg)' },
        { transform: 'translate(-50%,-50%) scale(1.2) rotate(8deg)', offset: .65 },
        { transform: 'translate(-50%,-50%) scale(.95) rotate(-3deg)', offset: .85 },
        { transform: 'translate(-50%,-50%)' }
      ], { duration: 620, delay: 60 + i * 70, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' });
    });
  }
  function fecha(depois) {
    if (!aberto) { depois && depois(); return } aberto = false;
    [].forEach.call(tela.querySelectorAll('.minion'), function (m) { m.animate([{ transform: 'translate(-50%,-50%)' }, { transform: 'translate(-50%,-50%) scale(.1)', opacity: 0 }], { duration: 260, easing: 'ease-in' }) });
    var an = tela.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280 });
    an.onfinish = function () { if (!aberto) tela.classList.remove('on'); depois && depois() };
  }
  function abrePainel(k) {
    var m = MENUS[k]; if (!m) return;
    if (m.faz) return m.faz();
    var c = document.querySelector('#grid .card'), w = c ? c.getBoundingClientRect().width : Math.min(340, innerWidth - 44), card = painel.querySelector('.card');
    card.style.width = card.style.height = w + 'px';
    painel.querySelector('p').textContent = m.texto; painel.querySelector('.name').textContent = m.nome;
    painel.classList.add('on');
    painel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    card.animate([{ transform: 'translateY(' + innerHeight * .75 + 'px) rotate(8deg) scale(.9)' }, { transform: 'translateY(-26px) rotate(-2deg) scale(1.03)', offset: .6 }, { transform: 'translateY(8px)', offset: .82 }, { transform: 'none' }], { duration: 760, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  function fechaPainel() {
    if (!painel.classList.contains('on')) return;
    var card = painel.querySelector('.card');
    card.animate([{ transform: 'none' }, { transform: 'translateY(-14px)', offset: .25 }, { transform: 'translateY(' + innerHeight * .8 + 'px) rotate(6deg) scale(.9)' }], { duration: 480, easing: 'cubic-bezier(.5,0,.75,0)' });
    painel.animate([{ opacity: 1 }, { opacity: 1, offset: .5 }, { opacity: 0 }], { duration: 480 }).onfinish = function () { painel.classList.remove('on') };
  }
  tela.addEventListener('click', function (e) {
    var m = e.target.closest && e.target.closest('.minion');
    if (m) { var k = m.dataset.lado; m.animate([{ scale: '1' }, { scale: '1.35' }, { scale: '1' }], { duration: 300 }); return fecha(function () { abrePainel(k) }) }
    fecha();
  });
  painel.addEventListener('click', function (e) { if (e.target === painel) fechaPainel() });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { fecha(); fechaPainel() } });
  window.ummbigoMenus = { abre: abre, fecha: fecha, direcao: function (k) { fecha(); abrePainel(k) } };
})();
