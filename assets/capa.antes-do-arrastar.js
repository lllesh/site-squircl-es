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
  var foi = false;
  un.addEventListener('click', function () {
    if (foi) return; foi = true;
    document.documentElement.classList.remove('com-capa');
    var alvo = (bt.querySelector('span.mostra') || bt.querySelector('span')).getBoundingClientRect(), r = sp.getBoundingClientRect();
    var dx = (alvo.left + alvo.width / 2) - (r.left + r.width / 2), dy = (alvo.top + alvo.height / 2) - (r.top + r.height / 2), k = alvo.width / r.width;
    sp.animate([
      { transform: 'none' }, { transform: 'scale(.88)', offset: .15 }, { transform: 'scale(1.12)', offset: .35 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')' }
    ], { duration: 760, easing: 'cubic-bezier(.5,0,.2,1)', fill: 'forwards' });
    var an = capa.animate([{ backgroundColor: getComputedStyle(capa).backgroundColor }, { backgroundColor: getComputedStyle(capa).backgroundColor, offset: .55 }, { backgroundColor: 'transparent' }], { duration: 760, fill: 'forwards' });
    an.onfinish = function () { capa.remove(); [].forEach.call(bt.children, function (l, i) { if (l.offsetWidth) l.animate([{ transform: 'none' }, { transform: 'translateY(-14px) scale(1.12)', offset: .4 }, { transform: 'none' }], { duration: 480, delay: i * 70, easing: 'cubic-bezier(.3,.7,.4,1)' }) }) };
  });
})();
