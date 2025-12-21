import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

type User = { name: string; email: string; password: string }

const filePath = path.join(process.cwd(), "data", "users.json")

async function readUsers(): Promise<User[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8")
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return []
    }
    throw error
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")

  if (!email || !password) {
    return NextResponse.json({ message: "缺少必填字段" }, { status: 400 })
  }

  const users = await readUsers()
  const user = users.find((u) => u.email === email)

  if (!user || user.password !== password) {
    return NextResponse.json({ message: "验证失败，邮箱或密码不正确" }, { status: 401 })
  }

  return NextResponse.json({ message: "登录成功", name: user.name })
}
