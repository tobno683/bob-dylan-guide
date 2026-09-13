/**
 * Cloudflare Pages Function behind the footer's contact form — served at
 * /api/contact, deployed with the rest of the repo.
 *
 * Dependency-free like the other two functions: a root package.json makes
 * Cloudflare run `npm install` during the build of a site that needs none,
 * and when that was tried the deploy stopped shipping.
 *
 * THE POINT OF IT: the site owner's address must not appear anywhere a
 * scraper can reach. A `mailto:` link fails that immediately — it is in the
 * page source. So the address lives in a Cloudflare secret, the browser POSTs
 * a message here, and this function does the sending. The page never learns
 * who it is writing to, and neither does anyone reading the JavaScript.
 *
 * That also means this endpoint is an open relay of exactly one shape: anyone
 * can make it send one short email to one fixed address. The address cannot be
 * chosen by the caller, which is the property that matters — but the volume
 * can, so the limits below are the real substance of this file.
 */

interface Env {
  /** Resend API key. Absent until set, which the endpoint reports rather than
   *  throwing — the form then tells the visitor it is not accepting messages
   *  instead of failing silently. */
  RESEND_API_KEY?: string;
  /** Where messages go. A secret, never sent to the browser. */
  CONTACT_TO?: string;
  /** Optional override for the sender. Resend accepts onboarding@resend.dev
   *  without domain verification, but only to the account owner's own address
   *  — which is this exact use case, so it is the default. */
  CONTACT_FROM?: string;
}

const DEFAULT_FROM = "Bob Dylan Guide <onboarding@resend.dev>";

const MAX_NAME = 80;
const MAX_EMAIL = 160;
const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 10;

/** A form filled in under two seconds was not filled in by a person reading
 *  it. The browser sends how long the form was open; a bot that skips the
 *  field entirely fails the check too, because the value comes back absent. */
const MIN_FILL_MS = 2000;

/** Per-isolate speed bump, not a quota — Cloudflare runs many isolates. The
 *  real limit for a public form is a Rate limiting rule in the dashboard
 *  against /api/contact, which runs at the edge before this code. */
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX_SENDS = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_MAX_SENDS;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function clean(raw: unknown, max: number): string {
  return String(raw ?? "")
    // control characters, zero-width marks and bidi overrides
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060\uFEFF]/g, '')
    .trim()
    .slice(0, max);
}

/** Deliberately loose — the job is to reject things that are not addresses and
 *  anything carrying a newline, not to adjudicate RFC 5322. A wrong-looking
 *  address from a real person should still get their message through, so a
 *  failure here drops reply-to rather than rejecting the whole send. */
function usableEmail(s: string): boolean {
  return s.length > 0 && s.length <= MAX_EMAIL && !/[\r\n]/.test(s) && /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(s);
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  if (ctx.request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }

  const to = ctx.env.CONTACT_TO;
  const key = ctx.env.RESEND_API_KEY;
  if (!to || !key) {
    return json({ ok: false, configured: false, error: "The contact form isn't switched on yet." }, 503);
  }

  const ip = ctx.request.headers.get("CF-Connecting-IP") || "unknown";
  if (rateLimited(ip)) {
    return json({ ok: false, error: "That's a few messages in a short time — try again later." }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await ctx.request.json();
  } catch {
    return json({ ok: false, error: "Bad request." }, 400);
  }

  /* The honeypot is a real input, positioned off-screen and hidden from
     assistive tech. People never see it; scripted form-fillers fill every
     field they find. Answer exactly as if the send succeeded — telling a bot
     it was caught just teaches whoever wrote it to stop filling that field. */
  if (clean(body.website, 50) !== "") {
    return json({ ok: true });
  }

  const openMs = Number(body.openMs);
  if (!Number.isFinite(openMs) || openMs < MIN_FILL_MS) {
    return json({ ok: true });
  }

  const name = clean(body.name, MAX_NAME);
  const replyTo = clean(body.email, MAX_EMAIL);
  const message = clean(body.message, MAX_MESSAGE);

  if (message.length < MIN_MESSAGE) {
    return json({ ok: false, error: "Add a little more than that and I'll send it." }, 400);
  }

  const who = name || "a visitor";
  const lines = [
    message,
    "",
    "—",
    `From: ${name || "(no name given)"}`,
    `Reply-to: ${replyTo || "(none given)"}`,
    `Sent from the contact form on the Bob Dylan guide.`
  ];

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from: ctx.env.CONTACT_FROM || DEFAULT_FROM,
        to: [to],
        subject: `Bob Dylan guide — message from ${who}`,
        text: lines.join("\n"),
        /* Only when it looks like an address. Resend takes JSON rather than
           raw headers so there is no header-injection route here, but a
           malformed reply-to can make the whole send fail, and losing a real
           message to a typo'd address would be the worse outcome. */
        ...(usableEmail(replyTo) ? { reply_to: replyTo } : {})
      })
    });
  } catch {
    return json({ ok: false, error: "Couldn't send that just now. Try again in a moment." }, 502);
  }

  if (!res.ok) {
    /* Log the provider's reason where only the owner can see it — the tail is
       in `wrangler pages deployment tail`. The visitor gets nothing useful to
       probe with. */
    console.error("resend failed", res.status, await res.text().catch(() => ""));
    return json({ ok: false, error: "Couldn't send that just now. Try again in a moment." }, 502);
  }

  return json({ ok: true });
};
