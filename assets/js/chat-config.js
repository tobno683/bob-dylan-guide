/* Chat endpoint.
 *
 * "/api/chat" is the Cloudflare Pages Function in functions/api/chat.ts, served
 * from the site's own origin — so there is no CORS to configure and no URL to
 * keep in sync. It deploys automatically with the site on every push.
 *
 * Note this only resolves on the Cloudflare Pages deployment. The GitHub Pages
 * copy has no server side, so the chat there will report that it can't reach
 * the service. To run chat on both, put the absolute Cloudflare URL here
 * instead — "https://bob-dylan-guide.pages.dev/api/chat" — and add CORS
 * headers for the GitHub origin in the function.
 *
 * Set this to "" to switch the chat off entirely; the button then never
 * renders and the site is unchanged.
 *
 * There is deliberately no API key here. This file is public; the key is an
 * encrypted secret on the Pages project. See functions/README.md.
 */
window.DYLAN_CHAT = { endpoint: "/api/chat" };
