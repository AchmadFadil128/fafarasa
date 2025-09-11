import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Lightweight DB check (does not create a connection pool explosion)
    await prisma.$queryRawUnsafe('SELECT 1');
    return NextResponse.json({ status: 'ok', db: 'ok' });
  } catch (error) {
    return NextResponse.json({ status: 'degraded', db: 'error' }, { status: 500 });
  }
}


