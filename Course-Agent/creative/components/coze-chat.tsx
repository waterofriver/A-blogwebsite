"use client";

import { useEffect } from "react";

// 定义 SDK 的全局类型，避免 TypeScript 报错
declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (config: any) => any;
    };
  }
}

// 提示：将以下配置替换为你的真实值（不要改动关键结构）
const COZE_CONFIG = {
  botId: "7583617235025920034", // 复用现有 bot_id，若需改请替换
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

async function getAccessToken(userUid: string): Promise<string> {
  const resp = await fetch("/api/coze/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userUid }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.access_token) {
    throw new Error(data.error || "获取token失败");
  }
  return data.access_token as string;
}

export const CozeChat = () => {
  useEffect(() => {
    const initCoze = async () => {
      if (!window.CozeWebSDK) {
        console.error("Coze SDK 未加载");
        return;
      }
      try {
        const userUid = getUserUid();
        const accessToken = await getAccessToken(userUid);
        new window.CozeWebSDK.WebChatClient({
          config: { type: "bot", bot_id: COZE_CONFIG.botId, isIframe: false },
          auth: {
            type: "token",
            token: accessToken,
            onRefreshToken: async () => getAccessToken(userUid),
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
