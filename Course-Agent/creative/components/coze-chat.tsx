"use client";

import { useEffect } from "react";

// 定义 SDK 的全局类型，避免 TypeScript 报错
declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (config: any) => any;
    };
    KJUR?: any;
  }
}

// 合并：加载 JWT 库 + 生成 Coze JWT + 以用户唯一ID做会话隔离
function loadJwtLibrary(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.KJUR && window.KJUR.jws && window.KJUR.jws.JWS) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/8.0.20/jsrsasign-all-min.js";
    script.type = "text/javascript";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (window.KJUR && window.KJUR.jws && window.KJUR.jws.JWS) resolve();
      else reject(new Error("JWT库加载但未正确初始化"));
    };
    script.onerror = () =>
      reject(new Error(`JWT库加载失败，请检查链接: ${script.src}`));
    document.head.appendChild(script);
  });
}

// 提示：将以下配置替换为你的真实值（不要改动关键结构）
const COZE_CONFIG = {
  botId: "7583617235025920034", // 复用现有 bot_id，若需改请替换
  appId: "1178272159026",
  publicKey: "vO_ZRV2SxcUonskBNtJzXf0x03mRx3qjTqUc5iLodGY",
  privateKey: `-----BEGIN PRIVATE KEY-----
  MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDBXOmRxh1p7d4a
rSyVm7lDtnH/5YfmWliC7k944HhsM1DEpt8EfkaRY+B5Sys6uXKw0KLRaxjoEtQ7
e+m3nuUB6wu2h+kvX5o6wASQLdG8j441HXVEWrpfiodMzUojAtMqrCqeUn5dzv/k
Nz+OeNlq8w5luCVr2tKPuULJDLZZUxlpzbWt9DrSHH/RVHOUSIW54RBPIsbYNei4
wUqtxCp33v2CMVi/cyiOggxVihFNUu27HG4rz7Psv6jxAXlrf5xoPwN4N/eKJOCH
hkyfCfOhUHoFpzgAncEgzz0TKjVZJfDy2EoI8DgTyk3lZACcTKpHC79wSrm+s+UI
Qh5z1eJVAgMBAAECggEAJIOO4NX8VnVSeI+kqHDSbKC+iM/3mI6NgdYOQFmFLAuJ
sEUBvse4vDpT2JvTA0EjURPo9ypl9ucdWElHQoM5JCJWYSbrqCRBy9/YTMC2R0kF
le6k5x5J7QJMF/r5ScC+DyQZXTHfRogxJs+vCxCzn+BbouZB/MrC8dyOachig93b
GWQZEsqXx69exe2U7sV89BRFr9LrnzDvCst9Ds6fD8wpsLBpljbPcIlbfk1hGhkq
txvKen/uHaFweGGTRD/FMxT/lCkH1mXS0TyesaNeZOVcZDOyfhYg8n8MqqIcxUF0
7MqQPsd/yzpUFlZ3ohe6dx4Sqau8M7pdx+yP99Ct2QKBgQDg1BieK+3NpYeSG558
8s1gnDezF915Vpq/Qs2JmZn8MkpBw8YyL49GsLru71sQ8tWzfp+13yLK8uzewtQz
CezQyAAa15Z7wudp/c39hAesHq/nqnAKfVpSQG+qwA65guKOPt6W7AAdp5EtvYjx
qmIsE6UdPSvzGrXix5GOxVQ3mQKBgQDcK//0LIsk1gJkfFD+n6bpPW4VgIbPX5kJ
b0fJkw6VbBvE8mJFUvpzySs07P09K23TYwo1LX+5oWLWTkz4+q1fUF/eLuDam5hk
fmKyplHvDZfUzWicxQaQo1HegYfLrQLrlxKZZh5ZfQ20hRMEzCWce4fmjjDU+fsc
1Tc0xq4GHQKBgFb31FoC9icRe+K5ylHc/jL72tPtTF+ub4fCiI1MnHMg5PaRi25I
VWzr2jOo5RomRSH8vjz1Bplo5NW6majwkumkI94+PNi86RVn9zG0y975s+OyW0rD
eJfOkyOCzW9XQNnzWdkZi2XtNsxxv7JzzSvtoXYw/no4f9ksh5KppE0pAoGBAJyp
7lmnbGcMpO0tjFBx98mVPYStTL+4bWPKPBGRw1nNcEEGm6hqb+39ofHqBBQHmAFH
QtcuBelnjbWiR6EOdlkRDvZA8xx6hMhVKhOmxzxLttLkSmDqzU4T+EhUcPUbqa1L
dR+UC1pv4lWmLy9FuCmNuNj0KokRS35rtPmnueJ9AoGAcZSr0QxBlBddiGV/3gaV
O0ttofO7pxHScF0/Epr7J3y7Q3etzLwCkkTCFZzWjQzl8Zo5V6oTy3BCWkt1yftL
HD9OTXDh0uqXMIzShXwQTTB6/kzGYv/vxTzTnx5aXLWTKs5rr2ORtWrholpiTzH+
RkSGnn+NhwmO7BvSwIxbleU=
-----END PRIVATE KEY-----`,
};

function getUserUid(): string {
  // 优先使用网站登录用户ID以实现隔离；否则使用访客ID
  const loggedUserId = localStorage.getItem("website_user_id");
  if (loggedUserId) return loggedUserId;
  let visitorId = localStorage.getItem("coze_visitor_id");
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random()
      .toString(36)
      .slice(-6)}`;
    localStorage.setItem("coze_visitor_id", visitorId);
  }
  return visitorId;
}

function generateCozeJwt(userUid: string): string {
  const header = { alg: "RS256", typ: "JWT", kid: COZE_CONFIG.publicKey };
  const currentTime = Math.floor(Date.now() / 1000);
  const payload = {
    iss: COZE_CONFIG.appId,
    aud: "api.coze.cn",
    jti: Math.random().toString(36).substr(2, 32) + Date.now(),
    iat: currentTime,
    exp: currentTime + 3600,
    session_name: userUid,
  };
  return window.KJUR.jws.JWS.sign(
    header.alg,
    JSON.stringify(header),
    JSON.stringify(payload),
    COZE_CONFIG.privateKey
  );
}

async function getAccessToken(jwt: string): Promise<string> {
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
  if (!resp.ok)
    throw new Error(`获取token失败，HTTP状态码: ${resp.status}`);
  const data = await resp.json();
  return data.access_token;
}

export const CozeChat = () => {
  useEffect(() => {
    const initCoze = async () => {
      if (!window.CozeWebSDK) {
        console.error("Coze SDK 未加载");
        return;
      }
      try {
        await loadJwtLibrary();
        const userUid = getUserUid();
        const jwt = generateCozeJwt(userUid);
        const accessToken = await getAccessToken(jwt);
        new window.CozeWebSDK.WebChatClient({
          config: { type: "bot", bot_id: COZE_CONFIG.botId, isIframe: false },
          auth: {
            type: "token",
            token: accessToken,
            onRefreshToken: async () => accessToken,
          },
          userInfo: { id: userUid, nickname: "User" },
          ui: {
            base: { layout: "pc", lang: "en", zIndex: 99999 },
            header: { isShow: true, isNeedClose: true },
            asstBtn: { isNeed: true },
            footer: { isShow: true, expressionText: "Powered by Coze" },
            conversations: { isNeed: true },
            chatBot: {
              title: "Coze Bot",
              uploadable: true,
              width: 460,
              isNeedAddNewConversation: true,
              isNeedQuote: true,
            },
          },
        });
      } catch (e) {
        console.error("初始化失败:", (e as Error).message);
      }
    };

    const SCRIPT_ID = "coze-chat-sdk-fixed";
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      if (window.CozeWebSDK) initCoze();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src =
      "https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.20/libs/cn/index.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      initCoze();
    };
    script.onerror = (e) => {
      console.error("Failed to load Coze SDK script:", e);
    };
    document.body.appendChild(script);

    if (window.CozeWebSDK) initCoze();
  }, []); // 仅在组件挂载时执行

  // 不需要渲染任何可视元素，Script 由 useEffect 插入
  return null;
};
