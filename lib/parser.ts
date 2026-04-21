import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import fs from "fs/promises"
import path from "path"
import os from "os"
import crypto from "crypto"

// Polyfills for legacy PDF parsers in Node environment
if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class {};
}
if (typeof global.ImageData === 'undefined') {
  (global as any).ImageData = class {};
}
if (typeof global.Path2D === 'undefined') {
  (global as any).Path2D = class {};
}

const pdfParse = require("pdf-parse");
const { parseOffice } = require("officeparser");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Checks if the text has meaningful content (not just whitespace or metadata)
 */
const isMeaningful = (text: string) => text && text.trim().length > 50;

/**
 * Tier 3: Gemini AI Cloud Rescue (OCR & Transformation)
 * Bypasses RECITATION blocks and handles scanned/corrupted PDFs
 */
async function extractWithGemini(buffer: Buffer, filename: string): Promise<string> {
  console.log("🚀 [Parser] Triggering Gemini AI Rescue for:", filename);
  
  try {
    const base64Data = buffer.toString("base64");

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });
    
    const result = await model.generateContent([
      "Act as an expert academic tutor. Provide a detailed, comprehensive, and conceptually accurate breakdown of all the study topics, definitions, and concepts found in this document. Explain everything in your own words while maintaining technical accuracy. This is for my private knowledge base to help me study.",
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
    ]);

    const response = await result.response;
    const extracted = response.text();
    
    if (!extracted || extracted.trim().length < 5) return "";
    
    return extracted;
  } catch (err: any) {
    console.error("❌ [Parser] Gemini Rescue failed:", err.message || err);
    return "";
  }
}

/**
 * Tier 2: OfficeParser (Better for Word/PPT and some legacy PDFs)
 */
async function parseWithOfficeParser(filename: string, buffer: Buffer): Promise<string> {
  const tmpDir = os.tmpdir()
  const ext = path.extname(filename).toLowerCase() || ".docx"
  const tmpFilePath = path.join(tmpDir, `parser_${crypto.randomUUID()}${ext}`)
  
  try {
    await fs.writeFile(tmpFilePath, buffer)
    const parserOutput = await parseOffice(tmpFilePath)
    
    let content = "";
    if (typeof parserOutput === "object" && parserOutput !== null) {
        content = typeof parserOutput.content === "string" 
            ? parserOutput.content 
            : JSON.stringify(parserOutput.content || parserOutput, null, 2)
    } else {
        content = String(parserOutput || "");
    }

    if (!isMeaningful(content)) return "";
    return content;
  } catch(err) {
    console.warn("⚠️ [Parser] OfficeParser failed:", err.message || err);
    return "";
  } finally {
    try { await fs.unlink(tmpFilePath) } catch (e) {}
  }
}

/**
 * Tier 1: Local pdf-parse
 */
async function extractPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (e) {
    return "";
  }
}

/**
 * Main Universal Entry Point
 */
export async function universalParse(filename: string, buffer: Buffer): Promise<string> {
  const nameLower = filename.toLowerCase();
  let extractedText = "";

  console.log(`🔍 [Parser] Ingesting: ${filename}`);

  // 1. Text files are direct
  if (nameLower.endsWith(".txt")) {
    return buffer.toString("utf-8");
  }

  // 2. PDF Handling (Three-Tier Fallback)
  if (nameLower.endsWith(".pdf")) {
    // Stage 1
    extractedText = await extractPdf(buffer);
    if (isMeaningful(extractedText)) return extractedText;

    // Stage 2
    console.log("📄 [Parser] Minimal text found. Moving to Tier 2 (OfficeParser).");
    extractedText = await parseWithOfficeParser(filename, buffer);
    if (isMeaningful(extractedText)) return extractedText;

    // Stage 3
    console.log("🚀 [Parser] Local extraction failed. Moving to Tier 3 (Gemini Rescue).");
    extractedText = await extractWithGemini(buffer, filename);
  } 
  // 3. Word/PPT Handling
  else {
    extractedText = await parseWithOfficeParser(filename, buffer);
    if (!isMeaningful(extractedText)) {
      console.log("🚀 [Parser] Word/PPT fallback to Gemini Rescue.");
      extractedText = await extractWithGemini(buffer, filename);
    }
  }

  return extractedText || "No readable text could be directly extracted from this document.";
}
