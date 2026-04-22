"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ChatRedirect() {
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("examwise_user_id")
    if (!userId) {
      router.push("/signup")
      return
    }

    // Logic to either open a new chat or fetch it
    const createNewChat = async () => {
      try {
        const res = await fetch(`/api/chat/${userId}/new`, { method: "POST" })
        const data = await res.json()
        router.push(`/chat/${userId}/${data.id}`)
      } catch (e) {
        // Fallback
        router.push("/")
      }
    }

    createNewChat()
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Initializing study session...</div>
    </div>
  )
}
