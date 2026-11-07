import { handleContactRequest, retryPendingNotifications } from "./contact-api.mjs";

const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com/beacon.min.js; style-src 'self' 'unsafe-inline'; connect-src 'self' https://cloudflareinsights.com; frame-src 'none'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") return handleContactRequest(request, env);
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    // Keep the existing Analytics tag: a newly proxied zone can otherwise
    // inject a second beacon after this Worker has returned its HTML.
    if ((headers.get("content-type") || "").includes("text/html")) {
      const cacheControl = headers.get("cache-control") || "";
      if (!/\bno-transform\b/i.test(cacheControl)) {
        headers.set("cache-control", [cacheControl, "no-transform"].filter(Boolean).join(", "));
      }
    }
    for (const [name, value] of Object.entries(securityHeaders)) {
      headers.set(name, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(retryPendingNotifications(env));
  },
};
