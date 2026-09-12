# Chat backend

`api/chat.ts` is a **Cloudflare Pages Function**. It deploys automatically with the site — Cloudflare builds from this repo on every push to `master`, so there is no separate deploy step and no CLI to run.

It is served at `/api/chat` on the site's own origin, which means no CORS configuration and no endpoint URL to keep in sync.

## Why a server side exists at all

Pages serves static files. An API key placed anywhere in the page — in a script, a data attribute, an "obfuscated" string — is readable by every visitor and would be scraped within days. The key therefore lives as an encrypted secret on the Pages project, and only this function reads it.

The same reasoning drives the topic restriction. It is enforced here, in the system prompt. A check in the browser would stop nobody, because anyone can POST to `/api/chat` directly and skip whatever the page does.

## The secret

Cloudflare dashboard → **Workers & Pages** → `bob-dylan-guide` → **Settings** → **Variables and secrets**:

| Type | Name |
|---|---|
| Secret | `ANTHROPIC_API_KEY` |

Secrets are write-only once saved — you rotate rather than recover. If the function reports *"Chat is not configured yet"*, the binding is missing or misnamed.

## Cost — read before leaving it public

Defaults to **Claude Opus 5** ($5 per million input tokens, $25 per million output). Anyone who finds the site can spend your money.

Three things limit the damage:

| | |
|---|---|
| `max_tokens: 1024` | caps any single answer |
| `output_config.effort: "low"` | chat isn't reasoning-heavy; the documented cost lever |
| `cache_control` on the system prompt | the long stable prefix is read from cache on repeat traffic |

To cut it roughly fivefold, change one line in `api/chat.ts`:

```ts
const MODEL = "claude-haiku-4-5";
```

**Set a spend limit in the Anthropic console regardless.** That is the only hard backstop; everything else here is a speed bump.

## Rate limiting

There is a per-IP limiter in the function, but it lives in module scope and Cloudflare runs many isolates — a speed bump, not a quota. For a real limit, add a **Rate limiting rule** in the Cloudflare dashboard against `/api/chat`. That runs at the edge, before this code, and costs nothing.

## The endpoint

`POST /api/chat` with `{ messages: [{role, content}, ...] }`, responding with Server-Sent Events:

```
data: {"text":"Nobody agrees, "}
data: {"text":"which is the honest answer."}
data: {"done":true}
```

Errors arrive as `data: {"error":"..."}` in the same stream. Any method other than POST gets a 405 — without that, Pages falls through to static serving and returns the homepage HTML, which is baffling when debugging.

History is trimmed to the last 12 turns and 2000 characters per message before forwarding: the API is stateless, so the browser resends the conversation each turn, and without a cap that is an abuse vector.

## Local development

```bash
npm install
npx wrangler pages dev .
```

Put `ANTHROPIC_API_KEY=sk-ant-...` in `.dev.vars` at the repo root (already gitignored). The site and the function both come up on `http://localhost:8788`.

Wrangler is pinned to 3.x because v4 requires Node ≥22. Cloudflare's own build servers are unaffected by that pin.
