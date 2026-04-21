import { NextResponse } from "next/server"
import { getSources, addSource } from "@/lib/kb-db"

export async function GET() {
  try {
    const sources = await getSources()
    return NextResponse.json(sources)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const newSource = await addSource(body)
    return NextResponse.json(newSource)
  } catch (error) {
    return NextResponse.json({ error: "Failed to save source" }, { status: 500 })
  }
}
