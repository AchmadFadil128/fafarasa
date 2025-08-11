import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const emails = await prisma.allowedEmail.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ emails })
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }
  const created = await prisma.allowedEmail.create({ data: { email } })
  return NextResponse.json(created)
}

export async function DELETE(req: NextRequest) {
  const { id, email } = await req.json()
  try {
    if (id) {
      await prisma.allowedEmail.delete({ where: { id: Number(id) } })
    } else if (email) {
      await prisma.allowedEmail.delete({ where: { email: String(email) } })
    } else {
      return NextResponse.json({ error: "id or email is required" }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
} 