import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";

type TokenRequestBody = {
  userUid?: string;
};

export async function POST(request: Request) {
  const appId = process.env.COZE_APP_ID;
  const publicKey = process.env.COZE_PUBLIC_KEY;
  const privateKey = process.env.COZE_PRIVATE_KEY;

  if (!appId || !publicKey || !privateKey) {
    return NextResponse.json(
      { error: "Missing COZE env vars" },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as TokenRequestBody;
  const userUid = body.userUid || "server_session";

  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(privateKey, "RS256");

  const jwt = await new SignJWT({
    iss: appId,
    aud: "api.coze.cn",
    jti: Math.random().toString(36).slice(2) + Date.now(),
    iat: now,
    exp: now + 3600,
    session_name: userUid,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT", kid: publicKey })
    .sign(key);

  const resp = await fetch("https://api.coze.cn/api/permission/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      duration_seconds: 900,
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    return NextResponse.json(
      { error: "coze token failed", detail },
      { status: resp.status }
    );
  }

  const data = await resp.json();
  return NextResponse.json({ access_token: data.access_token });
}
