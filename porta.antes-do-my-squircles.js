/* A PORTA: a única página de entrar do site, no visual oficial (~/.claude/modelo/porta, soEntrar). E-mail + senha da dona (le@umbii.boo).
   Entrou uma vez, não aparece mais nada de senha em página nenhuma (a chave vale 30 dias).
   Roda no <head>, antes de tudo: enquanto não sabe se é a dona, o site fica escondido. */
(function () {
  var SB = 'https://gqeipjiidtrcbmnrnknc.supabase.co';
  var PUB = 'sb_publishable_5PMV1M5XkgU6xzdnwCcWgQ_xy-9fLLV';
  var DONA = 'le@umbii.boo';
  var SESSAO_SB = 'sb-gqeipjiidtrcbmnrnknc-auth-token';

  function le(k) { try { return localStorage.getItem(k) } catch (e) { return null } }
  function poe(k, v) { try { localStorage.setItem(k, v) } catch (e) {} }
  function tira(k) { try { localStorage.removeItem(k) } catch (e) {} }

  var chave = le('porta-chave');
  var vale = !!chave && +String(chave).split('.')[0] > Date.now();

  // LOGIN ÚNICO (meus.squircl.es, o perfil): entrou lá uma vez, vale aqui. Voltou de lá com a chave (#sso=…): usa;
  // ainda não perguntou nesta aba: pergunta lá, sem mostrar nada. Só se não der, aparece a página de entrar daqui.
  var sso = (location.hash.match(/[#&]sso=([^&]+)/) || [])[1];
  if (!vale && sso) {
    history.replaceState(null, '', location.pathname + location.search);
    document.documentElement.style.visibility = 'hidden';
    fetch('/api/porta', { method: 'POST', headers: { Authorization: 'Bearer ' + decodeURIComponent(sso) } })
      .then(function (r) { return r.json() })
      .then(function (j) { if (j.ok && j.chave) poe('porta-chave', j.chave); location.reload() })
      .catch(function () { location.reload() });
    return;
  }
  var tentou = false; try { tentou = sessionStorage.getItem('sso-tentou') === '1' } catch (e) {}
  if (!vale && !tentou && window.top === window) {
    try { sessionStorage.setItem('sso-tentou', '1') } catch (e) {}
    document.documentElement.style.visibility = 'hidden';
    location.replace('https://meus.squircl.es/sso?volta=' + encodeURIComponent(location.href)); // entrar é pelo perfil (meus.squircl.es)
    return;
  }

  // as travas antigas (senha numérica, Face ID, "só olhar") ficam abertas pra sempre: a porta já cuidou
  function abreTravas() {
    poe('sr1-chave', chave); poe('ish-gate', 'ok'); tira('ooooh-bio');
    try { sessionStorage.setItem('ooooh-unlocked', '1'); sessionStorage.removeItem('so-olhar') } catch (e) {}
  }

  var esconde = document.createElement('style');
  esconde.id = 'porta-esconde';
  esconde.textContent = 'html.porta-fechada body>*:not(#porta){display:none!important}html.porta-fechada,html.porta-fechada body{background:#FFFBF3!important;overflow:hidden!important}';
  document.head.appendChild(esconde);

  if (vale) {
    abreTravas();
    // confere no servidor sem atrapalhar; se a chave não vale mais, volta pra porta
    fetch('/api/porta', { headers: { 'x-edit-key': chave }, cache: 'no-store' }).then(function (r) { return r.json() }).then(function (j) {
      if (!j.ok) { tira('porta-chave'); tira('sr1-chave'); location.reload() }
    }).catch(function () {});
    // se sair da conta do Supabase em outra aba, fecha aqui também
    addEventListener('storage', function (e) { if (e.key === 'porta-chave' && !e.newValue) location.reload() });
    return;
  }

  tira('porta-chave'); tira('sr1-chave'); tira('ish-gate');
  document.documentElement.classList.add('porta-fechada');

  function tela() {
    if (document.getElementById('porta')) return;
    var css = document.createElement('style');
    css.textContent =
      '#porta{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:48px 24px;background:#FFFBF3;font-family:"Neulis","Figtree",system-ui,-apple-system,sans-serif;color:#8D96C1;overflow:auto}' +
      '#porta form{display:flex;flex-direction:column;align-items:center;width:min(340px,100%);margin:auto}' +
      '#porta img{width:104px;height:104px;display:block;margin:0 0 52px;border-radius:26px}' +
      '#porta label{align-self:stretch;margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:.32em;text-transform:uppercase;color:#C8C4B9;text-align:center}' +
      '#porta input{box-sizing:border-box;width:100%;margin:0 0 26px;font:inherit;font-size:17px;text-align:center;padding:15px 20px;border:1.5px solid #D6D4CE;border-radius:999px;background:#FFFBF3;color:#8D96C1;outline:none;-webkit-appearance:none}' +
      '#porta input:focus{border-color:#F48591}' +
      '#porta button{margin:10px 0 0;width:100%;font:600 12px/1 "Neulis","Figtree",system-ui,sans-serif;letter-spacing:.28em;text-transform:uppercase;padding:18px;border-radius:999px;border:0;background:#F48591;color:#FFFBF3;cursor:pointer}' +
      '#porta button:disabled{opacity:.6;cursor:default}' +
      '#porta p{margin:24px 0 0;min-height:1.4em;font-size:14px;color:#C18EA9;text-align:center}';
    document.head.appendChild(css);
    var box = document.createElement('div');
    box.id = 'porta';
    box.innerHTML =
      '<form autocomplete="on">' +
        '<img src="/pwa/icon-512.png" alt="">' +
        '<label for="porta-email">e-mail</label>' +
        '<input id="porta-email" type="email" autocomplete="username" required>' +
        '<label for="porta-senha">senha</label>' +
        '<input id="porta-senha" type="password" autocomplete="current-password" required>' +
        '<button type="submit">entrar</button>' +
        '<p role="status"></p>' +
      '</form>';
    document.body.appendChild(box);
    var f = box.querySelector('form'), em = box.querySelector('#porta-email'), se = box.querySelector('#porta-senha'),
        bt = box.querySelector('button'), msg = box.querySelector('p');
    em.focus();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = em.value.trim().toLowerCase();
      // qualquer pessoa cadastrada entra
      bt.disabled = true; msg.textContent = 'entrando…';
      fetch(SB + '/auth/v1/token?grant_type=password', {
        method: 'POST', headers: { apikey: PUB, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: se.value })
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j } }) }).then(function (x) {
        if (!x.ok || !x.j.access_token) throw 'senha';
        var s = x.j;
        if (!s.expires_at) s.expires_at = Math.floor(Date.now() / 1000) + (s.expires_in || 3600);
        poe(SESSAO_SB, JSON.stringify(s));
        return fetch('/api/porta', { method: 'POST', headers: { Authorization: 'Bearer ' + s.access_token } }).then(function (r) { return r.json() });
      }).then(function (j) {
        if (!j.ok || !j.chave) throw 'conta';
        chave = j.chave; poe('porta-chave', chave); abreTravas();
        location.reload();
      }).catch(function (err) {
        bt.disabled = false;
        msg.textContent = err === 'senha' ? 'e-mail ou senha errada' : err === 'conta' ? 'essa conta não tem acesso' : 'sem conexão, tenta de novo';
      });
    });
  }
  if (document.body) tela(); else document.addEventListener('DOMContentLoaded', tela);
})();
