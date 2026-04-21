"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { FileText, Youtube, Type, Trash2, Eye, RefreshCw, Upload } from "lucide-react"

interface Source {
  id: string
  title: string
  type: string
  subject: string
  addedAt: string
  status: string
  content?: string
}

export default function KnowledgeBasePage() {
  const [sources, setSources] = useState<Source[]>([])
  const [isTextOpen, setIsTextOpen] = useState(false)
  const [isPdfOpen, setIsPdfOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // View modal state
  const [viewSource, setViewSource] = useState<Source | null>(null)

  // Forms
  const [textForm, setTextForm] = useState({ title: "", subject: "", content: "" })
  const [pdfForm, setPdfForm] = useState({ title: "", subject: "", file: null as File | null })

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    try {
      const res = await fetch("/api/kb")
      const data = await res.json()
      setSources(data)
    } catch (e) { }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/kb/${id}`, { method: "DELETE" })
      fetchSources()
    } catch (e) { }
  }

  const handleAddText = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/kb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: textForm.title,
          subject: textForm.subject,
          content: textForm.content,
          type: "text",
          status: "processed"
        })
      })
      setIsTextOpen(false)
      setTextForm({ title: "", subject: "", content: "" })
      fetchSources()
    } catch (error) { }
    setLoading(false)
  }

  const handleAddPdf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfForm.file) return
    setLoading(true)

    // Optimistic UI insert for 'Pending'
    const tempId = crypto.randomUUID()
    setSources(prev => [...prev, {
      id: tempId, title: pdfForm.title || pdfForm.file!.name, type: "document", subject: pdfForm.subject, addedAt: new Date().toISOString(), status: "pending"
    }])

    try {
      const formData = new FormData()
      formData.append("file", pdfForm.file)
      formData.append("title", pdfForm.title)
      formData.append("subject", pdfForm.subject)

      const res = await fetch("/api/upload-document", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || errorData.error || "Server error")
      }

      setIsPdfOpen(false)
      setPdfForm({ title: "", subject: "", file: null })
      fetchSources()
    } catch (error: any) {
      alert("Failed to process document: " + error.message)
      fetchSources() // refresh to remove pending state if failed
    }
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="mt-2 text-muted-foreground">Upload and manage the specific context your AI tutor learns from.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dialog open={isPdfOpen} onOpenChange={setIsPdfOpen}>
          <DialogTrigger asChild>
            <Card className="border-border/50 bg-card/50 shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Add Study Material</CardTitle>
                <CardDescription>Upload Course Presentations, Word Docs, Text files, or PDFs.</CardDescription>
              </CardHeader>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Study Material</DialogTitle>
              <DialogDescription>The text will seamlessly extract from .pdf, .docx, .txt, or .pptx files.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPdf} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={pdfForm.title} onChange={e => setPdfForm({ ...pdfForm, title: e.target.value })} placeholder="e.g. Chapter 3 Notes" />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input required value={pdfForm.subject} onChange={e => setPdfForm({ ...pdfForm, subject: e.target.value })} placeholder="e.g. Database Systems" />
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <Input required type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={e => setPdfForm({ ...pdfForm, file: e.target.files?.[0] || null })} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Extracting..." : "Upload & Parse"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isTextOpen} onOpenChange={setIsTextOpen}>
          <DialogTrigger asChild>
            <Card className="border-border/50 bg-card/50 shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader>
                <Type className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Add Text Notes</CardTitle>
                <CardDescription>Paste raw text, highlights, or write custom study instructions.</CardDescription>
              </CardHeader>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Text Note</DialogTitle>
              <DialogDescription>Directly paste the content you want the AI to memorize.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddText} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input required value={textForm.title} onChange={e => setTextForm({ ...textForm, title: e.target.value })} placeholder="e.g. Acid Properties" />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input required value={textForm.subject} onChange={e => setTextForm({ ...textForm, subject: e.target.value })} placeholder="e.g. DBMS" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea required className="min-h-[200px]" value={textForm.content} onChange={e => setTextForm({ ...textForm, content: e.target.value })} placeholder="..." />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>Save Note</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Card className="border-border/50 bg-card/50 shadow-sm opacity-50 cursor-not-allowed">
          <CardHeader>
            <Youtube className="h-8 w-8 text-muted-foreground mb-2" />
            <CardTitle className="text-muted-foreground">Add YouTube URL</CardTitle>
            <CardDescription>Coming in Phase 2</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-12 space-y-4">
        <h2 className="text-2xl font-bold">Stored Sources List</h2>

        {sources && sources.length === 0 ? (
          <Card className="border-border/50 bg-background/50">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <Type className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p>No knowledge base sources added yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30">
            <div className="grid grid-cols-12 gap-4 p-4 font-medium text-sm text-muted-foreground border-b border-border/50 bg-secondary/20">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Subject</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {sources && sources.map(source => (
              <div key={source.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors text-sm">
                <div className="col-span-4 font-medium truncate">{source.title}</div>
                <div className="col-span-2 uppercase text-xs tracking-wider font-semibold">{source.type}</div>
                <div className="col-span-2 truncate text-muted-foreground">{source.subject}</div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${source.status === 'processed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500 animate-pulse'}`}>
                    {source.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setViewSource(source)} disabled={source.status !== 'processed'}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(source.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!viewSource} onOpenChange={(open) => !open && setViewSource(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewSource?.title}</DialogTitle>
            <DialogDescription>Type: {viewSource?.type} • Subject: {viewSource?.subject}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto p-4 bg-muted/10 border border-border/50 rounded-lg whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {viewSource?.content}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
