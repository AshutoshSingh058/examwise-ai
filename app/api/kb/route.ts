import { NextResponse } from "next/server"
import { getSources, addSource } from "@/lib/kb-db"

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 })
    }

    const sources = await getSources(userId)
    return NextResponse.json(sources)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 })
    }
    const newSource = await addSource(body)
    return NextResponse.json(newSource)
  } catch (error) {
    return NextResponse.json({ error: "Failed to save source" }, { status: 500 })
  }
}
