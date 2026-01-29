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

export const CozeChat = () => {
  useEffect(() => {
    // 定义初始化函数
    const initCoze = () => {
      if (window.CozeWebSDK) {
        console.log("Coze SDK loaded, initializing client...");
        
        // Static token configuration - replace with your actual PAT
        const COZE_PAT = "sat_1GdPxpn54h0JqASgi76tPoJ3Net9ZoYT48rw5bBhZ8azrxl9cwKmPvzF1b9tFUdz"; 

        // 获取或生成一个简单的唯一用户ID，以确保会话历史记录能够正确保存和区分
        // 这样 Coze 后端才能为不同的会话生成并存储标题
        let userId = localStorage.getItem("coze_user_id");
        if (!userId) {
          userId = "user_" + Math.random().toString(36).slice(2, 11);
          localStorage.setItem("coze_user_id", userId);
        }

        new window.CozeWebSDK.WebChatClient({
          config: {
            type: "bot",
            bot_id: "7583617235025920034",
            isIframe: false,
          },
          auth: {
            type: "token",
            token: COZE_PAT,
            onRefreshToken: async () => COZE_PAT,
          },
          userInfo: {
            id: userId, // 使用持久化的唯一ID
            url: "https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/coze-logo.png",
            nickname: "User",
          },
          ui: {
            base: {
              icon: "https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/chatsdk-logo.png",
              layout: "pc",
              lang: "en",
              zIndex: 99999,
            },
            header: {
              isShow: true, // 开启头部以确保更好的导航体验
              isNeedClose: true, // 修改为 true，以显示关闭按钮
            },
            asstBtn: {
              isNeed: true,
            },
            footer: {
              isShow: true,
              expressionText: "Powered by Coze",
            },
            conversations: {
              isNeed: true, // 开启会话列表，Coze 会自动根据首个问题生成 AI 标题
            },
            chatBot: {
              title: "Coze Bot",
              uploadable: true,
              width: 460,
              isNeedAddNewConversation: true,
              isNeedQuote: true,
            },
          },
        });
        console.log("Coze SDK initialization completed!");
      } else {
        console.error("Coze SDK loaded but window.CozeWebSDK is undefined");
      }
    };

    // 检查是否已经存在脚本防止重复加载
    // 修改 ID 以强制重新加载，避免旧的错误缓存
    const SCRIPT_ID = "coze-chat-sdk-fixed";
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      if (window.CozeWebSDK) {
        initCoze();
      }
      return;
    }

    // 手动创建并插入 script 标签
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    // 使用您验证可以访问的具体版本链接
    script.src = "https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.20/libs/cn/index.js";
    script.async = true;
    script.crossOrigin = "anonymous"; // 添加跨域属性，有时候能解决特定网络问题
    
    script.onload = () => {
      console.log("Script loaded successfully:", script.src);
      initCoze();
    };

    script.onerror = (e) => {
      console.error("Failed to load Coze SDK script from:", script.src, e);
    };

    document.body.appendChild(script);

    // 如果 SDK 已经存在，直接初始化
    if (window.CozeWebSDK) {
      initCoze();
    }
  }, []); // 仅在组件挂载时执行

  // 不需要渲染任何可视元素，Script 由 useEffect 插入
  return null;
};
