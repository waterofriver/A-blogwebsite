"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import api from "@/lib/api"

type Message = { text: string; tone: "success" | "error" | "info" }

type MeResponse = {
  id: number
  username: string
  nickname?: string | null
  email?: string | null
}

type ApiResult = { success?: boolean; detail?: string; message?: string }
type LoginResponse = ApiResult & { token?: string }

const generateNickname = (user: Pick<MeResponse, "username" | "id">) => {
  const safe = (user.username || "creative").replace(/[^a-zA-Z0-9]/g, "") || "CreativeUser"
  const suffix = String(user.id || Math.floor(Math.random() * 1_000_000)).padStart(4, "0").slice(-6)
  return `${safe}_${suffix}`
}

export function AuthCard() {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [needsNickname, setNeedsNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState("")
  const [currentUser, setCurrentUser] = useState<MeResponse | null>(null)
  const [signupConfirm, setSignupConfirm] = useState("")

  const fetchMe = async () => {
    try {
      const res = await api.get<MeResponse>("/api/users/me/")
      return res.data
    } catch {
      return null
    }
  }

  const ensureNickname = async () => {
    const me = await fetchMe()
    if (!me) return false
    setCurrentUser(me)
    if (me.nickname && me.nickname.trim()) return true
    setNicknameInput(generateNickname(me))
    setNeedsNickname(true)
    return false
  }

  const handleSetNickname = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!nicknameInput.trim()) {
      setMessage({ text: "昵称不能为空", tone: "error" })
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await api.post<ApiResult>("/update_nickname/", { nickname: nicknameInput.trim() })
      const data = res.data
      if (res.status >= 200 && res.status < 300 && data.success !== false) {
        setNeedsNickname(false)
        router.push("/main")
      } else {
        setMessage({ text: data.detail || data.message || "昵称设置失败，请重试", tone: "error" })
      }
    } catch (error) {
      setMessage({ text: "网络异常，请稍后再试", tone: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = String(formData.get("login-username") || "")
    const password = String(formData.get("login-password") || "")

    setLoading(true)
    setMessage(null)

    try {
      const res = await api.post<LoginResponse>("/api/auth/login/", { username, password })
      const data = res.data
      if (res.status >= 200 && res.status < 300 && data.success !== false) {
        const hasNickname = await ensureNickname()
        if (hasNickname) {
          setMessage({ text: "登录成功，正在跳转主页面...", tone: "success" })
          router.push("/main")
        } else {
          setMessage(null)
          setNeedsNickname(true)
        }
      } else {
        setMessage({ text: data.detail || data.message || "验证失败，请检查账号或密码", tone: "error" })
      }
    } catch (error) {
      setMessage({ text: "网络异常，请稍后再试", tone: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = String(formData.get("signup-username") || "")
    const email = String(formData.get("signup-email") || "")
    const password = String(formData.get("signup-password") || "")
    const confirm = String(formData.get("signup-confirm") || "")
    const securityQuestion = String(formData.get("signup-security-question") || "")
    const securityAnswer = String(formData.get("signup-security-answer") || "")

    if (password !== confirm) {
      setMessage({ text: "两次输入的密码不一致", tone: "error" })
      return
    }

    if (!securityQuestion.trim() || !securityAnswer.trim()) {
      setMessage({ text: "安全问题和答案不能为空", tone: "error" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await api.post<ApiResult>("/api/auth/register/", {
        username,
        email,
        password,
        security_question: securityQuestion,
        security_answer: securityAnswer,
      })

      const data = res.data
      if (res.status >= 200 && res.status < 300 && data.success !== false) {
        setNeedsNickname(false)
        setMessage({ text: "注册成功，请使用新账号登录", tone: "success" })
        setTab("login")
      } else {
        setMessage({ text: data.detail || data.message || "注册失败，请稍后再试", tone: "error" })
      }
    } catch (error) {
      setMessage({ text: "网络异常，请稍后再试", tone: "error" })
    } finally {
      setLoading(false)
    }
  }

  const renderMessage = () => {
    if (!message) return null
    const toneClass =
      message.tone === "success" ? "text-green-600" : message.tone === "error" ? "text-red-600" : "text-muted-foreground"
    return (
      <p className={`text-sm ${toneClass}`} role="status">
        {message.text}
      </p>
    )
  }

  const renderAuthTabs = () => (
    <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "signup")} className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">登录</TabsTrigger>
        <TabsTrigger value="signup">注册</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>输入账号与密码登录账户</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={handleLogin}>
              <div className="grid gap-2">
                <Label htmlFor="login-username">用户名</Label>
                <Input
                  id="login-username"
                  name="login-username"
                  type="text"
                  placeholder="yourname"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="login-password">密码</Label>
                  <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    忘记密码？
                  </a>
                </div>
                <Input id="login-password" name="login-password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "登录中..." : "登录"}
              </Button>
              {renderMessage()}
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            还没有账号？切换到“注册”即可创建新账户
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">创建新账户</CardTitle>
            <CardDescription>填写信息完成注册并开始使用</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={handleSignup}>
              <div className="grid gap-2">
                <Label htmlFor="signup-username">用户名</Label>
                <Input id="signup-username" name="signup-username" type="text" placeholder="yourname" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-email">邮箱</Label>
                <Input id="signup-email" name="signup-email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-password">密码</Label>
                <Input id="signup-password" name="signup-password" type="password" minLength={6} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-confirm">确认密码</Label>
                <Input
                  id="signup-confirm"
                  name="signup-confirm"
                  type="password"
                  minLength={6}
                  required
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-security-question">安全问题</Label>
                <Input
                  id="signup-security-question"
                  name="signup-security-question"
                  type="text"
                  placeholder="例如：你最喜欢的颜色是什么？"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="signup-security-answer">安全问题答案</Label>
                <Input
                  id="signup-security-answer"
                  name="signup-security-answer"
                  type="text"
                  placeholder="例如：蓝色"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "注册中..." : "注册"}
              </Button>
              {renderMessage()}
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            已有账号？切换到“登录”直接进入
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )

  const renderNicknameCard = () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">设置你的昵称</CardTitle>
        <CardDescription>完成最后一步即可进入主页面</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSetNickname}>
          <div className="grid gap-2">
            <Label htmlFor="nickname">昵称</Label>
            <Input
              id="nickname"
              name="nickname"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="输入昵称"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "保存中..." : "保存并进入"}
          </Button>
          {renderMessage()}
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        {currentUser?.username ? `当前账号：${currentUser.username}` : ""}
      </CardFooter>
    </Card>
  )

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {needsNickname ? renderNicknameCard() : renderAuthTabs()}
    </div>
  )
}
