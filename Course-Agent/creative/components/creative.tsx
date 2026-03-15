"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Brush,
  Camera,
  ChevronDown,
  Cloud,
  Code,
  Download,
  FileText,
  Grid,
  Heart,
  Home,
  ImageIcon,
  Layers,
  LayoutGrid,
  Lightbulb,
  Menu,
  MessageSquare,
  Palette,
  PanelLeft,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Loader2,
  Send,
  Star,
  Trash,
  Users,
  Video,
  Wand2,
  Clock,
  Eye,
  Archive,
  ArrowUpDown,
  MoreHorizontal,
  Type,
  CuboidIcon,
  X,
  Crown,
  TrendingUp,
} from "lucide-react"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ResourcesSection } from "./resources-section"

// 应用示例数据
const apps = [
  {
    name: "PixelMaster",
    icon: <ImageIcon className="text-violet-500" />,
    description: "高级图像编辑与合成",
    category: "创意",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "VectorPro",
    icon: <Brush className="text-orange-500" />,
    description: "专业矢量图创作",
    category: "创意",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "VideoStudio",
    icon: <Video className="text-pink-500" />,
    description: "电影级视频剪辑与制作",
    category: "视频",
    recent: true,
    new: false,
    progress: 100,
  },
  {
    name: "MotionFX",
    icon: <Sparkles className="text-blue-500" />,
    description: "高阶特效与动画",
    category: "视频",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "PageCraft",
    icon: <Layers className="text-red-500" />,
    description: "专业排版与页面设计",
    category: "创意",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "UXFlow",
    icon: <LayoutGrid className="text-fuchsia-500" />,
    description: "直观的用户体验设计",
    category: "设计",
    recent: false,
    new: true,
    progress: 85,
  },
  {
    name: "PhotoLab",
    icon: <Camera className="text-teal-500" />,
    description: "高级照片编辑与管理",
    category: "摄影",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "DocMaster",
    icon: <FileText className="text-red-600" />,
    description: "文档编辑与管理",
    category: "文档",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "WebCanvas",
    icon: <Code className="text-emerald-500" />,
    description: "网页设计与开发",
    category: "网页",
    recent: false,
    new: true,
    progress: 70,
  },
  {
    name: "3DStudio",
    icon: <CuboidIcon className="text-indigo-500" />,
    description: "3D 建模与渲染",
    category: "3D",
    recent: false,
    new: true,
    progress: 60,
  },
  {
    name: "FontForge",
    icon: <Type className="text-amber-500" />,
    description: "字体设计与制作",
    category: "字体",
    recent: false,
    new: false,
    progress: 100,
  },
  {
    name: "ColorPalette",
    icon: <Palette className="text-purple-500" />,
    description: "配色方案创建与管理",
    category: "设计",
    recent: false,
    new: false,
    progress: 100,
  },
]

// 最近文件示例数据
const recentFiles = [
  {
    name: "Brand Redesign.pxm",
    app: "PixelMaster",
    modified: "2 小时前",
    icon: <ImageIcon className="text-violet-500" />,
    shared: true,
    size: "24.5 MB",
    collaborators: 3,
  },
  {
    name: "Company Logo.vec",
    app: "VectorPro",
    modified: "昨天",
    icon: <Brush className="text-orange-500" />,
    shared: true,
    size: "8.2 MB",
    collaborators: 2,
  },
  {
    name: "Product Launch Video.vid",
    app: "VideoStudio",
    modified: "3 天前",
    icon: <Video className="text-pink-500" />,
    shared: false,
    size: "1.2 GB",
    collaborators: 0,
  },
  {
    name: "UI Animation.mfx",
    app: "MotionFX",
    modified: "上周",
    icon: <Sparkles className="text-blue-500" />,
    shared: true,
    size: "345 MB",
    collaborators: 4,
  },
  {
    name: "Magazine Layout.pgc",
    app: "PageCraft",
    modified: "2 周前",
    icon: <Layers className="text-red-500" />,
    shared: false,
    size: "42.8 MB",
    collaborators: 0,
  },
  {
    name: "Mobile App Design.uxf",
    app: "UXFlow",
    modified: "3 周前",
    icon: <LayoutGrid className="text-fuchsia-500" />,
    shared: true,
    size: "18.3 MB",
    collaborators: 5,
  },
  {
    name: "Product Photography.phl",
    app: "PhotoLab",
    modified: "上个月",
    icon: <Camera className="text-teal-500" />,
    shared: false,
    size: "156 MB",
    collaborators: 0,
  },
]

// Sample data for projects
const projects = [
  {
    name: "Website Redesign",
    description: "公司官网的全面改版",
    progress: 75,
    dueDate: "2025 年 6 月 15 日",
    members: 4,
    files: 23,
  },
  {
    name: "Mobile App Launch",
    description: "全新移动应用的设计与素材",
    progress: 60,
    dueDate: "2025 年 7 月 30 日",
    members: 6,
    files: 42,
  },
  {
    name: "Brand Identity",
    description: "全新品牌规范与素材",
    progress: 90,
    dueDate: "2025 年 5 月 25 日",
    members: 3,
    files: 18,
  },
  {
    name: "Marketing Campaign",
    description: "夏季活动推广物料",
    progress: 40,
    dueDate: "2025 年 8 月 10 日",
    members: 5,
    files: 31,
  },
]

// 教程示例数据
const tutorials = [
  {
    title: "数字插画大师课",
    description: "学习创作惊艳数字艺术的高级技巧",
    duration: "1 小时 45 分",
    level: "高级",
    instructor: "Sarah Chen",
    category: "插画",
    views: "24K",
  },
  {
    title: "UI/UX 设计基础",
    description: "打造直观界面的核心原则",
    duration: "2 小时 20 分",
    level: "进阶",
    instructor: "Michael Rodriguez",
    category: "设计",
    views: "56K",
  },
  {
    title: "视频剪辑大师班",
    description: "电影级视频剪辑专业技巧",
    duration: "3 小时 10 分",
    level: "高级",
    instructor: "James Wilson",
    category: "视频",
    views: "32K",
  },
  {
    title: "字体设计基础",
    description: "为任何项目打造优美且高效的字体排版",
    duration: "1 小时 30 分",
    level: "入门",
    instructor: "Emma Thompson",
    category: "字体",
    views: "18K",
  },
  {
    title: "设计师的色彩理论",
    description: "理解色彩关系与心理学",
    duration: "2 小时 05 分",
    level: "进阶",
    instructor: "David Kim",
    category: "设计",
    views: "41K",
  },
]

// 社区帖子示例数据（作为初始回退数据）
const initialCommunityPosts = [
  {
    title: "极简风格 Logo 设计",
    author: "Alex Morgan",
    likes: 342,
    comments: 28,
    image: "/placeholder.svg?height=300&width=400",
    time: "2 天前",
  },
  {
    title: "3D 角色概念",
    author: "Priya Sharma",
    likes: 518,
    comments: 47,
    image: "/placeholder.svg?height=300&width=400",
    time: "1 周前",
  },
  {
    title: "UI 仪表盘重设计",
    author: "Thomas Wright",
    likes: 276,
    comments: 32,
    image: "/placeholder.svg?height=300&width=400",
    time: "3 天前",
  },
  {
    title: "产品摄影布光",
    author: "Olivia Chen",
    likes: 189,
    comments: 15,
    image: "/placeholder.svg?height=300&width=400",
    time: "5 天前",
  },
]

// ===================== 全局类型声明（避免 TypeScript 报错）=====================
declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (config: any) => any;
    };
    KJUR?: any;
  }
}

// ===================== Coze JWT 配置（请替换为你的真实信息）=====================
const COZE_JWT_CONFIG = {
  // Coze后台 → 开发者设置 → 应用ID
  appId: "1146196662254",
  // Coze后台 → 开发者设置 → 接口凭证 → 公钥
  publicKey: "-CSCxkFPQiXll0uBE-TxeIgCZSPpyx-Wtox_o65YvkI",
  // Coze后台生成的RSA私钥（保持格式完整，不要删除首尾标识）
  privateKey: process.env.NEXT_PUBLIC_COZE_PRIVATE_KEY ?? "",
  // Coze后台 → 机器人设置 → 机器人ID（原appId）
  botId: "7560276108453675054",
};

// ===================== 核心隔离逻辑：生成用户唯一ID =====================
/**
 * 获取用户唯一标识（会话隔离的根）
 * - 优先使用业务登录用户ID
 * - 无登录态时生成访客ID并持久化到localStorage
 */
function getUserUid(): string {
  // 1. 优先读取业务登录用户ID（你系统的登录态key，可自定义）
  const loggedUserId = localStorage.getItem("website_user_id");
  if (loggedUserId) return loggedUserId;

  // 2. 无登录态时生成/读取持久化访客ID
  let visitorId = localStorage.getItem("coze_quiz_visitor_id");
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("coze_quiz_visitor_id", visitorId);
  }
  return visitorId;
}

// ===================== JWT 核心函数 =====================
/**
 * 加载 JWT 加密库（jsrsasign）
 */
function loadJwtLibrary(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.KJUR && window.KJUR.jws && window.KJUR.jws.JWS) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/8.0.20/jsrsasign-all-min.js";
    script.type = "text/javascript";
    script.crossOrigin = "anonymous";

    script.onload = () => {
      if (window.KJUR && window.KJUR.jws && window.KJUR.jws.JWS) {
        resolve();
      } else {
        reject(new Error("JWT库加载成功但初始化失败"));
      }
    };

    script.onerror = () => {
      reject(new Error("JWT库加载失败，请检查网络或CDN链接"));
    };

    document.head.appendChild(script);
  });
}

/**
 * 生成绑定用户ID的Coze JWT
 * @param userUid 用户唯一标识
 */
function generateCozeJwt(userUid: string): string {
  if (!window.KJUR) throw new Error("JWT库未加载");
  if (!COZE_JWT_CONFIG.privateKey) {
    throw new Error("Missing COZE private key. Configure env and sign server-side.");
  }

  // JWT头部：指定RS256算法+公钥ID
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: COZE_JWT_CONFIG.publicKey,
  };

  // JWT载荷：绑定用户ID+有效期（1小时）
  const currentTime = Math.floor(Date.now() / 1000);
  const payload = {
    iss: COZE_JWT_CONFIG.appId,       // 签发方（你的应用ID）
    aud: "api.coze.cn",               // 接收方（固定值）
    jti: Math.random().toString(36).substr(2, 32) + Date.now(), // 唯一ID
    iat: currentTime,                 // 签发时间
    exp: currentTime + 3600,          // 过期时间
    session_name: userUid,            // 核心：绑定用户ID，服务端隔离标识
  };

  // 用私钥签名生成JWT
  return window.KJUR.jws.JWS.sign(
    header.alg,
    JSON.stringify(header),
    JSON.stringify(payload),
    COZE_JWT_CONFIG.privateKey
  );
}

/**
 * 用JWT换取Coze Access Token（短期有效，用户专属）
 * @param jwt 签名后的JWT
 */
async function getCozeAccessToken(jwt: string): Promise<string> {
  try {
    const response = await fetch("https://api.coze.cn/api/permission/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        duration_seconds: 900, // Token有效期15分钟（建议不超过3600）
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`获取Token失败 [${response.status}]：${errorData.msg || "未知错误"}`);
    }

    const data = await response.json();
    if (!data.access_token) throw new Error("返回数据中无access_token");
    return data.access_token;
  } catch (error) {
    console.error("获取Coze Access Token失败：", error);
    throw error;
  }
}

// ===================== 原有组件逻辑（集成JWT+隔离）=====================
function CozeQuizModule() {
  const [cozeReady, setCozeReady] = useState(false);
  const [cozeError, setCozeError] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string>(""); // 存储用户唯一ID

  useEffect(() => {
    // 核心初始化函数（集成JWT+SDK）
    const initCozeWithJWT = async () => {
      try {
        // 步骤1：生成用户唯一ID（隔离根标识）
        const uid = getUserUid();
        setUserUid(uid);
        console.log("【会话隔离】当前用户ID：", uid);

        // 步骤2：加载JWT加密库
        await loadJwtLibrary();
        console.log("✅ JWT库加载成功");

        // 步骤3：生成绑定用户ID的JWT
        const jwt = generateCozeJwt(uid);
        console.log("✅ JWT生成成功：", jwt.substring(0, 50) + "...");

        // 步骤4：换取用户专属Access Token
        const accessToken = await getCozeAccessToken(jwt);
        console.log("✅ Access Token获取成功：", accessToken.substring(0, 50) + "...");

        // 步骤5：销毁旧SDK实例（避免多实例串号）
        if ((window as any).cozeQuizSDK) {
          try {
            (window as any).cozeQuizSDK.destroy?.();
          } catch (e) {
            console.warn("销毁旧SDK实例失败：", e);
          }
          (window as any).cozeQuizSDK = null;
        }

        // 步骤6：加载Coze SDK脚本
        const script = document.createElement('script');
        script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/builder-web-sdk/0.1.1-beta.1/dist/umd/index.js';
        script.async = true;

        script.onload = () => {
          try {
            if (typeof (window as any).CozeWebSDK === 'undefined') {
              setCozeError('无法加载 Coze Web SDK');
              return;
            }

            // 步骤7：初始化Coze SDK（核心：JWT Token + 隔离配置）
            const sdk = new (window as any).CozeWebSDK.AppWebSDK({
              token: accessToken, // 替换原固定Token为JWT生成的用户专属Token
              appId: COZE_JWT_CONFIG.botId, // 机器人ID
              container: '#coze-quiz-container',
              // 隔离配置1：userInfo绑定用户唯一ID
              userInfo: {
                id: uid,
                nickname: uid.startsWith("visitor_") 
                  ? `访客${uid.slice(-6)}` 
                  : `用户${uid.slice(-4)}`,
                avatarUrl: 'https://lf-coze-web-cdn.coze.cn/obj/eden-cn/lm-lgvj/ljhwZthlaukjlkulzlp/coze/coze-logo.png',
              },
              // 隔离配置2：服务端会话隔离（绑定用户ID）
              context: {
                sessionId: uid, // 服务端会话唯一标识 = 用户ID
              },
              // 隔离配置3：本地缓存隔离（绑定用户ID）
              session: {
                persist: true, // 持久化会话（刷新保留自己的聊天记录）
                key: `coze_quiz_session_${uid}`, // 本地存储键 = 用户ID
                autoRestore: true, // 自动恢复当前用户的会话
              },
              ui: {
                className: 'coze-quiz-theme',
              },
              onReady: function() {
                console.log('✅ Coze 自动化出题模块初始化成功（JWT+会话隔离生效）');
                setCozeReady(true);
              },
              onError: function(error: any) {
                console.error('❌ Coze 自动化出题模块初始化失败:', error);
                setCozeError(`初始化失败: ${error.message || '未知错误'}`);
              },
              // 隔离配置4：Token过期自动刷新（保持隔离不中断）
              onTokenExpired: async () => {
                try {
                  const newJwt = generateCozeJwt(uid);
                  const newToken = await getCozeAccessToken(newJwt);
                  sdk.updateToken(newToken); // 更新Token
                  console.log("✅ Token已刷新，会话隔离继续生效");
                } catch (e) {
                  console.error("❌ Token刷新失败：", e);
                  setCozeError("Token过期，刷新页面重试");
                }
              }
            });

            // 保存SDK实例
            (window as any).cozeQuizSDK = sdk;
          } catch (error: any) {
            console.error('❌ Coze SDK 初始化过程中发生错误:', error);
            setCozeError(`初始化错误: ${error.message}`);
          }
        };

        script.onerror = () => {
          setCozeError('无法加载 Coze SDK 脚本');
        };

        document.head.appendChild(script);

        // 组件卸载清理
        return () => {
          // 销毁SDK实例
          if ((window as any).cozeQuizSDK) {
            (window as any).cozeQuizSDK.destroy?.();
            (window as any).cozeQuizSDK = null;
          }
          // 移除脚本
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } catch (error: any) {
        console.error('❌ JWT/Token 处理失败:', error);
        setCozeError(`认证失败: ${error.message}`);
      }
    };

    // 执行初始化
    initCozeWithJWT();
  }, []);

  // ===================== 原有UI结构（完全保留，仅微调提示）=====================
  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">AI 智能出题助手</h3>
          <p className="text-sm text-muted-foreground">
            与AI对话，获取个性化练习题和知识点讲解（JWT会话隔离）
          </p>
        </div>
        <Badge variant="outline" className="rounded-xl bg-blue-50 text-blue-600">
          JWT隔离版
        </Badge>
      </div>

     <div className="rounded-3xl border overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col h-[calc(100vh-200px)]">
        <div className="p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium">Coze AI 学习助手</h4>
              <p className="text-xs text-muted-foreground">
                基于大模型的智能出题与答疑系统 | 用户ID: {userUid.slice(-6)}
              </p>
            </div>
          </div>
        </div>

        <div id="coze-quiz-container" className="relative h-full">
          {!cozeReady && !cozeError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-muted-foreground">正在加载 AI 出题助手...</p>
              <p className="text-xs text-muted-foreground mt-2">用户ID: {userUid || "生成中"}</p>
            </div>
          )}

          {cozeError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                <X className="h-6 w-6" />
              </div>
              <p className="font-medium text-red-600">加载失败</p>
              <p className="text-sm text-muted-foreground text-center mt-1">{cozeError}</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-xl"
                onClick={() => window.location.reload()}
              >
                重试
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {cozeReady ? (
                <span className="flex items-center gap-1 text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  AI 助手已就绪（JWT隔离生效）
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  正在初始化（JWT认证中）
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                切换主题
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                使用说明
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="rounded-2xl">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">智能出题</p>
                <p className="text-xs text-muted-foreground">根据学习进度自动生成题目</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">即时答疑</p>
                <p className="text-xs text-muted-foreground">随时解答学习中的疑问</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">学习分析</p>
                <p className="text-xs text-muted-foreground">分析学习弱点，推荐内容</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CozeQuizModule;
// 侧边导航简化为四项（保留框架）
type SidebarItem = {
  title: string
  icon: ReactNode
  url: string
  isActive?: boolean
  badge?: ReactNode
  children?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  { title: "首页", icon: <Home />, url: "#home", isActive: true },
  {
    title: "社区",
    icon: <Users />,
    url: "#apps",
    children: [
      { title: "灵动版", icon: <Sparkles className="h-4 w-4" />, url: "#apps" },
      { title: "经典版", icon: <LayoutGrid className="h-4 w-4" />, url: "http://127.0.0.1:8000/" },
    ],
  },
  { title: "资源", icon: <Bookmark />, url: "#resources" },
  { title: "学习", icon: <BookOpen />, url: "#learn" },
]

const moduleTabs = [
  { value: "home", label: "首页" },
  { value: "apps", label: "社区" },
  { value: "resources", label: "资源" },
  { value: "learn", label: "学习" },
]

// 论坛类型
interface ForumPost {
  id: number
  title: string
  content?: string
  author?: string
  author_id?: number
  likes_count?: number
  views_count?: number
  is_pinned?: boolean
  is_featured?: boolean
  created_at?: string
  updated_at?: string
}

interface ForumComment {
  id: number
  content: string
  created_at?: string
  author?: string
  author_id?: number
}

interface ForumDetail extends ForumPost {
  comments: ForumComment[]
  liked?: boolean
}

function resolveApiBase(rawBase: string): string {
  if (typeof window === 'undefined') return rawBase
  try {
    const url = new URL(rawBase)
    const isLocalAlias = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    const pageHost = window.location.hostname
    const pageIsLocalAlias = pageHost === 'localhost' || pageHost === '127.0.0.1'
    if (isLocalAlias && pageIsLocalAlias && url.hostname !== pageHost) {
      url.hostname = pageHost
    }
    return url.origin
  } catch {
    return rawBase
  }
}

export function DesignaliCreative() {
  const [progress, setProgress] = useState(0)
  const [notifications, setNotifications] = useState(5)
  const [activeTab, setActiveTab] = useState("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  // community posts loaded from backend API (fallback to initial data)
  const [communityPostsState, setCommunityPostsState] = useState<any[]>(initialCommunityPosts)

  // 简化模式：隐藏首页/学习/资源中的次要小组件，方便与后端社区对接
  const simplifyUI = true
  const [currentNickname, setCurrentNickname] = useState<string | null>(null)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [bioInput, setBioInput] = useState('')
  const [savingNickname, setSavingNickname] = useState(false)

  // Forum states
  const [me, setMe] = useState<any | null>(null)
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])
  const [forumPage, setForumPage] = useState(1)
  const [forumTotal, setForumTotal] = useState(0)
  const [forumLoadingList, setForumLoadingList] = useState(false)
  const [forumSelectedId, setForumSelectedId] = useState<number | null>(null)
  const [forumSelected, setForumSelected] = useState<ForumDetail | null>(null)
  const [forumLoadingDetail, setForumLoadingDetail] = useState(false)
  const [forumError, setForumError] = useState<string | null>(null)
  const [forumNotice, setForumNotice] = useState<string | null>(null)
  const [forumDetailOpen, setForumDetailOpen] = useState(false)
  const [forumCreateOpen, setForumCreateOpen] = useState(false)
  const [forumCreateForm, setForumCreateForm] = useState({ title: "", content: "" })
  const [forumCreating, setForumCreating] = useState(false)
  const [forumCommentText, setForumCommentText] = useState("")
  const [forumCommenting, setForumCommenting] = useState(false)
  const [forumSearch, setForumSearch] = useState("")
  const [forumQuery, setForumQuery] = useState("")
  const [forumSort, setForumSort] = useState<'latest' | 'views' | 'likes'>('latest')

  const forumPageSize = 10
  const forumPageCount = Math.max(1, Math.ceil((forumTotal || 0) / forumPageSize))
  const API_BASE = useMemo(
    () => resolveApiBase(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'),
    [],
  )

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me/`, { credentials: 'include' })
      if (!res.ok) return
      const d = await res.json()
      setMe(d)
      if (d.nickname) {
        setCurrentNickname(d.nickname)
      } else {
        setNicknameInput('')
        setBioInput(d.bio || '')
        setShowNicknameModal(true)
      }
    } catch (e) {
      // ignore
    }
  }, [API_BASE])

  const loadForumDetail = useCallback(async (postId: number) => {
    setForumSelectedId(postId)
    setForumLoadingDetail(true)
    setForumError(null)
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${postId}/`, { credentials: 'include' })
      if (!res.ok) throw new Error('failed')
      const data: ForumDetail = await res.json()
      setForumSelected(data)
      setForumCommentText('')
      fetch(`${API_BASE}/api/blogs/${postId}/view/`, { method: 'POST', credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((viewData) => {
          if (viewData?.views_count !== undefined) {
            setForumSelected((prev) => (prev && prev.id === postId ? { ...prev, views_count: viewData.views_count } : prev))
            setForumPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, views_count: viewData.views_count } : p)))
          }
        })
        .catch(() => {})
    } catch (err) {
      setForumError('加载帖子详情失败')
    } finally {
      setForumLoadingDetail(false)
    }
  }, [API_BASE])

  const sortPosts = useCallback((list: ForumPost[], sort: 'latest' | 'views' | 'likes') => {
    const arr = [...list]
    if (sort === 'views') {
      return arr.sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    }
    if (sort === 'likes') {
      return arr.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    }
    return arr.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return tb - ta
    })
  }, [])

  const loadForumList = useCallback(
    async (page = forumPage, preferredSelected?: number, query?: string) => {
      const effectiveQuery = (query ?? forumQuery).trim()
      setForumLoadingList(true)
      setForumError(null)
      try {
        const res = await fetch(
          `${API_BASE}/api/blogs/?page=${page}&page_size=${forumPageSize}${effectiveQuery ? `&q=${encodeURIComponent(effectiveQuery)}` : ''}`,
          { credentials: 'include' },
        )
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        const results: ForumPost[] = data.results || []
        const filtered = effectiveQuery
          ? results.filter((p) => {
              const target = `${p.title || ''} ${p.content || ''} ${p.author || ''}`.toLowerCase()
              return target.includes(effectiveQuery.toLowerCase())
            })
          : results
        const sorted = sortPosts(filtered, forumSort)
        setForumPosts(sorted)
        setForumTotal(effectiveQuery ? sorted.length : data.total || sorted.length)
        const desired = preferredSelected ?? forumSelectedId
        const matched = sorted.find((p) => p.id === desired)
        const nextId = matched?.id ?? sorted[0]?.id ?? null
        if (nextId) {
          setForumSelectedId(nextId)
          if (nextId !== forumSelectedId || preferredSelected) {
            loadForumDetail(nextId)
          }
        } else {
          setForumSelected(null)
          setForumSelectedId(null)
        }
      } catch (err) {
        setForumError('社区数据加载失败')
      } finally {
        setForumLoadingList(false)
      }
    },
    [API_BASE, forumPage, forumPageSize, forumSelectedId, forumQuery, forumSort, loadForumDetail, sortPosts],
  )

  const handleForumSearch = useCallback(
    (override?: string) => {
      const q = (override ?? forumSearch).trim()
      setForumQuery(q)
      setForumPage(1)
    },
    [forumSearch],
  )

  const handleCreatePost = useCallback(async () => {
    if (!forumCreateForm.title.trim() || !forumCreateForm.content.trim()) {
      setForumError('请填写标题和内容')
      return
    }
    setForumError(null)
    setForumNotice(null)
    setForumCreating(true)
    try {
      const res = await fetch(`${API_BASE}/api/blogs/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forumCreateForm),
      })
      if (res.status === 401) {
        // eslint-disable-next-line no-alert
        alert('登录状态已失效，请先登录后再发布帖子。')
        window.location.href = '/login'
        return
      }
      if (!res.ok) throw new Error('create failed')
      const created = await res.json()
      setForumCreateOpen(false)
      setForumCreateForm({ title: '', content: '' })
      setForumPage(1)
      setForumSelectedId(created.id)
      if (created?.is_approved === false) {
        setForumNotice('帖子已提交审核，审核通过后会显示在公开论坛。')
      } else {
        setForumNotice('帖子发布成功。')
      }
      await loadForumList(1, created.id)
    } catch (err) {
      setForumNotice(null)
      setForumError('创建帖子失败，可能需要登录')
    } finally {
      setForumCreating(false)
    }
  }, [API_BASE, forumCreateForm, loadForumList])

  const handleSubmitComment = useCallback(async () => {
    if (!forumSelectedId || !forumCommentText.trim()) return
    setForumCommenting(true)
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${forumSelectedId}/comments/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: forumCommentText }),
      })
      if (!res.ok) throw new Error('comment failed')
      const c = await res.json()
      setForumSelected((prev) => (prev && prev.id === forumSelectedId ? { ...prev, comments: [c, ...(prev.comments || [])] } : prev))
      setForumCommentText('')
    } catch (err) {
      setForumError('发表评论失败，可能需要登录')
    } finally {
      setForumCommenting(false)
    }
  }, [API_BASE, forumCommentText, forumSelectedId])

  const handleToggleLike = useCallback(async () => {
    if (!forumSelectedId) return
    try {
      const res = await fetch(`${API_BASE}/api/blogs/${forumSelectedId}/like/`, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error('like failed')
      const data = await res.json()
      setForumSelected((prev) => (prev && prev.id === forumSelectedId ? { ...prev, liked: data.liked, likes_count: data.likes_count } : prev))
      setForumPosts((prev) => prev.map((p) => (p.id === forumSelectedId ? { ...p, likes_count: data.likes_count } : p)))
    } catch (err) {
      setForumError('点赞失败，可能需要登录')
    }
  }, [API_BASE, forumSelectedId])

  const handleRefreshList = useCallback(() => loadForumList(forumPage, forumSelectedId || undefined), [forumPage, forumSelectedId, loadForumList])

  useEffect(() => {
    if (!forumNotice) return
    const timer = window.setTimeout(() => {
      setForumNotice(null)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [forumNotice])

  const formatDate = (value?: string) => {
    if (!value) return ''
    try {
      return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    } catch (e) {
      return value
    }
  }

  const isSidebarActive = useCallback(
    (item: SidebarItem): boolean => {
      if (item.children?.length) {
        return item.children.some((child) => isSidebarActive(child))
      }
      if (item.url?.startsWith('#')) {
        const key = item.url.replace('#', '') || 'home'
        return activeTab === key
      }
      return false
    },
    [activeTab],
  )

  const handleSidebarNavigation = useCallback(
    (item: SidebarItem) => {
      if (item.children?.length) {
        setExpandedItems((prev) => ({ ...prev, [item.title]: !prev[item.title] }))
        return
      }

      if (item.url?.startsWith('http')) {
        window.location.href = item.url
        return
      }

      if (item.url?.startsWith('#')) {
        const key = item.url.replace('#', '') || 'home'
        setActiveTab(key)
        const targetId = item.url === '#community' ? 'community-section' : undefined
        if (targetId) {
          const el = document.getElementById(targetId)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    },
    [setActiveTab],
  )

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const saveNickname = async () => {
    if (!nicknameInput || savingNickname) return
    setSavingNickname(true)
    try {
      const form = new FormData()
      form.append('nickname', nicknameInput)
      form.append('bio', bioInput)
      const res = await fetch(`${API_BASE}/api/users/me/update/`, { method: 'POST', credentials: 'include', body: form })
      if (!res.ok) throw new Error('保存失败')
      const updated = await res.json()
      setCurrentNickname(updated.nickname || null)
      setShowNicknameModal(false)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('保存昵称失败', e)
      alert('保存昵称失败，请重试')
    } finally {
      setSavingNickname(false)
    }
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/community/posts/`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data) => setCommunityPostsState(data.results || initialCommunityPosts))
      .catch(() => {
        // keep initial fallback data on error
      })
  }, [API_BASE])

  // 模拟进度加载
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    loadForumList(forumPage, undefined, forumQuery)
  }, [forumPage, forumQuery, loadForumList])

  useEffect(() => {
    setForumPosts((prev) => sortPosts(prev, forumSort))
  }, [forumSort, sortPosts])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Dialog open={showNicknameModal} onOpenChange={setShowNicknameModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置昵称</DialogTitle>
            <DialogDescription>为了完善个人资料，请先设置昵称（必填）。</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground">昵称</label>
              <input className="w-full rounded-md border px-3 py-2" value={nicknameInput} onChange={(e) => setNicknameInput(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground">个人简介（选填）</label>
              <textarea className="w-full rounded-md border px-3 py-2" rows={3} value={bioInput} onChange={(e) => setBioInput(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNicknameModal(false)}>稍后设置</Button>
            <Button onClick={saveNickname} disabled={savingNickname}>{savingNickname ? '保存中...' : '保存并进入'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 30% 70%, rgba(233, 30, 99, 0.5) 0%, rgba(81, 45, 168, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.5) 0%, rgba(32, 119, 188, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
            "radial-gradient(circle at 50% 50%, rgba(120, 41, 190, 0.5) 0%, rgba(53, 71, 125, 0.5) 50%, rgba(0, 0, 0, 0) 100%)",
          ],
        }}
        transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col border-r">
          <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                  <Wand2 className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold">EntroMind</h2>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const active = isSidebarActive(item)
                const expanded = expandedItems[item.title]
                return (
                  <div key={item.title} className="mb-1">
                    <button
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                        active ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-muted",
                      )}
                      onClick={() => handleSidebarNavigation(item)}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.children?.length ? (
                          <ChevronDown
                            className={cn("h-4 w-4 transition-transform", expanded ? "rotate-180 text-primary" : "text-muted-foreground")}
                          />
                        ) : null}
                      </div>
                    </button>

                    {item.children?.length && expanded && (
                      <div className="mt-1 space-y-1 pl-10">
                        {item.children.map((child) => {
                          const childActive = isSidebarActive(child)
                          return (
                            <button
                              key={child.title}
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm",
                                childActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                              )}
                              onClick={() => handleSidebarNavigation(child)}
                            >
                              <div className="flex items-center gap-2">
                                {child.icon}
                                <span>{child.title}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <Settings className="h-5 w-5" />
                <span>设置</span>
              </button>
              <UserBadge className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 transform border-r bg-background transition-transform duration-300 ease-in-out md:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <Wand2 className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">EntroMind</h2>
              </div>
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="搜索..." className="w-full rounded-2xl bg-muted pl-9 pr-4 py-2" />
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const active = isSidebarActive(item)
                const expanded = expandedItems[item.title]
                return (
                  <div key={item.title} className="mb-1">
                    <button
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium",
                        active ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-muted",
                      )}
                      onClick={() => handleSidebarNavigation(item)}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge variant="outline" className="ml-auto rounded-full px-2 py-0.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {item.children?.length ? (
                          <ChevronDown
                            className={cn("h-4 w-4 transition-transform", expanded ? "rotate-180 text-primary" : "text-muted-foreground")}
                          />
                        ) : null}
                      </div>
                    </button>

                    {item.children?.length && expanded && (
                      <div className="mt-1 space-y-1 pl-10">
                        {item.children.map((child) => {
                          const childActive = isSidebarActive(child)
                          return (
                            <button
                              key={child.title}
                              className={cn(
                                "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm",
                                childActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
                              )}
                              onClick={() => handleSidebarNavigation(child)}
                            >
                              <div className="flex items-center gap-2">
                                {child.icon}
                                <span>{child.title}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          <div className="border-t p-3">
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
                <Settings className="h-5 w-5" />
                <span>设置</span>
              </button>
              <UserBadge className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("min-h-screen transition-all duration-300 ease-in-out", sidebarOpen ? "md:pl-64" : "md:pl-0")}>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <PanelLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">机器人与安全智能体平台</h1>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl">
                      <Cloud className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>云存储</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>消息</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl relative">
                      <Bell className="h-5 w-5" />
                      {notifications > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {notifications}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>通知</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Avatar className="h-9 w-9 border-2 border-primary">
                {me?.avatar ? (
                  <AvatarImage src={me.avatar} alt={me.nickname || me.username || '用户'} />
                ) : (
                  <AvatarFallback>{(me?.nickname || me?.username || 'U').charAt(0)}</AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="grid w-full max-w-[840px] grid-cols-4 rounded-full bg-muted/60 p-1.5 shadow-inner">
                {moduleTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-full px-4 py-2 text-sm font-medium transition-all hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Button variant="outline" className="rounded-2xl">
                  <Download className="mr-2 h-4 w-4" />
                  安装客户端
                </Button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="home" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-4">
                      <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">高级版</Badge>
                      <h2 className="text-3xl font-bold">欢迎使用 EntroMind 创意套件</h2>
                      <p className="max-w-[600px] text-white/80">
                        借助一站式专业设计工具与资源，释放你的创意灵感。
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                          查看方案
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-2xl bg-transparent border-white text-white hover:bg-white/10"
                        >
                          快速浏览
                        </Button>
                          </div>
                        </div>
                        <div className="hidden lg:block">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="relative h-40 w-40"
                          >
                            <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                            <div className="absolute inset-4 rounded-full bg-white/20" />
                            <div className="absolute inset-8 rounded-full bg-white/30" />
                            <div className="absolute inset-12 rounded-full bg-white/40" />
                            <div className="absolute inset-16 rounded-full bg-white/50" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {!simplifyUI && (
                    <section id="community-section" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">最近使用的应用</h2>
                        <Button variant="ghost" className="rounded-2xl">
                          查看全部
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {apps
                          .filter((app) => app.recent)
                          .map((app) => (
                            <motion.div key={app.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                              <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                      {app.icon}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-2xl">
                                      <Star className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                  <CardTitle className="text-lg">{app.name}</CardTitle>
                                  <CardDescription>{app.description}</CardDescription>
                                </CardContent>
                                <CardFooter>
                                  <Button variant="secondary" className="w-full rounded-2xl">
                                    打开
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                      </div>
                    </section>
                  )}

                  {!simplifyUI && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                      <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">最近文件</h2>
                        <Button variant="ghost" className="rounded-2xl">
                          查看全部
                        </Button>
                      </div>
                      <div className="rounded-3xl border">
                        <div className="grid grid-cols-1 divide-y">
                          {recentFiles.slice(0, 4).map((file) => (
                            <motion.div
                              key={file.name}
                              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                              className="flex items-center justify-between p-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                                  {file.icon}
                                </div>
                                <div>
                                  <p className="font-medium">{file.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {file.app} · {file.modified}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {file.shared && (
                                  <Badge variant="outline" className="rounded-xl">
                                    <Users className="mr-1 h-3 w-3" />
                                    {file.collaborators}
                                  </Badge>
                                )}
                                <Button variant="ghost" size="sm" className="rounded-xl">
                                  打开
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">进行中项目</h2>
                        <Button variant="ghost" className="rounded-2xl">
                          查看全部
                        </Button>
                      </div>
                      <div className="rounded-3xl border">
                        <div className="grid grid-cols-1 divide-y">
                          {projects.slice(0, 3).map((project) => (
                            <motion.div
                              key={project.name}
                              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                              className="p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">{project.name}</h3>
                                <Badge variant="outline" className="rounded-xl">
                                  截止 {project.dueDate}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>进度</span>
                                  <span>{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2 rounded-xl" />
                              </div>
                              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Users className="mr-1 h-4 w-4" />
                                  {project.members} 位成员
                                </div>
                                <div className="flex items-center">
                                  <FileText className="mr-1 h-4 w-4" />
                                  {project.files} 个文件
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      </section>
                    </div>
                  )}

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">社区精选</h2>
                      <Button
                        variant="ghost"
                        className="rounded-2xl"
                        onClick={() => {
                          setActiveTab('apps')
                          requestAnimationFrame(() => {
                            const el = document.getElementById('dynamic-forum-section')
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          })
                        }}
                      >
                        去逛逛
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {communityPostsState.map((post) => (
                        <motion.div key={post.title} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                          <Card className="overflow-hidden rounded-3xl">
                            <div className="aspect-[4/3] overflow-hidden bg-muted">
                              <img
                                src={post.image || "/placeholder.svg"}
                                alt={post.title}
                                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            </div>
                              <CardContent className="p-4">
                              <h3 className="font-semibold">{post.title}</h3>
                              <p className="text-sm text-muted-foreground">作者 {post.author}</p>
                              <div className="mt-2 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  {post.likes}
                                  <MessageSquare className="ml-2 h-4 w-4 text-blue-500" />
                                  {post.comments}
                                </div>
                                <span className="text-muted-foreground">{post.time}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="learn" className="space-y-8 mt-0" id="learn-section">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">学习与进阶</h2>
                          <p className="max-w-[600px] text-white/80">通过教程、课程与AI助手拓展你的创意技能。</p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-emerald-700 hover:bg-white/90">
                          <Crown className="mr-2 h-4 w-4" />
                          升级专业版
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  {/* Coze 自动化出题模块 */}
                  <section className="space-y-4">
                    <CozeQuizModule />
                  </section>
                </TabsContent>

                <TabsContent value="apps" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">社区论坛</h2>
                          <p className="max-w-[600px] text-white/80">
                            浏览、讨论、点赞并发布帖子。数据来自后端 /api/blogs/ 系列接口（携带 session）。
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" className="rounded-2xl bg-white/15 text-white hover:bg-white/25" onClick={handleRefreshList} disabled={forumLoadingList}>
                            {forumLoadingList ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            刷新列表
                          </Button>
                          <Button className="rounded-2xl bg-white text-red-700 hover:bg-white/90" onClick={() => setForumCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            发布帖子
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <section id="dynamic-forum-section" className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-semibold">论坛动态</h2>
                        <p className="text-sm text-muted-foreground">{currentNickname ? `欢迎，${currentNickname}` : '登录后可发帖与互动'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="rounded-xl">共 {forumTotal || forumPosts.length} 条</Badge>
                        {me?.is_admin && <Badge variant="outline" className="rounded-xl">管理员</Badge>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                      <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="搜索帖子标题、作者或内容"
                          className="w-full rounded-2xl pl-9"
                          value={forumSearch}
                          onChange={(e) => setForumSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleForumSearch()
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="rounded-2xl" onClick={() => handleForumSearch()}>搜索</Button>
                        {forumQuery && (
                          <Button variant="ghost" className="rounded-2xl" onClick={() => { setForumSearch(''); handleForumSearch('') }}>清空</Button>
                        )}
                        <Button
                          variant={forumSort === 'views' ? 'default' : 'outline'}
                          className="rounded-2xl"
                          onClick={() => setForumSort('views')}
                        >
                          <Eye className="mr-2 h-4 w-4" />按浏览
                        </Button>
                        <Button
                          variant={forumSort === 'likes' ? 'default' : 'outline'}
                          className="rounded-2xl"
                          onClick={() => setForumSort('likes')}
                        >
                          <Heart className="mr-2 h-4 w-4" />按点赞
                        </Button>
                        <Button
                          variant={forumSort === 'latest' ? 'default' : 'ghost'}
                          className="rounded-2xl"
                          onClick={() => setForumSort('latest')}
                        >
                          <ArrowUpDown className="mr-2 h-4 w-4" />最新
                        </Button>
                      </div>
                    </div>

                    {forumNotice && (
                      <Card className="rounded-3xl border-emerald-200 bg-emerald-50/70 text-emerald-700">
                        <CardContent className="flex items-center justify-between gap-3 p-4">
                          <span>{forumNotice}</span>
                          <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setForumNotice(null)}>关闭</Button>
                        </CardContent>
                      </Card>
                    )}

                    {forumError && (
                      <Card className="rounded-3xl border-red-200 bg-red-50/60 text-red-700">
                        <CardContent className="flex items-center justify-between gap-3 p-4">
                          <span>{forumError}</span>
                          <Button variant="outline" size="sm" className="rounded-2xl" onClick={handleRefreshList}>重试</Button>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-4">
                      <Card className="rounded-3xl">
                        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>公开帖子</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setForumPage((p) => Math.max(1, p - 1))} disabled={forumPage <= 1 || forumLoadingList}>
                              上一页
                            </Button>
                            <span className="text-sm text-muted-foreground">第 {forumPage} / {forumPageCount} 页</span>
                            <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setForumPage((p) => Math.min(forumPageCount, p + 1))} disabled={forumPage >= forumPageCount || forumLoadingList}>
                              下一页
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {forumLoadingList && (
                            <div className="flex items-center gap-2 rounded-2xl border bg-muted/40 p-3 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              列表加载中...
                            </div>
                          )}
                          {!forumLoadingList && forumPosts.length === 0 && (
                            <div className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
                              暂无帖子，点击右上角发布你的第一篇。
                            </div>
                          )}
                          {forumPosts.map((post) => {
                            const isActive = forumSelectedId === post.id
                            return (
                              <button
                                key={post.id}
                                onClick={() => {
                                  loadForumDetail(post.id)
                                  setForumDetailOpen(true)
                                }}
                                className={cn(
                                  'w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm',
                                  isActive ? 'border-primary/60 bg-primary/5' : 'border-muted'
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-semibold text-base">{post.title}</span>
                                      {post.is_pinned && <Badge className="rounded-xl">置顶</Badge>}
                                      {post.is_featured && <Badge variant="secondary" className="rounded-xl">加精</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {(post.author || '匿名用户')}{post.created_at ? ` · ${formatDate(post.created_at)}` : ''}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.views_count || 0}</span>
                                    <span className="flex items-center gap-1"><Heart className="h-4 w-4 text-red-500" />{post.likes_count || 0}</span>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </CardContent>
                      </Card>
                    </div>
                  </section>

                  <Dialog open={forumCreateOpen} onOpenChange={setForumCreateOpen}>
                    <DialogContent className="w-[92vw] max-w-3xl border-slate-200 bg-white text-slate-900">
                      <DialogHeader>
                        <DialogTitle>发布帖子</DialogTitle>
                        <DialogDescription className="text-slate-600">提交后将创建新的论坛帖子（需要已登录）。</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-700">标题</label>
                          <Input className="mt-1 h-12 border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400" value={forumCreateForm.title} onChange={(e) => setForumCreateForm((s) => ({ ...s, title: e.target.value }))} placeholder="请输入标题" />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700">内容</label>
                          <textarea
                            className="mt-1 min-h-[320px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400"
                            rows={10}
                            value={forumCreateForm.content}
                            onChange={(e) => setForumCreateForm((s) => ({ ...s, content: e.target.value }))}
                            placeholder="输入正文，支持换行"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setForumCreateOpen(false)} className="rounded-2xl">取消</Button>
                        <Button onClick={handleCreatePost} disabled={forumCreating} className="rounded-2xl">
                          {forumCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                          发布
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={forumDetailOpen} onOpenChange={setForumDetailOpen}>
                    <DialogContent className="w-[94vw] max-w-4xl border-slate-200 bg-white text-slate-900">
                      <DialogHeader>
                        <DialogTitle>帖子详情</DialogTitle>
                        <DialogDescription className="text-slate-600">沉浸阅读模式</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {forumLoadingDetail && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            详情加载中...
                          </div>
                        )}

                        {!forumLoadingDetail && !forumSelected && (
                          <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                            请选择一个帖子查看内容。
                          </div>
                        )}

                        {forumSelected && (
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-2xl font-semibold leading-snug text-slate-900">{forumSelected.title}</h3>
                                <p className="text-sm text-slate-600">
                                  {(forumSelected.author || '匿名用户')} · {formatDate(forumSelected.created_at)}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {forumSelected.is_pinned && <Badge className="rounded-xl">置顶</Badge>}
                                {forumSelected.is_featured && <Badge variant="secondary" className="rounded-xl">加精</Badge>}
                              </div>
                            </div>

                            <div className="min-h-[220px] rounded-2xl border border-slate-200 bg-white p-4 text-base leading-relaxed whitespace-pre-wrap text-slate-800">
                              {forumSelected.content || '暂无内容'}
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                              <Badge variant="outline" className="rounded-xl">浏览 {forumSelected.views_count || 0}</Badge>
                              <Badge variant="outline" className="rounded-xl">点赞 {forumSelected.likes_count || 0}</Badge>
                              <Badge variant="outline" className="rounded-xl">评论 {(forumSelected.comments || []).length}</Badge>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={forumSelected?.liked ? 'default' : 'outline'}
                                className="rounded-2xl"
                                onClick={handleToggleLike}
                                disabled={forumLoadingDetail}
                              >
                                <Heart className={cn('mr-2 h-4 w-4', forumSelected?.liked ? 'fill-current text-red-500' : '')} />
                                {forumSelected?.liked ? '已点赞' : '点赞'}
                              </Button>
                              <Button variant="outline" className="rounded-2xl" onClick={() => loadForumDetail(forumSelected.id)} disabled={forumLoadingDetail}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                刷新
                              </Button>
                              {(me?.is_admin || me?.is_root_admin) && (
                                <Button variant="ghost" className="rounded-2xl" onClick={() => (window.location.href = '/admin/dashboard/')}>后台管理</Button>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <textarea
                                  className="min-h-[96px] flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
                                  rows={4}
                                  placeholder="写下你的评论..."
                                  value={forumCommentText}
                                  onChange={(e) => setForumCommentText(e.target.value)}
                                />
                                <Button className="rounded-2xl" onClick={handleSubmitComment} disabled={forumCommenting || forumLoadingDetail}>
                                  {forumCommenting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                  发表评论
                                </Button>
                              </div>
                              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {forumSelected.comments && forumSelected.comments.length > 0 ? (
                                  forumSelected.comments.map((c) => (
                                    <div key={c.id} className="rounded-2xl border border-slate-200 p-3">
                                      <div className="flex items-center justify-between text-sm text-slate-500">
                                        <span>{c.author || '用户'}</span>
                                        <span>{formatDate(c.created_at)}</span>
                                      </div>
                                      <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{c.content}</p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-slate-500">暂无评论</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>

                <TabsContent value="files" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">你的创意文件</h2>
                          <p className="max-w-[600px] text-white/80">集中访问、管理和分享所有设计文件。</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button className="rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30">
                            <Cloud className="mr-2 h-4 w-4" />
                            云存储
                          </Button>
                          <Button className="rounded-2xl bg-white text-blue-700 hover:bg-white/90">
                            <Plus className="mr-2 h-4 w-4" />
                            上传文件
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl">
                      <FileText className="mr-2 h-4 w-4" />
                      全部文件
                    </Button>
                    <Button variant="outline" className="rounded-2xl">
                      <Clock className="mr-2 h-4 w-4" />
                      最近
                    </Button>
                    <Button variant="outline" className="rounded-2xl">
                      <Users className="mr-2 h-4 w-4" />
                      共享
                    </Button>
                    <Button variant="outline" className="rounded-2xl">
                      <Star className="mr-2 h-4 w-4" />
                      收藏
                    </Button>
                    <Button variant="outline" className="rounded-2xl">
                      <Trash className="mr-2 h-4 w-4" />
                      回收站
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="搜索文件..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">全部文件</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-2xl">
                          <PanelLeft className="mr-2 h-4 w-4" />
                          筛选
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-2xl">
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          排序
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-3xl border overflow-hidden">
                      <div className="bg-muted/50 p-3 hidden md:grid md:grid-cols-12 text-sm font-medium">
                        <div className="col-span-6">名称</div>
                        <div className="col-span-2">应用</div>
                        <div className="col-span-2">大小</div>
                        <div className="col-span-2">更新时间</div>
                      </div>
                      <div className="divide-y">
                        {recentFiles.map((file) => (
                          <motion.div
                            key={file.name}
                            whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                            className="p-3 md:grid md:grid-cols-12 items-center flex flex-col md:flex-row gap-3 md:gap-0"
                          >
                            <div className="col-span-6 flex items-center gap-3 w-full md:w-auto">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted">
                                {file.icon}
                              </div>
                              <div>
                                <p className="font-medium">{file.name}</p>
                                {file.shared && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <Users className="mr-1 h-3 w-3" />
                                    与 {file.collaborators} 人共享
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-span-2 text-sm md:text-base">{file.app}</div>
                            <div className="col-span-2 text-sm md:text-base">{file.size}</div>
                            <div className="col-span-2 flex items-center justify-between w-full md:w-auto">
                              <span className="text-sm md:text-base">{file.modified}</span>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="projects" className="space-y-8 mt-0">
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-8 text-white"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-bold">项目管理</h2>
                          <p className="max-w-[600px] text-white/80">把创意工作拆分进项目，与团队协作推进。</p>
                        </div>
                        <Button className="w-fit rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                          <Plus className="mr-2 h-4 w-4" />
                          新建项目
                        </Button>
                      </div>
                    </motion.div>
                  </section>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button variant="outline" className="rounded-2xl">
                      <Layers className="mr-2 h-4 w-4" />
                      全部项目
                    </Button>
                    <Button variant="outline" className="rounded-2xl">
                      <Clock className="mr-2 h-4 w-4" />
                      最近
                    </Button>
                    <Button variant="outline" className="rounded-2xl">
                      <Users className="mr-2 h-4 w-4" />
                      共享
                    </Button>
                    <Button variant="outline" className="rounded-2xl">
                      <Archive className="mr-2 h-4 w-4" />
                      已归档
                    </Button>
                    <div className="flex-1"></div>
                    <div className="relative w-full md:w-auto mt-3 md:mt-0">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="搜索项目..."
                        className="w-full rounded-2xl pl-9 md:w-[200px]"
                      />
                    </div>
                  </div>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">进行中项目</h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {projects.map((project) => (
                        <motion.div key={project.name} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                          <Card className="overflow-hidden rounded-3xl border hover:border-primary/50 transition-all duration-300">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle>{project.name}</CardTitle>
                                <Badge variant="outline" className="rounded-xl">
                                  截止 {project.dueDate}
                                </Badge>
                              </div>
                              <CardDescription>{project.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>进度</span>
                                  <span>{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2 rounded-xl" />
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Users className="mr-1 h-4 w-4" />
                                  {project.members} 位成员
                                </div>
                                <div className="flex items-center">
                                  <FileText className="mr-1 h-4 w-4" />
                                  {project.files} 个文件
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                              <Button variant="secondary" className="flex-1 rounded-2xl">
                                打开项目
                              </Button>
                              <Button variant="outline" size="icon" className="rounded-2xl">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                      <motion.div whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}>
                        <Card className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed p-8 hover:border-primary/50 transition-all duration-300">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Plus className="h-6 w-6" />
                          </div>
                          <h3 className="text-lg font-medium">创建新项目</h3>
                          <p className="mb-4 text-center text-sm text-muted-foreground">
                            从空白或模板开启你的新创意项目
                          </p>
                          <Button className="rounded-2xl">新建项目</Button>
                        </Card>
                      </motion.div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">项目模板</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      <Card className="overflow-hidden rounded-3xl">
                        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                          <h3 className="text-lg font-medium">品牌形象</h3>
                          <p className="text-sm text-white/80">完整的品牌设计包</p>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <Badge variant="outline" className="rounded-xl">
                            热门
                          </Badge>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            使用模板
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card className="overflow-hidden rounded-3xl">
                        <div className="aspect-video bg-gradient-to-br from-amber-500 to-red-600 p-6 text-white">
                          <h3 className="text-lg font-medium">营销活动</h3>
                          <p className="text-sm text-white/80">多渠道营销素材包</p>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <Badge variant="outline" className="rounded-xl">
                            新上线
                          </Badge>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            使用模板
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card className="overflow-hidden rounded-3xl">
                        <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 p-6 text-white">
                          <h3 className="text-lg font-medium">网站重设计</h3>
                          <p className="text-sm text-white/80">完整网站设计流程</p>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <Badge variant="outline" className="rounded-xl">
                            精选
                          </Badge>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            使用模板
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card className="overflow-hidden rounded-3xl">
                        <div className="aspect-video bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white">
                          <h3 className="text-lg font-medium">产品发布</h3>
                          <p className="text-sm text-white/80">产品发布推广素材</p>
                        </div>
                        <CardFooter className="flex justify-between p-4">
                          <Badge variant="outline" className="rounded-xl">
                            热门
                          </Badge>
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            使用模板
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="resources" className="space-y-8 mt-0" id="resources-section">
                  <ResourcesSection />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

// 小组件：侧边栏左下角的用户徽章，包含读取 `/api/users/me/` 与内联编辑功能
function UserBadge({ className }: { className?: string }) {
  const [me, setMe] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nickname: '', bio: '' })
  const fileRef: any = null

  const API_BASE = useMemo(
    () => resolveApiBase(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'),
    [],
  )

  useEffect(() => {
    let mounted = true
    fetch(`${API_BASE}/api/users/me/`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => {
        if (!mounted) return
        setMe(d)
        setForm({ nickname: d.nickname || '', bio: d.bio || '' })
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [API_BASE])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const data = new FormData()
      data.append('nickname', form.nickname)
      data.append('bio', form.bio)
      // file upload optional: keep API compatible
      if (fileRef?.current?.files?.[0]) data.append('avatar', fileRef.current.files[0])

      const res = await fetch(`${API_BASE}/api/users/me/update/`, { method: 'POST', credentials: 'include', body: data })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`${res.status} ${res.statusText} ${text}`)
      }
      const updated = await res.json()
      setMe(updated)
      setEditing(false)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('保存用户资料失败', err)
      // 简易提示
      // eslint-disable-next-line no-alert
      alert('保存失败：' + (err as any).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={className}>
        <div className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarFallback>...</AvatarFallback>
            </Avatar>
            <span>登录状态加载中</span>
          </div>
          <Badge variant="outline" className="ml-auto">专业版</Badge>
        </div>
      </div>
    )
  }

  if (!me) {
    return (
      <div className={className}>
        <Link href="/login" className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
          <div className="flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span>未登录（点击去登录）</span>
          </div>
          <Badge variant="outline" className="ml-auto">专业版</Badge>
        </Link>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted">
        <div className="flex items-center gap-3">
          <Avatar className="h-6 w-6">
            {me.avatar ? <AvatarImage src={me.avatar} alt={me.nickname || me.username} /> : <AvatarFallback>{(me.nickname || me.username || 'U').charAt(0)}</AvatarFallback>}
          </Avatar>
          <span>{me.nickname || me.username || '用户'}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => (window.location.href = '/main')}>主页面</Button>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>编辑</Button>
        </div>
      </div>

      {editing && (
        <div className="mt-2 space-y-2">
          <input className="w-full rounded-md border px-3 py-1" value={form.nickname} onChange={(e) => setForm((s) => ({ ...s, nickname: e.target.value }))} placeholder="昵称" />
          <textarea className="w-full rounded-md border px-3 py-1" rows={2} value={form.bio} onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))} placeholder="个人简介（选填）" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
