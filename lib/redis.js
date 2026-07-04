// lib/redis.js
// Cliente Redis usando Upstash (REST) — funciona bem em Vercel Functions
// porque não precisa manter conexão TCP aberta entre chamadas.
//
// Variáveis de ambiente necessárias no projeto Vercel:
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN
//
// Se vocês já usam Upstash (integração via Vercel Marketplace), essas
// variáveis normalmente já existem no projeto automaticamente.
//
// Se descobrirem que já usam outro cliente (ioredis, node-redis), troquem
// este arquivo pelo conteúdo de lib/redis-ioredis.js (renomeando para redis.js).

const { Redis } = require('@upstash/redis');

let client = null;

function getRedis() {
  if (!client) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        'Faltam as variáveis de ambiente UPSTASH_REDIS_REST_URL e/ou UPSTASH_REDIS_REST_TOKEN. ' +
        'Configure-as em Project Settings > Environment Variables na Vercel.'
      );
    }
    client = new Redis({ url, token });
  }
  return client;
}

module.exports = { getRedis };
