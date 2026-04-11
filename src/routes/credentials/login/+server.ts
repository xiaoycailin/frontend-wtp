import config from "../../../config";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
  const body = await request.json();
  const { email, password } = body;

  // 1) Forward ke backend asli
  const res = await fetch(config.API_BASE_URL+"/users/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return json({ status: res.status, data }, { status: res.status });
  }

  const res2 = await fetch(config.API_BASE_URL+"/users/self", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + data?.data?.jwtToken,
    },
  });

  const data2 = await res2.json();

  const token = data?.data?.jwtToken;

  console.log("Tokenn ===>>", token);
  

  // 2) Simpan token ke cookie
  if (token) {
    cookies.set("wtpanjay_token", token, {
      path: "/",
      httpOnly: true, // tidak bisa diakses JS (lebih aman)
      sameSite: "lax",
      secure: false, // aktif kalau pakai HTTPS
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });
  }

  if (data2.data) {
    data.data.user = data2.data;
  }

  return json({ status: 200, data: data.data });
};
