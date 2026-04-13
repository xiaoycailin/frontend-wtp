// src/routes/api/github-webhook/+server.ts
import { env } from "$env/dynamic/private";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { json } from "@sveltejs/kit";

function verifySignature(
  rawBody: string,
  signature: string | null,
  secret: string,
) {
  if (!signature) return false;

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export async function POST({ request }) {
  const secret = "Fr_Event";
  if (!secret) {
    return json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const event = request.headers.get("x-github-event");
  const delivery = request.headers.get("x-github-delivery");

  if (!verifySignature(rawBody, signature, secret)) {
    return json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event !== "push") {
    return json({ ok: true, ignored: true, reason: "Not push event" });
  }

  const payload = JSON.parse(rawBody);

  const branch = payload.ref;
  const repo = payload.repository?.full_name;

  if (repo !== "xiaoycailin/frontend-wtp") {
    return json({ ok: true, ignored: true, reason: "Repo mismatch" });
  }

  if (branch !== "refs/heads/master") {
    return json({ ok: true, ignored: true, reason: "Branch mismatch" });
  }

  const child = spawn("/bin/bash", ["/home/www/frontend-wtp/deploy.sh"], {
    detached: true,
    stdio: "ignore",
  });

  child.unref();

  return json({
    ok: true,
    delivery,
    message: "Deploy triggered",
  });
}
