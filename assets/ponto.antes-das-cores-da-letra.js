/* o título VIDS: cada toque troca o fundo para a próxima cor da paleta (fica lembrado neste aparelho) */
(function () {
  var CORES = ['#000000', '#F48591', '#FA8D85', '#FEA283', '#FFB872', '#8DA599', '#8D96C1', '#C18EA9', '#D6D4CE', '#C8C4B9', '#FFFBF3'];
  var root = document.documentElement, bt = document.getElementById('titulo');
  function aplica(c) {
    var escuro = c === '#000000';
    root.style.setProperty('--bg', c);
    root.style.setProperty('--bg-2', escuro ? '#262626' : c === '#FFB872' ? 'color-mix(in srgb, #FFB872 55%, #FA8D85)' : 'color-mix(in srgb, ' + c + ' 78%, #000)'); // no amarelo, escurecer com preto dava um mostarda feio: o cartão fica num tom da própria paleta
    root.style.setProperty('--ink', escuro ? '#FFFBF3' : '#000000');
    root.style.setProperty('--ink-soft', escuro ? '#FFFBF3' : 'rgba(0,0,0,.72)');
    root.style.setProperty('--line', escuro ? 'rgba(255,251,243,.3)' : 'rgba(0,0,0,.18)');
    root.style.setProperty('--quadro', escuro ? '#FFFBF3' : '#000000');
    // o alto da tela do iPhone (onde ficam a hora e a bateria) pega a cor do fundo: troca a etiqueta inteira, senão o Safari guarda a cor velha
    var m = document.querySelector('meta[name="theme-color"]'), n = document.createElement('meta'); n.name = 'theme-color'; n.content = c;
    if (m) m.remove(); document.head.appendChild(n);
    // o Safari novo pinta o alto da tela com a cor do fundo da página: a cor vai direto no html e no body, sem transição,
    // senão ele pega a cor velha (era o rosa que ficava lá em cima)
    root.style.backgroundColor = c; if (document.body) document.body.style.backgroundColor = c;
  }
  var cor = '#000000'; try { cor = localStorage.getItem('vids-cor') || '#000000' } catch (e) {}
  if (CORES.indexOf(cor) < 0) cor = '#000000'; aplica(cor);
  // cor da letra (o I troca): preto, creme (#FFFBF3) e os dois cinzas da paleta; sem escolha, fica a automática do fundo
  var LETRAS = ['#000000', '#FFFBF3', '#D6D4CE', '#C8C4B9'], letra = null; try { letra = localStorage.getItem('vids-letra') } catch (e) {}
  function aplicaLetra() { if (LETRAS.indexOf(letra) < 0) return; root.style.setProperty('--ink', letra); root.style.setProperty('--ink-soft', letra) }
  aplicaLetra();
  try { if (localStorage.getItem('vids-titulo-em-cima')) root.classList.add('titulo-em-cima') } catch (e) {}
  // o D vai trocando o jeito do título: normal (4 letras) → grudado lá em cima → uma caixinha só.
  // Na caixinha as letras não fazem mais nada: cada clique só troca a letra (V, I, D, S) e, depois do S,
  // o título volta a ser as 4 letrinhas (é só nelas que dá para escolher as outras coisas)
  var caixa = -1; try { var c0 = localStorage.getItem('vids-caixa'); if (c0 !== null && c0 !== '') { caixa = +c0; mostraCaixa() } } catch (e) {}
  function mostraCaixa() {
    root.classList.toggle('titulo-caixa', caixa >= 0);
    [].forEach.call(bt.children, function (s, k) { s.classList.toggle('mostra', k === caixa) });
    try { localStorage.setItem('vids-caixa', caixa >= 0 ? String(caixa) : '') } catch (e) {}
  }
  function pula(el) { el.getAnimations().forEach(function (x) { x.cancel() }); el.animate([{ transform: 'scale(.4) rotate(-12deg)' }, { transform: 'scale(1.25) rotate(4deg)', offset: .55 }, { transform: 'scale(.95)', offset: .8 }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.3,.7,.4,1)' }) }
  // cada letra do título faz uma coisa: V troca a cor do fundo, I troca a cor da letra, D troca o jeito do título, S leva o ummbigo lá para baixo
  function troca(e) {
    var qual = e && e.target, l = qual && qual.closest ? qual.closest('#titulo span') : null;
    var n = l ? [].indexOf.call(bt.children, l) : 0;
    bt.dataset.caixa = caixa >= 0 ? '1' : '';
    if (caixa >= 0) { caixa = caixa + 1 > 3 ? -1 : caixa + 1; mostraCaixa(); if (caixa >= 0) pula(bt.children[caixa]); else [].forEach.call(bt.children, pula); return }
    if (n === 0) {
      cor = CORES[(CORES.indexOf(cor) + 1) % CORES.length]; aplica(cor); aplicaLetra();
      try { localStorage.setItem('vids-cor', cor) } catch (e) {}
    } else if (n === 1) {
      var agora = LETRAS.indexOf(letra) >= 0 ? letra : getComputedStyle(root).getPropertyValue('--ink').trim().toUpperCase();
      letra = LETRAS[(LETRAS.indexOf(agora) + 1) % LETRAS.length]; aplicaLetra();
      try { localStorage.setItem('vids-letra', letra) } catch (e) {}
    } else if (n === 2) {
      // o D sobe o título lá para cima da tela, com um respiro, e deixa ele grudado lá
      var topo = document.querySelector('.top'), antes = bt.getBoundingClientRect().top;
      if (root.classList.contains('titulo-em-cima')) {
        // já estava em cima: desce e vira uma caixinha só, começando no V
        root.classList.remove('titulo-em-cima'); try { localStorage.setItem('vids-titulo-em-cima', '') } catch (e) {}
        caixa = 0; mostraCaixa(); pula(bt.children[0]); return;
      }
      var cima = true; root.classList.add('titulo-em-cima');
      try { localStorage.setItem('vids-titulo-em-cima', cima ? '1' : '') } catch (e) {}
      var depois = bt.getBoundingClientRect().top;
      topo.animate([{ transform: 'translateY(' + (antes - depois) + 'px)' }, { transform: 'translateY(' + (cima ? -10 : 10) + 'px)', offset: .75 }, { transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.3,.7,.4,1)' });
    }
    // só a letra que foi clicada fica enorme e volta
    if (!l) return;
    l.style.position = 'relative'; l.getAnimations().forEach(function (x) { x.cancel() });
    l.animate([
      { transform: 'scale(1)', zIndex: 90 },
      { transform: 'scale(3.6)', zIndex: 90, offset: .42 },
      { transform: 'scale(3.6)', zIndex: 90, offset: .55 },
      { transform: 'scale(.9)', zIndex: 90, offset: .82 },
      { transform: 'scale(1)', zIndex: 90 }
    ], { duration: 820, easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  bt.addEventListener('click', troca);
  bt.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); troca({ target: bt.querySelector('span') }) } });
})();
