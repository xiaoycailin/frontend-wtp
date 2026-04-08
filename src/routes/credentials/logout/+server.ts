// src/routes/api/v1/auth/logout/+server.ts
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies, fetch }) => {
  const token = cookies.get("wtpanjay_token");

  if (token) {
    try {
      await fetch("/api/v1/users/auth/logout", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
      });
    } catch {}
  }

  cookies.set("wtpanjay_token", "", {
    path: "/",
    maxAge: 0,
  });

  return json({
    status: 200,
    data: { message: "Berhasil logout." },
  });
};
