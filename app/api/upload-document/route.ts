import { NextResponse } from "next/server"
import { addSource } from "@/lib/kb-db"
import { universalParse } from "@/lib/parser"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string
    const subject = formData.get("subject") as string

    if (!file) {
      return NextResponse.json({ error: "No document provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Use the Shared Universal Parser
    const extractedText = await universalParse(file.name, buffer)

    // Save to DB
    const newSource = await addSource({
      title: title || file.name,
      type: "document",
      subject: subject || "General",
      status: "processed",
      content: extractedText
    })

    return NextResponse.json(newSource)
  } catch (error: any) {
    console.error("Document API Error:", error)
    return NextResponse.json({ 
      error: "Failed to process document", 
      message: error?.message || String(error)
    }, { status: 500 })
  }
}
