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
    bt.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
  }
  bt.addEventListener('click', troca);
  bt.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); troca() } });
})();
