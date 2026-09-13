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

Runs on **Claude Sonnet 5**. Anyone who finds the site can spend your money.

Three things limit the damage:

| | |
|---|---|
| `max_tokens: 1024` | caps any single answer |
| `output_config.effort: "low"` | chat isn't reasoning-heavy; the documented cost lever |
| `cache_control` on the system prompt | the long stable prefix is read from cache on repeat traffic |

It started on Claude Opus 5 ($5/$25 per MTok) and moved to Sonnet 5 for cost. Haiku 4.5 is cheaper again — roughly a tenth of Opus 5 per knowledge question — but Anthropic measure it at 63% accuracy against Opus 5's 92% on that workload, and this widget answers knowledge questions about a subject whose record is full of half-truths. That trade buys confident wrong answers about Dylan, which is what the rest of the site exists to avoid. Change it only if you decide the chat is a toy:

```ts
const MODEL = "claude-haiku-4-5";
```

Note that `output_config.effort` stays valid there — only the `max` level errors on Haiku 4.5, and this code sends `low`.

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

## No dependencies, on purpose

The function calls the Anthropic REST API with plain `fetch` rather than the SDK, and the repo has no root `package.json`.

That is deliberate. Adding one makes Cloudflare run `npm install` during the build of a site that otherwise needs no build at all — and when that was tried, the deploy stopped shipping. Pages compiles this TypeScript natively with no install step, so the build cannot fail on dependency resolution.

The cost is that the SDK's typed errors and automatic retries are written out by hand here. For one endpoint that is a fair trade; if this grows into several, reconsider it.

## Local development

```bash
npx --yes wrangler@3 pages dev .
```

Put `ANTHROPIC_API_KEY=sk-ant-...` in `.dev.vars` at the repo root (already gitignored). Site and function both come up on `http://localhost:8788`.

Pin to wrangler 3 — v4 requires Node ≥22. Cloudflare's own build servers are unaffected by that.

---

# Quiz leaderboard

`api/scores.ts` backs the monthly quiz board at `/api/scores`. Same deal as the chat function: a Pages Function, dependency-free, deployed with the repo.

## The one setup step

It needs a **KV namespace** bound as `QUIZ_SCORES`. Until that exists the endpoint reports `{"configured": false}` and the page shows "The shared board isn't switched on yet" while still keeping each player's own best score in their browser — so the quiz works before this is done, it just has no shared board.

Cloudflare dashboard:

1. **Storage & Databases → KV → Create a namespace**, name it `bob-dylan-quiz-scores`.
2. **Workers & Pages → `bob-dylan-guide` → Settings → Bindings → Add → KV namespace**.
3. Variable name `QUIZ_SCORES`, namespace the one just created. Add it for **Production** (and Preview, if you want the board to work on preview deploys).
4. Redeploy, or push anything — bindings only attach on a new deployment.

Free tier is 100,000 reads and 1,000 writes a day. A fan-site quiz will not come close.

## How "clear the list every month" works

It doesn't clear. Keys are namespaced by month:

```
score:2026-09:1757800000000-a1b2c3   metadata: { n: "Suze", s: 18, t: 143 }
```

On 1 October the page starts reading the `score:2026-10:` prefix, which is empty, and the September keys expire on their own after 70 days. There is no scheduled job to fail on the 1st, and no moment where the board is half-cleared.

The month comes from the **server**, never the request — otherwise anyone could write onto a board that has already been settled.

## One key per submission, not one per month

A single key holding the whole board would make every submission a read-modify-write, and two players finishing at the same moment would lose one of the two scores. Per-submission keys have no such race; the board is one prefix `list()`, sorted in the function.

The cost is that KV list is eventually consistent, so the row just written may not appear in the response to its own POST. The page merges its own result in locally rather than showing a board that is visibly missing the score it just confirmed.

## Cheating

The questions and their answers are in `assets/data/quiz.js`, because the quiz runs in the browser. Anyone who opens devtools can score 20/20. The function's checks stop casual nonsense only:

| Check | Why |
|---|---|
| `0 ≤ score ≤ total`, integers | impossible scores |
| `total ≤ 50`, `seconds ≤ 4h` | garbage payloads |
| `seconds ≥ total × 1` | a scripted instant 20/20 |
| name trimmed to 24 chars, control/zero-width/bidi characters stripped | names that sort to the top or break the layout |
| 6 POSTs per minute per IP | floods |

Server-side answer validation would be the real fix and it is not worth it here. The page says as much, which is the honest version.

The rate limiter lives in module scope and Cloudflare runs many isolates — a speed bump, not a quota. For a real limit add a **Rate limiting rule** against `/api/scores` in the dashboard.

## Writing next month's questions

`assets/data/quiz.js` is a list of monthly sets, newest last. Add one:

```js
{ month: '2026-11', title: '…', questions: [ { q, a: [4 options], c: <index>, note }, …20 ] }
```

The page picks the set matching the current month; if none matches it serves the most recent past set and says so on the card, so a missed month degrades quietly instead of showing an empty page.

The rules that make the questions worth playing are written at the top of that file. The short version: one defensible answer (disputed Dylan history stays out), distractors that are plausible to someone who knows the period, and a `note` written for the people who got it wrong.

## Local development

```bash
npx --yes wrangler@3 pages dev . --port 8788 --kv QUIZ_SCORES
```

`--kv QUIZ_SCORES` gives you a local namespace under `.wrangler/` (gitignored), so the board works offline. Run it from the repo root — `wrangler pages dev` discovers `functions/` from the working directory, not from the directory argument, and pointing it at the repo from elsewhere silently serves the site with no functions at all.

---

# Contact form

`api/contact.ts` backs the Contact button at the foot of every page. Same shape as the others: a Pages Function, dependency-free, deployed with the repo.

## Why it exists rather than a `mailto:` link

A `mailto:` puts the address in the page source, where scrapers find it within days. The point of this form is that **the address is never in anything the browser receives** — it lives in a Cloudflare secret and only the function reads it.

Worth being clear-eyed about what that buys: the endpoint is an open relay of exactly one shape. Anyone can make it send one short message to one fixed address. What they *cannot* do is choose the address, which is the property that matters. Volume is the remaining risk, and the limits below are what handle it.

## Setup

Two secrets on the Pages project — **Settings → Variables and secrets**:

| Type | Name | Value |
|---|---|---|
| Secret | `RESEND_API_KEY` | from resend.com → API Keys |
| Secret | `CONTACT_TO` | the address messages should reach |

Optionally `CONTACT_FROM` to override the sender. The default is `onboarding@resend.dev`, which Resend allows **without domain verification but only to the account owner's own address** — which is exactly this case, so no domain is needed. If you ever want mail from your own domain, verify it in Resend and set `CONTACT_FROM` accordingly.

Bindings and secrets attach at build time, so **redeploy after adding them** or the endpoint keeps reporting that the form isn't switched on. Until they exist it returns 503 with `configured:false` and the form says so politely rather than failing silently.

Free tier is 3,000 emails a month. A fan site's contact form will not come close.

## What stops the spam

| Check | Why |
|---|---|
| Honeypot field, off-screen and `aria-hidden` | People never see it; form-filling scripts fill every field they find |
| Minimum two seconds between opening and sending | A form completed instantly was not read |
| 3 sends per IP per 10 minutes | Floods |
| Message at least 10 characters, at most 4000 | Junk and payloads |
| `reply_to` only when it parses as an address | A malformed one would fail the whole send |

The honeypot and timing checks answer **exactly as if the send succeeded**. Telling a bot it was caught only teaches whoever wrote it to stop filling that field.

The rate limiter runs *before* those checks, so a script gets no free attempts. It lives in module scope and Cloudflare runs many isolates, so it is a speed bump rather than a quota — for a hard limit add a **Rate limiting rule** against `/api/contact` in the dashboard, which runs at the edge before this code.

## Errors

The visitor only ever sees "Couldn't send that just now." The provider's actual reason goes to `console.error`, visible in `wrangler pages deployment tail` — there is nothing in the response for someone to probe with.

## Local development

```bash
npx --yes wrangler@3 pages dev . --port 8788
```

Put `RESEND_API_KEY` and `CONTACT_TO` in `.dev.vars` at the repo root (gitignored). With a deliberately invalid key the endpoint returns 502 and logs the provider's rejection, which is enough to exercise everything except delivery itself.
