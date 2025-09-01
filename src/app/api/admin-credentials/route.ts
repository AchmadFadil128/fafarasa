import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const admin = await prisma.adminUser.findFirst()
  if (!admin) {
    return NextResponse.json({ error: "No admin user found" }, { status: 404 })
  }
  return NextResponse.json({ username: admin.username })
}

export async function PUT(req: NextRequest) {
  const { currentPassword, newUsername, newPassword } = await req.json()
  
  if (!currentPassword) {
    return NextResponse.json({ error: "Current password is required" }, { status: 400 })
  }

  const admin = await prisma.adminUser.findFirst()
  if (!admin) {
    return NextResponse.json({ error: "No admin user found" }, { status: 404 })
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, admin.password)
  if (!isValidPassword) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
  }

  // Update credentials
  const updateData: any = {}
  if (newUsername) updateData.username = newUsername
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 12)

  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: updateData
  })

  return NextResponse.json({ 
    success: true, 
    username: updated.username 
  })
}
