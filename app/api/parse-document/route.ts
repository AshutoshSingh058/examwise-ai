import { NextResponse } from "next/server"
import { universalParse } from "@/lib/parser"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No document provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Use the Shared Universal Parser to get raw text
    const extractedText = await universalParse(file.name, buffer)

    return NextResponse.json({ 
        name: file.name,
        content: extractedText 
    })
  } catch (error: any) {
    console.error("Parse-Only API Error:", error)
    return NextResponse.json({ 
      error: "Failed to parse document", 
      message: error?.message || String(error)
    }, { status: 500 })
  }
}
