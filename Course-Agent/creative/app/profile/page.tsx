"use client"

import React from "react"
import ProfileCard from "@/components/profile-card"

export default function ProfilePage() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">个人资料</h1>
        <ProfileCard />
      </div>
    </main>
  )
}
