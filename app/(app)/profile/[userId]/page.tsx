"use client"

import React from "react"
import { ProfileForm } from "@/components/profile-form"

export default function ProfilePage({ params: paramsPromise }: { params: Promise<{ userId: string }> }) {
  const params = React.use(paramsPromise)
  
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your academic details and subject focus.</p>
      </div>
      
      <div className="mt-8">
        <ProfileForm mode="profile" />
      </div>
    </div>
  )
}
