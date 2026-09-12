# Chat backend

The chat widget on the site talks to this Cloudflare Worker. Until it's deployed and the endpoint is filled in, the chat button doesn't render and the site behaves exactly as it did before.

## Why a backend exists at all

GitHub Pages serves static files. An API key placed anywhere in the page — in a script, in a data attribute, in an "obfuscated" string — is readable by every visitor, and would be scraped within days. The key therefore lives here as a Worker secret, and the browser only ever talks to this endpoint.

The same reasoning applies to the topic restriction. It's enforced in the system prompt, server-side. A check in the browser would stop nobody, because anyone can `curl` the endpoint directly and skip whatever the page does.

## Deploy

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

`wrangler deploy` prints a URL. Put it in `assets/js/chat-config.js`:

```js
window.DYLAN_CHAT = { endpoint: "https://dylan-guide-chat.<subdomain>.workers.dev" };
```

Commit that, and the chat appears on all fifteen pages.

If you serve the site from anywhere other than `https://tobno683.github.io`, update `ALLOWED_ORIGIN` in `wrangler.toml` to match.

## Cost — read this before going live

It defaults to **Claude Opus 5** ($5 per million input tokens, $25 per million output). Every visitor to a public site can use it, and you pay for all of it.

Three things already limit the damage:

| | |
|---|---|
| `max_tokens: 1024` | caps any single answer |
| `output_config.effort: "low"` | chat doesn't need deep reasoning; this is the documented cost lever |
| `cache_control` on the system prompt | the long system prompt is a stable prefix, so repeat traffic reads it from cache at a fraction of the price |

To cut the bill roughly fivefold, change one line in `src/index.ts`:

```ts
const MODEL = "claude-haiku-4-5";
```

Haiku 4.5 is $1/$5 per million. For a fan-site Q&A widget the quality difference is small; for a public endpoint the cost difference is not.

**Set a spend limit in the Anthropic console regardless.** That is the only hard backstop — everything else here is a speed bump.

## Rate limiting

`src/index.ts` has a per-IP limiter, but it lives in module scope, and Cloudflare runs many isolates — so it's a speed bump, not a quota. For a real limit, add a Cloudflare **Rate limiting rule** in the dashboard against the Worker's route. That runs at the edge, before your code, and costs nothing.

`ALLOWED_ORIGIN` is likewise not a security boundary. Browsers send `Origin` honestly; `curl` sends whatever it likes. It stops other *sites* embedding your endpoint, not determined abuse.

## What the endpoint does

`POST /` with `{ messages: [{role, content}, ...] }`, responds with Server-Sent Events:

```
data: {"text":"Nobody agrees, "}
data: {"text":"which is the honest answer."}
data: {"done":true}
```

Errors arrive as `data: {"error":"..."}` in the same stream.

The server trims history to the last 12 turns and 2000 characters per message before forwarding — the API is stateless, so the browser resends the conversation each turn, and without a cap that's an abuse vector.

## Local development

```bash
npx wrangler dev          # serves on http://127.0.0.1:8787
```

Point `chat-config.js` at that URL while testing. The widget's streaming client was developed against a mock server emitting the same SSE shape, so you can also test the front end without spending anything.
