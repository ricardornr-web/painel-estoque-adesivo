// api/painel-estoque.js
// GET  -> retorna o estoque atual (Ricapet + FULL por produto/cor/medida), o lead time e a data da contagem
// POST -> salva uma atualização de estoque (chamado sempre que alguém edita um campo do Passo 3)

const { getRedis } = require('../lib/redis');

const KEY = 'ricapet:painel:estoque';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    console.error('Erro ao conectar no Redis:', err);
    return res.status(500).json({ error: 'redis_config_error', message: err.message });
  }

  if (req.method === 'GET') {
    try {
      const value = await redis.get(KEY);
      if (!value) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ data: value });
    } catch (err) {
      console.error('Erro ao ler estoque:', err);
      return res.status(500).json({ error: 'redis_read_error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'missing_or_invalid_body' });
      }
      await redis.set(KEY, body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Erro ao salvar estoque:', err);
      return res.status(500).json({ error: 'redis_write_error' });
    }
  }

  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: 'method_not_allowed' });
};
