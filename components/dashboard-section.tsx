"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Mic, Bot, User, CheckCircle2, Clock, HelpCircle, Gauge, ArrowRight } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import Link from "next/link"

const examplePrompts = [
  "DBMS exam tomorrow",
  "Need 40 marks in OS",
  "3 hours left",
]

const priorityTopics = [
  { name: "Unit 2: Normalization & SQL", priority: "high" },
  { name: "Unit 4: Transaction Management", priority: "high" },
  { name: "Unit 5: Concurrency Control", priority: "medium" },
]

const studyPlan = [
  { hour: "Hour 1", task: "Review Normalization Forms (1NF, 2NF, 3NF)" },
  { hour: "Hour 2", task: "Practice SQL Queries & Joins" },
  { hour: "Hour 3", task: "Transaction ACID Properties" },
  { hour: "Hour 4", task: "Concurrency Control Protocols" },
  { hour: "Hour 5", task: "Previous Year Questions" },
  { hour: "Hour 6", task: "Quick Revision & Rest" },
]

const likelyQuestions = [
  "Explain different normal forms with examples",
  "Write SQL query for nested subqueries",
  "Describe ACID properties in transactions",
  "Compare deadlock prevention vs detection",
  "Explain two-phase locking protocol",
]

const initialChatMessages = [
  {
    role: "user",
    content: "DBMS exam tomorrow, I have 6 hours to prepare",
  },
  {
    role: "assistant",
    content: "I'll create an optimized 6-hour study plan for your DBMS exam. Based on past papers, here are your priority topics and a structured schedule to maximize your score.",
  },
]

export function DashboardSection() {
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
    <section id="dashboard" className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Your AI Study Dashboard
          </h2>
          <p className="mt-3 text-muted-foreground">
            Chat with AI and get instant study plans tailored to your exam
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* AI Chat Panel */}
          <Card className="flex flex-col border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-accent" />
                AI Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col p-0">
              {/* Chat Messages */}
              <div className="flex-1 space-y-4 p-4 overflow-y-auto max-h-[400px]">
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
                      className={`max-w-[80%] overflow-hidden rounded-2xl px-4 py-2.5 text-sm ${
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
              </div>

              {/* Example Prompts */}
              <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-3">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="rounded-full bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t border-border/50 p-4">
                <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-4 py-2">
                  <input
                    type="text"
                    placeholder="Tell me about your exam..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend(inputValue);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                  />
                  <button className="text-muted-foreground transition-colors hover:text-foreground">
                    <Mic className="h-5 w-5" />
                  </button>
                  <Button 
                    size="icon-sm" 
                    className="rounded-lg"
                    onClick={() => handleSend(inputValue)}
                    disabled={isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Cards Stack */}
          <div className="space-y-4">
            {/* Priority Topics */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Priority Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {priorityTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
                  >
                    <span className="text-sm">{topic.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        topic.priority === "high"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {topic.priority}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Study Plan */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-blue-500" />
                  6 Hour Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studyPlan.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg bg-secondary/30 px-3 py-2"
                    >
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {item.hour}
                      </span>
                      <span className="text-sm">{item.task}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Likely Questions */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HelpCircle className="h-5 w-5 text-orange-500" />
                  Likely Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {likelyQuestions.map((question, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{question}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Confidence Meter */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="h-5 w-5 text-accent" />
                  Confidence Meter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-muted-foreground">Expected Score</span>
                      <span className="font-medium text-green-500">72%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                        style={{ width: "72%" }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-500">High</span>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
