import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Ambil semua produsen (termasuk yang disembunyikan)
  const producers = await prisma.producer.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json({ producers });
}