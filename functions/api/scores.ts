/**
 * Cloudflare Pages Function backing the quiz leaderboard — served at
 * /api/scores on the site's own origin, deployed with the rest of the repo.
 *
 * Dependency-free for the same reason as api/chat.ts: a root package.json
 * makes Cloudflare run `npm install` during the build of a site that needs no
 * build at all, and when that was tried the deploy stopped shipping.
 *
 * STORAGE SHAPE — one KV key per submission, not one key per month:
 *
 *     score:2026-09:1757800000000-a1b2c3  ->  ""   (value unused)
 *     metadata: { n: "Suze", s: 18, t: 143 }
 *
 * A single key holding the whole board would be simpler, but every submission
 * would be a read-modify-write and two players finishing together would lose
 * one of the two scores. One key per submission has no such race. The board is
 * then a single prefix list, sorted here.
 *
 * The month is in the key prefix, which is what "clear the list every month"
 * actually means: nothing is cleared. On 1 September the page starts reading a
 * prefix that has nothing under it, and the previous month's keys expire on
 * their own via TTL. No scheduled job, nothing to go wrong on the 1st.
 *
 * HONESTY ABOUT CHEATING: the questions and their answers are in a public
 * JavaScript file, because the quiz runs in the browser. Anyone who opens
 * devtools can score 20/20. The checks below stop casual nonsense — impossible
 * scores, scripted floods, submissions backdated onto a finished month — and
 * nothing else. A leaderboard on a fan site is not worth server-side answer
 * validation; say so on the page rather than pretending otherwise.
 */

interface Env {
  /** KV namespace binding. Absent until it is created in the dashboard, which
   *  the endpoint reports rather than throwing — the page then falls back to a
   *  local-only board. */
  QUIZ_SCORES?: KVNamespace;
}

/** How many rows the board shows. */
const BOARD_SIZE = 25;

/** Long enough that a month is fully readable while it is current and for a
 *  while after, short enough that nothing accumulates forever. */
const TTL_SECONDS = 70 * 24 * 60 * 60;

/** Sanity bounds. `total` is the number of questions in a monthly set; the
 *  function has no access to the question data, so it bounds rather than
 *  verifies. */
const MAX_NAME = 24;
const MAX_TOTAL = 50;
const MAX_SECONDS = 4 * 60 * 60;

/** A perfect round in under a second per question wasn't played by a human.
 *  Deliberately generous — fast readers exist, scripts are what this excludes. */
const MIN_SECONDS_PER_QUESTION = 1;

/** Per-isolate speed bump, not a quota — Cloudflare runs many isolates. For a
 *  hard limit, add a Rate limiting rule in the dashboard against /api/scores. */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_POSTS = 6;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX_POSTS;
}

/** The server decides what "this month" is. Trusting the client's month would
 *  let anyone write onto a board that has already been settled. */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Names are rendered into the page. The page escapes them too — this is the
 *  belt to that pair of braces, and it also strips the invisible characters
 *  people use to sit at the top of a list. */
function cleanName(raw: unknown): string {
  return String(raw ?? '')
    // control characters, zero-width marks and the bidi overrides — the
    // invisible characters people use to sit at the top of a sorted list
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // The board changes as people play; a cached board looks broken.
      'cache-control': 'no-store'
    }
  });
}

interface Row {
  n: string;
  s: number;
  t: number;
}

async function readBoard(kv: KVNamespace, month: string): Promise<Row[]> {
  const rows: Row[] = [];
  let cursor: string | undefined;

  // One month of a fan site's traffic fits well inside a page or two, but
  // paginating costs nothing and removes a silent truncation.
  do {
    const page = await kv.list<Row>({ prefix: `score:${month}:`, cursor, limit: 1000 });
    for (const key of page.keys) {
      const m = key.metadata;
      if (m && typeof m.n === 'string' && typeof m.s === 'number' && typeof m.t === 'number') {
        rows.push({ n: m.n, s: m.s, t: m.t });
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  // Score first, then speed — the tie-break is why the page bothers timing.
  rows.sort((a, b) => (b.s - a.s) || (a.t - b.t));
  return rows.slice(0, BOARD_SIZE);
}

/* Single catch-all rather than onRequestGet/onRequestPost, matching chat.ts:
   a method with no handler otherwise falls through to static serving and
   returns the homepage HTML, which is baffling when debugging. */
export const onRequest: PagesFunction<Env> = async (ctx) => {
  if (ctx.request.method === 'GET') return handleGet(ctx);
  if (ctx.request.method === 'POST') return handlePost(ctx);
  return json({ ok: false, error: 'Method not allowed.' }, 405);
};

const handleGet: PagesFunction<Env> = async (ctx) => {
  const kv = ctx.env.QUIZ_SCORES;
  const month = currentMonth();

  if (!kv) return json({ configured: false, month, scores: [] });

  try {
    return json({ configured: true, month, scores: await readBoard(kv, month) });
  } catch {
    // A board that fails to load should not take the quiz down with it.
    return json({ configured: true, month, scores: [], error: 'Could not read the board.' }, 502);
  }
};

const handlePost: PagesFunction<Env> = async (ctx) => {
  const kv = ctx.env.QUIZ_SCORES;
  const month = currentMonth();

  if (!kv) {
    return json({ ok: false, configured: false, error: 'The leaderboard is not set up yet.' }, 503);
  }

  const ip = ctx.request.headers.get('CF-Connecting-IP') || 'unknown';
  if (rateLimited(ip)) {
    return json({ ok: false, error: 'Slow down a moment, then try again.' }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await ctx.request.json();
  } catch {
    return json({ ok: false, error: 'Bad request.' }, 400);
  }

  const name = cleanName(body.name);
  const score = Number(body.score);
  const total = Number(body.total);
  const seconds = Math.round(Number(body.seconds));

  if (!name) return json({ ok: false, error: 'Enter a name first.' }, 400);

  if (!Number.isInteger(total) || total < 1 || total > MAX_TOTAL) {
    return json({ ok: false, error: 'Bad request.' }, 400);
  }
  if (!Number.isInteger(score) || score < 0 || score > total) {
    return json({ ok: false, error: 'Bad request.' }, 400);
  }
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > MAX_SECONDS) {
    return json({ ok: false, error: 'Bad request.' }, 400);
  }
  if (seconds < total * MIN_SECONDS_PER_QUESTION) {
    return json({ ok: false, error: 'That was faster than reading is.' }, 400);
  }

  // Timestamp first so keys sort roughly chronologically; the random tail
  // keeps two submissions in the same millisecond from colliding.
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await kv.put(`score:${month}:${id}`, '', {
      metadata: { n: name, s: score, t: seconds } satisfies Row,
      expirationTtl: TTL_SECONDS
    });
  } catch {
    return json({ ok: false, error: 'Could not save that score.' }, 502);
  }

  // KV list is eventually consistent, so the board returned here may not yet
  // contain the row just written. The page merges its own result in locally
  // rather than waiting for it to appear.
  let scores: Row[] = [];
  try {
    scores = await readBoard(kv, month);
  } catch { /* the score saved; a stale board is not worth failing over */ }

  return json({ ok: true, configured: true, month, scores });
};
