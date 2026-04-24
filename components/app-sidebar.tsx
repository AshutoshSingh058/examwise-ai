"use client"

import { useState, useEffect } from "react"
import { MessageSquarePlus, Search, History, BookOpen, TrendingUp, Settings, UserCircle, Loader2, Zap } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useRef } from "react"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [chats, setChats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    const id = localStorage.getItem("examwise_user_id")
    setUserId(id)
    if (id && !hasFetched.current) {
      fetchChats(id)
      hasFetched.current = true
    }
  }, [])

  const fetchChats = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/${id}/list`)
      const data = await res.json()
      setChats(data)
    } catch (e) {
      console.error("Failed to fetch chats")
    }
  }

  const handleNewChat = async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/chat/${userId}/new`, { method: "POST" })
      const data = await res.json()
      router.push(`/chat/${userId}/${data.id}`)
      fetchChats(userId)
    } catch (e) {
      console.error("Failed to create new chat")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrepClick = async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/chat/${userId}/prep`, { method: "POST" })
      const data = await res.json()
      if (data.chatId) {
        router.push(`/chat/${userId}/${data.chatId}`)
        fetchChats(userId)
      } else {
        alert("Could not generate prep guide. Please try again.")
      }
    } catch (e) {
      console.error("Failed to generate prep guide")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sidebar collapsible="none" className="border-r border-border/50">
      <SidebarContent>
        {/* TOP */}
        <SidebarGroup className="pt-4">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Search className="h-4 w-4" />
                  <span>Search Chats</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleNewChat} 
                  disabled={isLoading}
                  className="w-full justify-start gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
                  <span>New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handlePrepClick}
                  disabled={isLoading}
                  className="w-full justify-start gap-2 text-green-600/80 hover:text-green-600 transition-all border border-green-500/10 hover:border-green-500/20 group/prep"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 transition-transform group-hover/prep:scale-110 fill-green-600/20" />
                  )}
                  <span className="text-xs font-semibold">Last Minute Prep</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* RECENT CHATS */}
        {userId && (
          <SidebarGroup>
            <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chats.length === 0 ? (
                  <div className="px-4 py-2 text-xs text-muted-foreground italic">No chats yet</div>
                ) : (
                  chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === `/chat/${userId}/${chat.id}`}
                      >
                        <Link href={`/chat/${userId}/${chat.id}`}>
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{chat.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground font-bold text-[11px] tracking-wider uppercase opacity-80">Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname?.startsWith("/knowledge-base")} className="hover:text-green-600 transition-colors group/lib">
                  <Link href={userId ? `/knowledge-base/${userId}` : "/signup"}>
                    <BookOpen className="h-4 w-4 opacity-70 group-hover/lib:text-green-600" />
                    <span>Knowledge Base</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/hot-topics"} className="hover:text-green-600 transition-colors group/lib">
                  <Link href="/hot-topics">
                    <TrendingUp className="h-4 w-4 opacity-70 group-hover/lib:text-green-600" />
                    <span>Hot Topics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* BOTTOM */}
      <SidebarFooter>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#">
                <UserCircle className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
