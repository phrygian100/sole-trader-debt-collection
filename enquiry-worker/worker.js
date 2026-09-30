const ALLOWED_ORIGINS = new Set([
  "https://soletraderdebtcollection.co.uk",
  "https://www.soletraderdebtcollection.co.uk",
  "http://soletraderdebtcollection.co.uk",
  "http://www.soletraderdebtcollection.co.uk",
]);

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://soletraderdebtcollection.co.uk";
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return json({ ok: false }, 405, origin);
    }

    let data;
    try {
      const type = request.headers.get("content-type") || "";
      if (type.includes("application/json")) {
        data = await request.json();
      } else {
        data = Object.fromEntries((await request.formData()).entries());
      }
    } catch {
      return json({ ok: false }, 400, origin);
    }

    if (data._honey) return json({ ok: true }, 200, origin);

    const name = String(data.name || "").trim().slice(0, 200);
    const contact = String(data.contact || "").trim().slice(0, 200);
    const message = String(data.message || "").trim().slice(0, 5000);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const phoneOk = contact.replace(/\D/g, "").length >= 7;
    if (name.length < 2 || message.length < 20 || (!emailOk && !phoneOk)) {
      return json({ ok: false }, 400, origin);
    }

    try {
      await env.EMAIL.send({
        to: "travis_gm@live.co.uk",
        from: {
          email: "notes@soletraderdebtcollection.co.uk",
          name: "Sole Trader Debt Collection",
        },
        replyTo: emailOk ? contact : undefined,
        subject: "New enquiry — Sole Trader Debt Collection",
        text: `Name: ${name}\nContact: ${contact}\n\n${message}\n`,
      });
    } catch (error) {
      console.error("enquiry send failed", error && error.code, error && error.message);
      return json({ ok: false }, 502, origin);
    }

    return json({ ok: true }, 200, origin);
  },
};
