/* o título VIDS: cada toque troca o fundo para a próxima cor da paleta (fica lembrado neste aparelho) */
(function () {
  var CORES = ['#000000', '#F48591', '#FA8D85', '#FEA283', '#FFB872', '#8DA599', '#8D96C1', '#C18EA9', '#D6D4CE', '#C8C4B9', '#FFFBF3'];
  var root = document.documentElement, bt = document.getElementById('titulo');
  function aplica(c) {
    var escuro = c === '#000000';
    root.style.setProperty('--bg', c);
    root.style.setProperty('--bg-2', escuro ? '#262626' : 'color-mix(in srgb, ' + c + ' 78%, #000)');
    root.style.setProperty('--ink', escuro ? '#FFFBF3' : '#000000');
    root.style.setProperty('--ink-soft', escuro ? '#FFFBF3' : 'rgba(0,0,0,.72)');
    root.style.setProperty('--line', escuro ? 'rgba(255,251,243,.3)' : 'rgba(0,0,0,.18)');
    root.style.setProperty('--quadro', escuro ? '#FFFBF3' : '#000000');
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', c);
  }
  var cor = '#000000'; try { cor = localStorage.getItem('vids-cor') || '#000000' } catch (e) {}
  if (CORES.indexOf(cor) < 0) cor = '#000000'; aplica(cor);
  function troca() {
    cor = CORES[(CORES.indexOf(cor) + 1) % CORES.length]; aplica(cor);
    try { localStorage.setItem('vids-cor', cor) } catch (e) {}
    // o título pula bem alto: cada letra salta, uma depois da outra (onda), estica no ar e amassa ao cair
    [].forEach.call(bt.querySelectorAll('span'), function (l, i) {
      l.animate([
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(6px) scale(1.12, .84)', offset: .12 },
        { transform: 'translateY(-62px) scale(.9, 1.12)', offset: .45 },
        { transform: 'translateY(0) scale(1.14, .82)', offset: .72 },
        { transform: 'translateY(-10px) scale(.97, 1.04)', offset: .86 },
        { transform: 'translateY(0) scale(1, 1)' }
      ], { duration: 760, delay: i * 70, easing: 'cubic-bezier(.3,.7,.4,1)' });
    });
  }
  bt.addEventListener('click', troca);
  bt.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); troca() } });
})();
