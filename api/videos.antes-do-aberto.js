// GET: todos os vídeos e fotos do acervo (só a dona). POST { nome, tipo }: endereço para enviar um vídeo ou foto novo (vai para biblioteca/)
const { eDona } = require('./_porta');
const { envio, lista, PUBLICO } = require('./_r2');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!eDona(req)) return res.status(401).json({ error: 'só a dona' });
  try {
    if (req.method === 'GET') {
      const itens = (await lista()).filter((x) => /\.(mp4|mov|m4v|webm|jpe?g|png|webp|gif|avif|heic)$/i.test(x.chave)).sort((a, b) => b.data.localeCompare(a.data));
      return res.json(itens);
    }
    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const tipo = String(b.tipo || 'video/mp4').slice(0, 60);
      if (!/^(video|image)\//.test(tipo)) return res.status(400).json({ error: 'só foto ou vídeo' });
      const ext = (String(b.nome || '').match(/\.([a-z0-9]{2,5})$/i) || [, 'mp4'])[1].toLowerCase();
      const base = String(b.nome || 'video').replace(/\.[^.]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'video';
      const chave = `biblioteca/${base}-${Date.now().toString(36)}.${ext}`;
      return res.json({ envio: envio(chave, tipo), url: `${PUBLICO}/${chave}`, tipo });
    }
    res.status(405).end();
  } catch (e) { res.status(500).json({ error: String(e.message || e).slice(0, 200) }) }
};
