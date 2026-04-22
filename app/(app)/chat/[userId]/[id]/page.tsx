"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bot, Mic, Send, User, Paperclip, Loader2, CheckCircle2, X, FileText, Target, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MarkdownRenderer } from "@/components/markdown-renderer"

const initialChatMessages = [
  {
    role: "assistant",
    content: "Hello! I am your dedicated AI Study Assistant. What subject are we focusing on today? You can share your syllabus, upcoming exam dates, or simply ask for a customized study plan.",
  }
]

import { useParams } from "next/navigation"
import React from "react" // For React.use()

export default function ChatPage({ params: paramsPromise }: { params: Promise<{ userId: string, id: string }> }) {
  const router = useRouter()
  
  // In Next.js 16, it's cleaner to resolve the promise-params
  const params = React.use(paramsPromise)
  const userId = params.userId
  const chatId = params.id

  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [sessionDocs, setSessionDocs] = useState<{name: string, content: string}[]>([])
  const [stagedFiles, setStagedFiles] = useState<{name: string, content: string}[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasFetched = useRef(false) // Guard for double-fetching

  useEffect(() => {
    const storedUserId = localStorage.getItem("examwise_user_id");
    if (!storedUserId || storedUserId !== userId) {
      router.push("/signup");
      return;
    }

    const saved = localStorage.getItem("examwise_profile")
    if (!saved) {
      router.push("/setup")
    } else if (!profile) {
      setProfile(JSON.parse(saved))
    }

    // Fetch history from backend (guarded)
    if (!hasFetched.current) {
      fetchHistory()
      hasFetched.current = true
    }
  }, [router, userId, chatId, profile])

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/chat/${userId}/${chatId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages)
        } else {
          setMessages(initialChatMessages)
        }
      } else {
        setMessages(initialChatMessages)
      }
    } catch (e) {
      setMessages(initialChatMessages)
    }
  }

  const handleSend = async (message: string) => {
    if ((!message.trim() && stagedFiles.length === 0) || isLoading) return;
    
    const currentSessionDocs = [...sessionDocs, ...stagedFiles];
    
    const userMessage = { 
      role: "user", 
      content: message,
      attachments: stagedFiles.map(f => f.name)
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setStagedFiles([]);
    setIsLoading(true);

    const userMessages = messages.filter(m => m.role === "user");
    const userMessageCount = userMessages.length + 1;

    try {
      // 1. Save user message to backend
      await fetch(`/api/chat/${userId}/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userMessage)
      })

      // 2. Generate AI response
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: message, 
          history: messages,
          profileContext: profile,
          sessionDocs: currentSessionDocs,
          userMessageCount: userMessageCount,
          userId: userId // Pass userId for context isolation
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate");
      }

      const assistantMessage = { role: "assistant", content: data.text };
      
      // 3. Save assistant message to backend
      await fetch(`/api/chat/${userId}/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assistantMessage)
      })

      setSessionDocs(currentSessionDocs);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const totalFiles = files.length;
    setIsUploading(true);
    setUploadProgress({ current: 1, total: totalFiles });
    setUploadSuccess(false);

    let successfulUploads = [];
    let failedUploads = [];

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: totalFiles });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/parse-document", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        
        successfulUploads.push({ name: data.name, content: data.content });
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        failedUploads.push(file.name);
      }
    }

    if (successfulUploads.length > 0) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setStagedFiles(prev => [...prev, ...successfulUploads]);
    }

    if (failedUploads.length > 0) {
      alert(`Some files failed to upload: ${failedUploads.join(", ")}`);
    }

    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col bg-background h-screen w-full relative overflow-hidden">
      {/* Main Scrollable Area - This ensures the scrollbar is at the absolute right edge */}
      <div className="flex-1 overflow-y-auto w-full scroll-smooth custom-scrollbar">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-32 flex flex-col min-h-full">
          
          {/* Header - Only visible when conversation hasn't started */}
          {messages.length <= 1 && (
            <div className="w-full text-center py-12 shrink-0 animate-in fade-in slide-in-from-top-4 duration-1000">
              <h1 className="text-3xl font-bold tracking-tight">AI Study Assistant</h1>
              <p className="mt-2 text-muted-foreground italic">
                Your dedicated space for deep focus and planning
              </p>
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-1 space-y-8 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 group ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                    <Bot className="h-5 w-5 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-6 py-4 text-sm shadow-sm transition-all ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-secondary-foreground backdrop-blur-sm border border-border/30"
                  }`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {message.attachments.map((name: string) => (
                        <div key={name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-[11px] font-medium">
                          <Paperclip className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="leading-relaxed">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Bot className="h-5 w-5 text-accent animate-pulse" />
                </div>
                <div className="max-w-[85%] rounded-2xl bg-secondary/50 px-6 py-4 text-sm text-secondary-foreground shadow-sm flex items-center gap-2 border border-border/30">
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}

            {/* Blind Spot Widget - Appears after EXACTLY 5 user messages */}
            {messages.filter(m => m.role === "user").length >= 5 && (
              <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/20 backdrop-blur-md p-6 shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Target className="h-24 w-24 text-primary" />
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-inner">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">Blind Spot Identified</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        You have covered <span className="font-bold text-foreground">3/5</span> trending DBMS topics in this session.
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[11px] font-semibold text-yellow-600 dark:text-yellow-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          MISSED: Unit 4 (Transactions)
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[11px] font-semibold text-yellow-600 dark:text-yellow-400">
                          <AlertCircle className="h-3.5 w-3.5" />
                          MISSED: ACID Properties (Critical)
                        </div>
                      </div>

                      <button className="mt-6 text-sm font-bold text-primary hover:underline flex items-center gap-1 group">
                        Let&apos;s cover these now
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Glass Input Area Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-20 pb-6 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Staged Files Pills */}
          {stagedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 px-2 animate-in fade-in slide-in-from-bottom-2">
              {stagedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/80 backdrop-blur-md border border-border/50 text-xs shadow-sm group">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="max-w-[120px] truncate font-medium">{file.name}</span>
                  <button 
                    onClick={() => setStagedFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-secondary/40 backdrop-blur-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-lg">
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileAttachment}
              accept=".pdf,.docx,.doc,.txt,.pptx,.ppt"
              multiple
            />

            {/* Leftmost Attachment Button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              className="text-muted-foreground transition-all hover:text-primary p-2.5 rounded-xl hover:bg-primary/10 disabled:opacity-50"
              title="Attach study material"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : uploadSuccess ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Paperclip className="h-5 w-5" />
              )}
            </button>

            <textarea
              placeholder={isUploading ? `Processing ${uploadProgress.current} of ${uploadProgress.total} documents...` : "Type your message here..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              disabled={isLoading || isUploading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground py-2 resize-none max-h-32 min-h-[2.5rem] disabled:opacity-50"
              rows={1}
            />

            <div className="flex items-center gap-1 shrink-0">
              <button className="text-muted-foreground transition-colors hover:text-foreground p-2.5 rounded-xl hover:bg-secondary">
                <Mic className="h-5 w-5" />
              </button>
              
              <Button 
                size="icon" 
                className="rounded-xl h-11 w-11 shadow-md bg-primary hover:bg-primary/90 transition-all active:scale-95"
                onClick={() => handleSend(inputValue)}
                disabled={isLoading || isUploading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="mt-3 flex justify-center text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Study Assistant • Session Context Active
          </div>
        </div>
      </div>
    </div>
  )
}
