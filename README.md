# Painel de Reposição — Ricapet / Thapets (versão Vercel + Redis)

Este pacote adapta o painel de vendas/estoque para rodar no seu projeto Vercel,
usando Redis para guardar os dados de vendas e de estoque, em vez do
armazenamento interno do Claude. Assim, o link fica no seu próprio domínio e
funciona igual para qualquer pessoa da equipe, sem depender do Claude.

## Arquivos deste pacote

```
api/
  painel-vendas.js     -> endpoint GET/POST dos dados de vendas (unidades por produto/cor/medida/mês)
  painel-estoque.js    -> endpoint GET/POST do estoque, lead time e data da contagem
lib/
  redis.js             -> cliente Redis padrão (Upstash REST) — USADO pelas duas APIs acima
  redis-ioredis.js      -> alternativa caso vocês já usem ioredis (ver seção abaixo)
public/
  painel-estoque.html  -> o painel completo (upload, período, estoque, quantidade a comprar)
```

## Passo 1 — Descobrir se vocês já têm Redis configurado

No projeto Vercel, olhe em **Project Settings > Environment Variables**:

- Se existir `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` → ótimo, é
  exatamente o que os arquivos deste pacote já esperam. Pule para o Passo 2.
- Se existir só `REDIS_URL` (padrão do ioredis/Redis tradicional) → troque o
  arquivo `lib/redis.js` deste pacote pelo conteúdo de `lib/redis-ioredis.js`
  (leia os comentários dentro dele, tem 2 pequenos ajustes a fazer nos
  arquivos de `api/*.js` também, explicados no topo do arquivo).
- Se não existir nenhuma das duas → mais fácil é adicionar o **Upstash Redis**
  pelo Vercel Marketplace (Project > Storage > Create Database > Upstash for
  Redis). Ele já configura as variáveis de ambiente automaticamente.

## Passo 2 — Copiar os arquivos para o projeto

Copie as pastas `api/` e `lib/` deste pacote para a raiz do seu repositório
(mesclando com o que já existe lá, sem apagar nada). Copie
`public/painel-estoque.html` para a pasta onde seu projeto já serve arquivos
estáticos (geralmente `public/`).

## Passo 3 — Instalar a dependência do Redis

No terminal, dentro do seu projeto:

```bash
npm install @upstash/redis
```

(ou `npm install ioredis`, se optarem pela variante ioredis)

## Passo 4 — Deploy

```bash
git add .
git commit -m "Adiciona painel de reposição de estoque"
git push
```

A Vercel faz o deploy automático. Depois de pronto, o painel fica acessível em:

```
https://SEU-DOMINIO.vercel.app/painel-estoque.html
```

Compartilhe esse link com a equipe — todo mundo que abrir vê os mesmos dados
de vendas e de estoque, e qualquer atualização de qualquer pessoa aparece pra
todo mundo.

## Como funciona por baixo dos panos

- O botão "Processar e atualizar" (Passo 1) lê os dois relatórios `.xlsx` no
  próprio navegador (nenhum arquivo é enviado para nenhum servidor externo —
  só o resultado já processado, agregado por produto/cor/medida/mês, é
  enviado para `POST /api/painel-vendas`).
- Cada vez que alguém edita um campo de estoque ou o lead time (Passo 3), o
  painel salva automaticamente em `POST /api/painel-estoque` (com um pequeno
  atraso enquanto a pessoa digita, e imediatamente ao sair do campo).
- Ao abrir a página, ela busca os dados mais recentes em
  `GET /api/painel-vendas` e `GET /api/painel-estoque`. Se ainda não existir
  nada salvo (primeiro deploy), ela mostra os dados do último relatório que
  já processamos como ponto de partida.

## Segurança (importante)

Estes endpoints não têm autenticação — qualquer pessoa com o link consegue
ler e escrever os dados. Isso é intencional para manter a integração simples,
mas se o painel for exposto publicamente (não só para a equipe), considere
adicionar um cabeçalho de autenticação simples nos arquivos `api/*.js`
(por exemplo, comparar um token fixo enviado no header `Authorization` com
uma variável de ambiente). Posso ajudar a adicionar isso se for necessário.
