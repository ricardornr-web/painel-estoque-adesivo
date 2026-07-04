// lib/redis-ioredis.js
// ALTERNATIVA: use este arquivo (renomeado para redis.js) se o projeto já
// usa ioredis com uma instância Redis tradicional (não Upstash REST).
//
// Variável de ambiente necessária:
//   REDIS_URL   (ex: redis://default:senha@host:porta)
//
// Diferença de uso em relação ao redis.js (Upstash): o ioredis não
// serializa/deserializa JSON automaticamente, então os arquivos de
// api/*.js precisam usar JSON.stringify/JSON.parse ao salvar/ler.
// Os arquivos api/painel-vendas.js e api/painel-estoque.js deste pacote
// já foram escritos considerando o cliente Upstash (que serializa
// automaticamente). Se optarem por ioredis, ajustem essas duas linhas
// em cada arquivo de api:
//   await redis.set(KEY, body)              -> await redis.set(KEY, JSON.stringify(body))
//   const value = await redis.get(KEY)      -> const raw = await redis.get(KEY); const value = raw ? JSON.parse(raw) : null;

const Redis = require('ioredis');

let client = null;

function getRedis() {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('Falta a variável de ambiente REDIS_URL. Configure-a em Project Settings > Environment Variables na Vercel.');
    }
    client = new Redis(url);
  }
  return client;
}

module.exports = { getRedis };
