// POST: recebe o login do Supabase (e-mail + senha já conferidos lá), confere o plano e devolve a chave do site
// GET: diz se a chave ainda vale
const { DONA, DIAS, novaChave, eDona } = require('./_porta');
const URL_BASE = process.env.SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.json({ ok: eDona(req) });
  if (req.method !== 'POST') return res.status(405).end();
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ ok: false });
  try {
    const r = await fetch(`${URL_BASE}/auth/v1/user`, { headers: { apikey: SERVICE, Authorization: `Bearer ${token}` } });
    const u = r.ok ? await r.json() : null;
    if (!u || !u.email) return res.status(403).json({ ok: false });
    // plano: entra quem tem o plano que este site pede (hoje todo site pede Platinum e ninguém tem: só a dona)
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0].toLowerCase();
    const p = await fetch(`${URL_BASE}/rest/v1/rpc/pode_entrar`, {
      method: 'POST',
      headers: { apikey: SERVICE, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Profile': 'plataforma' },
      body: JSON.stringify({ dominio: host }),
    });
    if (!p.ok || (await p.json()) !== true) return res.status(403).json({ ok: false });
    const chave = novaChave();
    res.setHeader('Set-Cookie', `porta=${encodeURIComponent(chave)}; Path=/; Max-Age=${DIAS * 86400}; HttpOnly; Secure; SameSite=Lax`);
    res.json({ ok: true, chave });
  } catch (e) { res.status(500).json({ ok: false }) }
};
