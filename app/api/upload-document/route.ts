import { NextResponse } from "next/server"
import { addSource } from "@/lib/kb-db"
import fs from "fs/promises"
import path from "path"
import os from "os"

// Fix for legacy PDF parsers (like pdf-parse) that expect browser globals in Node
if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class {};
}
if (typeof global.ImageData === 'undefined') {
  (global as any).ImageData = class {};
}
if (typeof global.Path2D === 'undefined') {
  (global as any).Path2D = class {};
}

const { parseOffice } = require("officeparser")
const pdfParse = require("pdf-parse")

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text || ""
  } catch (err) {
    console.error("pdf-parse specific failure", err)
    throw err
  }
}

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
    
    // Quick handle for pure `.txt` files directly 
    let extractedText = ""
    if (file.name.toLowerCase().endsWith(".txt")) {
        extractedText = buffer.toString("utf-8")
    } else if (file.name.toLowerCase().endsWith(".pdf")) {
        // Use pdf-parse for PDFs - fixed version is more stable in Node environments
        try {
          extractedText = await extractPdfText(buffer)
        } catch (pdfErr) {
          console.error("pdf-parse failed, falling back to officeparser", pdfErr)
          extractedText = await parseWithOfficeParser(file.name, buffer)
        }
    } else {
        extractedText = await parseWithOfficeParser(file.name, buffer)
    }

    // Save to DB
    const newSource = await addSource({
      title: title || file.name,
      type: "document",
      subject: subject || "General",
      status: "processed",
      content: extractedText || "No readable text could be directly extracted from this document."
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

async function parseWithOfficeParser(filename: string, buffer: Buffer): Promise<string> {
  const tmpDir = os.tmpdir()
  const ext = path.extname(filename).toLowerCase() || ".docx"
  const tmpFilePath = path.join(tmpDir, `examwise_${crypto.randomUUID()}${ext}`)
  
  try {
    await fs.writeFile(tmpFilePath, buffer)
    // officeparser handles word and ppt much better
    const parserOutput = await parseOffice(tmpFilePath)
    
    if (typeof parserOutput === "object" && parserOutput !== null) {
        return typeof parserOutput.content === "string" 
            ? parserOutput.content 
            : JSON.stringify(parserOutput.content || parserOutput, null, 2)
    } 
    return String(parserOutput || "")
  } catch(parseErr: any) {
    console.warn("OfficeParser extraction failed.", parseErr)
    return ""
  } finally {
    try { await fs.unlink(tmpFilePath) } catch (e) {}
  }
}
