"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Message = { text: string; tone: "success" | "error" | "info" }

export function AuthCard() {
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("login-email") || "")
    const password = String(formData.get("login-password") || "")

    setLoading(true)
    setMessage(null)

    try {
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      })

      if (res.ok) {
        setMessage({ text: "登录成功，正在跳转主页面...", tone: "success" })
        router.push("/main")
      } else {
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        setMessage({ text: data.message || "验证失败，请检查邮箱或密码", tone: "error" })
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
    const name = String(formData.get("signup-name") || "")
    const email = String(formData.get("signup-email") || "")
    const password = String(formData.get("signup-password") || "")

    setLoading(true)
    setMessage(null)

    try {
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, email, password, nickname: name }),
      })

      if (res.ok) {
        setMessage({ text: "注册成功，正在跳转主页面...", tone: "success" })
        // always go to main; homepage modal will force nickname if missing
        router.push('/main')
      } else {
        const data = (await res.json().catch(() => ({}))) as { message?: string }
        setMessage({ text: data.message || "注册失败，请稍后再试", tone: "error" })
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

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "signup")} className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">登录</TabsTrigger>
          <TabsTrigger value="signup">注册</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">欢迎回来</CardTitle>
              <CardDescription>输入邮箱与密码登录账户</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-6" onSubmit={handleLogin}>
                <div className="grid gap-2">
                  <Label htmlFor="login-email">邮箱</Label>
                  <Input id="login-email" name="login-email" type="email" placeholder="you@example.com" required />
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
                <Button type="button" variant="outline" className="w-full">
                  使用 Google 登录
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
                  <Label htmlFor="signup-name">姓名 / 昵称</Label>
                  <Input id="signup-name" name="signup-name" type="text" placeholder="你的名字" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">邮箱</Label>
                  <Input id="signup-email" name="signup-email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-password">密码</Label>
                  <Input id="signup-password" name="signup-password" type="password" minLength={6} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "注册中..." : "注册"}
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  使用 Google 注册
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
    </div>
  )
}
