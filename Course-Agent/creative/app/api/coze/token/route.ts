import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";

type TokenRequestBody = {
  userUid?: string;
  botId?: string;
};

type CozeEnvSet = {
  appIdEnv: string;
  publicKeyEnv: string;
  privateKeyEnv: string;
};

const BOT_ENV_MAP: Record<string, CozeEnvSet> = {
  "7583617235025920034": {
    appIdEnv: "COZE_APP_ID_CHAT",
    publicKeyEnv: "COZE_PUBLIC_KEY_CHAT",
    privateKeyEnv: "COZE_PRIVATE_KEY_CHAT",
  },
  "7560276108453675054": {
    appIdEnv: "COZE_APP_ID_QUIZ",
    publicKeyEnv: "COZE_PUBLIC_KEY_QUIZ",
    privateKeyEnv: "COZE_PRIVATE_KEY_QUIZ",
  },
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as TokenRequestBody;
  const userUid = body.userUid || "server_session";
  const envSet = body.botId ? BOT_ENV_MAP[body.botId] : undefined;

  const appId =
    (envSet ? process.env[envSet.appIdEnv] : undefined) ||
    process.env.COZE_APP_ID;
  const publicKey =
    (envSet ? process.env[envSet.publicKeyEnv] : undefined) ||
    process.env.COZE_PUBLIC_KEY;
  const privateKey =
    (envSet ? process.env[envSet.privateKeyEnv] : undefined) ||
    process.env.COZE_PRIVATE_KEY;

  if (!appId || !publicKey || !privateKey) {
    const envHint = envSet
      ? [envSet.appIdEnv, envSet.publicKeyEnv, envSet.privateKeyEnv]
      : ["COZE_APP_ID", "COZE_PUBLIC_KEY", "COZE_PRIVATE_KEY"];
    return NextResponse.json(
      { error: `Missing COZE env vars: ${envHint.join(", ")}` },
      { status: 500 }
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const normalizedPrivateKey = privateKey.replace(/\\n/g, "\n");
  const key = await importPKCS8(normalizedPrivateKey, "RS256");

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
