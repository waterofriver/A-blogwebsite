"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProfileCard({ backendUrl }: { backendUrl?: string }) {
  const router = useRouter()
  const [profile, setProfile] = useState<any | null>(null)
  const API_BASE = backendUrl || (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000')

  useEffect(() => {
    let mounted = true
    fetch(`${API_BASE}/api/users/me/`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (!mounted) return
        setProfile(data)
      })
      .catch(() => {
        // fallback: try list and pick first public user
        fetch(`${API_BASE}/api/users/`)
          .then((r) => (r.ok ? r.json() : Promise.reject(r)))
          .then((d) => {
            if (!mounted) return
            setProfile(d?.results?.[0] ?? null)
          })
          .catch(() => {
            if (!mounted) return
            setProfile(null)
          })
      })

    return () => {
      mounted = false
    }
  }, [API_BASE])

  const [editing, setEditing] = useState(false)
  const [formState, setFormState] = useState({ nickname: '', bio: '' })
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (profile) {
      setFormState({ nickname: profile.nickname || '', bio: profile.bio || '' })
    }
  }, [profile])

  if (profile === null) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent>加载中…</CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="flex flex-col items-center gap-3">
        <Avatar className="h-28 w-28">
          {profile.avatar ? (
            <AvatarImage src={profile.avatar} alt={profile.nickname || profile.username} />
          ) : (
            <AvatarFallback>{(profile.nickname || profile.username || "U").charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="text-center">
          <CardTitle className="text-xl">{profile.nickname || profile.username}</CardTitle>
          <div className="text-sm text-muted-foreground">{profile.email}</div>
        </div>
      </CardHeader>

      <CardContent>
        {!editing ? (
          <div className="prose max-w-none">
            <p>{profile.bio || "这位用户还没有填写个人简介。"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground">昵称</label>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={formState.nickname}
                onChange={(e) => setFormState((s) => ({ ...s, nickname: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground">个人简介</label>
              <textarea
                className="w-full rounded-md border px-3 py-2"
                rows={4}
                value={formState.bio}
                onChange={(e) => setFormState((s) => ({ ...s, bio: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground">头像</label>
              <input ref={fileRef} type="file" accept="image/*" />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Badge>账号 ID: {profile.id}</Badge>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                编辑资料
              </Button>
              <Button>私信</Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false)
                  // reset form
                  setFormState({ nickname: profile.nickname || '', bio: profile.bio || '' })
                }}
              >
                取消
              </Button>
              <Button
                onClick={async () => {
                  setSubmitting(true)
                  try {
                    const form = new FormData()
                    form.append('nickname', formState.nickname)
                    form.append('bio', formState.bio)
                    if (fileRef.current && fileRef.current.files && fileRef.current.files[0]) {
                      form.append('avatar', fileRef.current.files[0])
                    }
                    const prevNickname = profile?.nickname
                    const res = await fetch(`${API_BASE}/api/users/me/update/`, {
                      method: 'POST',
                      credentials: 'include',
                      body: form,
                    })
                    if (!res.ok) {
                      const body = await res.text().catch(() => '')
                      throw new Error(`${res.status} ${res.statusText} ${body}`)
                    }
                    const updated = await res.json()
                    setProfile(updated)
                    setEditing(false)
                    // if nickname was just set, redirect to main page
                    if (!prevNickname && updated && updated.nickname) {
                      router.push('/main')
                    }
                  } catch (err) {
                    // show basic alert for now
                    // eslint-disable-next-line no-alert
                    alert('更新失败：' + (err as any).message)
                  } finally {
                    setSubmitting(false)
                  }
                }}
                disabled={submitting}
              >
                保存
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
