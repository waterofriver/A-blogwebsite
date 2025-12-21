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

async function writeUsers(users: User[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(users, null, 2), "utf8")
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const name = String(body.name || "").trim()
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")

  if (!name || !email || !password) {
    return NextResponse.json({ message: "缺少必填字段" }, { status: 400 })
  }

  const users = await readUsers()
  if (users.some((u) => u.email === email)) {
    return NextResponse.json({ message: "邮箱已注册" }, { status: 409 })
  }

  const newUser: User = { name, email, password }
  users.push(newUser)
  await writeUsers(users)

  return NextResponse.json({ message: "注册成功" })
}
