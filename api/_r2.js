// Cloudflare R2 (bucket veenus-videos, público em videos.veenus.love): assinatura S3 (SigV4) para listar e para enviar
const crypto = require('crypto');
const CONTA = process.env.R2_ACCOUNT_ID, ID = process.env.R2_ACCESS_KEY_ID, SEGREDO = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET || 'veenus-videos', PUBLICO = process.env.R2_PUBLIC || 'https://videos.veenus.love';
const host = `${CONTA}.r2.cloudflarestorage.com`;
const h = (k, s) => crypto.createHmac('sha256', k).update(s).digest();
const hex = (s) => crypto.createHash('sha256').update(s).digest('hex');
const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
function tempo() { const agora = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); return { agora, dia: agora.slice(0, 8) } }
function chaveAss(dia) { return h(h(h(h('AWS4' + SEGREDO, dia), 'auto'), 's3'), 'aws4_request') }

// endereço de envio de uso único (15 min): o arquivo vai direto do computador para o R2
function envio(chave, tipo) {
  const { agora, dia } = tempo(), escopo = `${dia}/auto/s3/aws4_request`;
  const caminho = '/' + BUCKET + '/' + chave.split('/').map(enc).join('/');
  const q = { 'X-Amz-Algorithm': 'AWS4-HMAC-SHA256', 'X-Amz-Credential': `${ID}/${escopo}`, 'X-Amz-Date': agora, 'X-Amz-Expires': '900', 'X-Amz-SignedHeaders': 'content-type;host' };
  const qs = Object.keys(q).sort().map((k) => `${enc(k)}=${enc(q[k])}`).join('&');
  const canon = ['PUT', caminho, qs, `content-type:${tipo}\nhost:${host}\n`, 'content-type;host', 'UNSIGNED-PAYLOAD'].join('\n');
  const texto = ['AWS4-HMAC-SHA256', agora, escopo, hex(canon)].join('\n');
  return `https://${host}${caminho}?${qs}&X-Amz-Signature=${crypto.createHmac('sha256', chaveAss(dia)).update(texto).digest('hex')}`;
}

// lista tudo o que está no bucket (de 1000 em 1000)
async function lista() {
  const itens = []; let token = '';
  do {
    const { agora, dia } = tempo(), escopo = `${dia}/auto/s3/aws4_request`;
    const q = { 'list-type': '2', 'max-keys': '1000' }; if (token) q['continuation-token'] = token;
    const qs = Object.keys(q).sort().map((k) => `${enc(k)}=${enc(q[k])}`).join('&');
    const ph = hex('');
    const canon = ['GET', '/' + BUCKET, qs, `host:${host}\nx-amz-content-sha256:${ph}\nx-amz-date:${agora}\n`, 'host;x-amz-content-sha256;x-amz-date', ph].join('\n');
    const texto = ['AWS4-HMAC-SHA256', agora, escopo, hex(canon)].join('\n');
    const ass = crypto.createHmac('sha256', chaveAss(dia)).update(texto).digest('hex');
    const r = await fetch(`https://${host}/${BUCKET}?${qs}`, { headers: { 'x-amz-date': agora, 'x-amz-content-sha256': ph, Authorization: `AWS4-HMAC-SHA256 Credential=${ID}/${escopo}, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=${ass}` } });
    const xml = await r.text(); if (!r.ok) throw new Error(xml.slice(0, 200));
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const pega = (t) => ((m[1].match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || '');
      const chave = pega('Key').replace(/&amp;/g, '&');
      itens.push({ chave, tamanho: +pega('Size'), data: pega('LastModified'), url: PUBLICO + '/' + chave.split('/').map(enc).join('/') });
    }
    token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? ((xml.match(/<NextContinuationToken>([^<]+)</) || [])[1] || '') : '';
  } while (token);
  return itens;
}
module.exports = { envio, lista, PUBLICO };
