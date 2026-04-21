"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Bot, Mic, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MarkdownRenderer } from "@/components/markdown-renderer"

const initialChatMessages = [
  {
    role: "assistant",
    content: "Hello! I am your dedicated AI Study Assistant. What subject are we focusing on today? You can share your syllabus, upcoming exam dates, or simply ask for a customized study plan.",
  }
]

export default function ChatPage() {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState(initialChatMessages)
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    const userMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col items-center p-4 pt-24 md:p-8 md:pt-28 max-w-5xl mx-auto w-full">
        <div className="mb-8 w-full text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Study Assistant</h1>
          <p className="mt-2 text-muted-foreground">
            Your dedicated space for deep focus and planning
          </p>
        </div>

        <Card className="flex flex-1 w-full flex-col overflow-hidden border-border/50 bg-card/50 shadow-sm max-h-[70vh]">
          {/* Chat Messages */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6 scroll-smooth">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Bot className="h-4 w-4 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                  <Bot className="h-4 w-4 text-accent animate-pulse" />
                </div>
                <div className="max-w-[85%] rounded-2xl bg-secondary px-5 py-3 text-sm text-secondary-foreground shadow-sm flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 p-4 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-4 py-2 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend(inputValue);
                }}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground py-2 disabled:opacity-50"
              />
              <button className="text-muted-foreground transition-colors hover:text-foreground p-2 rounded-full hover:bg-secondary">
                <Mic className="h-5 w-5" />
              </button>
              <Button 
                size="icon" 
                className="rounded-lg h-9 w-9 shrink-0"
                onClick={() => handleSend(inputValue)}
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex justify-center text-xs text-muted-foreground">
              AI can make mistakes. Consider verifying important study information.
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
