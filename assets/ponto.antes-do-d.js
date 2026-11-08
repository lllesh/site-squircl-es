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
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', c);
  }
  var cor = '#000000'; try { cor = localStorage.getItem('vids-cor') || '#000000' } catch (e) {}
  if (CORES.indexOf(cor) < 0) cor = '#000000'; aplica(cor);
  // cor da letra (o I troca): preto, creme (#FFFBF3) e os dois cinzas da paleta; sem escolha, fica a automática do fundo
  var LETRAS = ['#000000', '#FFFBF3', '#D6D4CE', '#C8C4B9'], letra = null; try { letra = localStorage.getItem('vids-letra') } catch (e) {}
  function aplicaLetra() { if (LETRAS.indexOf(letra) < 0) return; root.style.setProperty('--ink', letra); root.style.setProperty('--ink-soft', letra) }
  aplicaLetra();
  // cada letra do título faz uma coisa: V troca a cor do fundo, I troca a cor da letra, D e S a Dra Lê ainda vai definir
  function troca(e) {
    var qual = e && e.target, l = qual && qual.closest ? qual.closest('#titulo span') : null;
    var n = l ? [].indexOf.call(bt.children, l) : 0;
    if (n === 0) {
      cor = CORES[(CORES.indexOf(cor) + 1) % CORES.length]; aplica(cor); aplicaLetra();
      try { localStorage.setItem('vids-cor', cor) } catch (e) {}
    } else if (n === 1) {
      var agora = LETRAS.indexOf(letra) >= 0 ? letra : getComputedStyle(root).getPropertyValue('--ink').trim().toUpperCase();
      letra = LETRAS[(LETRAS.indexOf(agora) + 1) % LETRAS.length]; aplicaLetra();
      try { localStorage.setItem('vids-letra', letra) } catch (e) {}
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
