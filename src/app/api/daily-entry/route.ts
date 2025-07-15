import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: List semua stok harian (bisa difilter by tanggal)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  let where = {};
  if (date) {
    // Filter by date (YYYY-MM-DD)
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    where = { date: { gte: start, lte: end } };
  }
  const entries = await prisma.dailyEntry.findMany({
    where,
    include: { cake: { include: { producer: true } } },
    orderBy: [{ date: 'desc' }, { id: 'asc' }],
  });
  return NextResponse.json(entries);
}

// POST: Tambah atau update stok harian
export async function POST(req: NextRequest) {
  const data = await req.json();
  // Cek apakah sudah ada entry untuk kue & tanggal ini
  const date = new Date(data.date);
  let entry = await prisma.dailyEntry.findFirst({
    where: { cakeId: data.cakeId, date: { gte: new Date(date.setHours(0,0,0,0)), lte: new Date(date.setHours(23,59,59,999)) } },
  });
  if (entry) {
    // Update stok
    entry = await prisma.dailyEntry.update({
      where: { id: entry.id },
      data: {
        initialStock: data.initialStock ?? entry.initialStock,
        remainingStock: data.remainingStock ?? entry.remainingStock,
      },
    });
    return NextResponse.json(entry);
  } else {
    // Buat entry baru
    entry = await prisma.dailyEntry.create({
      data: {
        date: new Date(data.date),
        cakeId: data.cakeId,
        initialStock: data.initialStock ?? 0,
        remainingStock: data.remainingStock ?? null,
      },
    });
    return NextResponse.json(entry);
  }
}

// DELETE: Hapus entry stok harian
export async function DELETE(req: NextRequest) {
  const data = await req.json();
  await prisma.dailyEntry.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
} 