import { NextResponse } from "next/server"
import { deleteSource } from "@/lib/kb-db"

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;
    await deleteSource(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete source" }, { status: 500 })
  }
}
