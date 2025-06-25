import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Ambil semua kue beserta produsen
  const cakes = await prisma.cake.findMany({
    include: { producer: true },
    orderBy: { id: 'asc' },
  });
  const producers = await prisma.producer.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json({ cakes, producers });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.type === 'producer') {
    // Tambah produsen
    const producer = await prisma.producer.create({ data: { name: data.name } });
    return NextResponse.json(producer);
  } else if (data.type === 'cake') {
    // Tambah kue
    const cake = await prisma.cake.create({
      data: {
        name: data.name,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        producerId: data.producerId,
      },
    });
    return NextResponse.json(cake);
  }
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  if (data.type === 'producer') {
    // Edit produsen
    const producer = await prisma.producer.update({
      where: { id: data.id },
      data: { name: data.name },
    });
    return NextResponse.json(producer);
  } else if (data.type === 'cake') {
    // Edit kue
    const cake = await prisma.cake.update({
      where: { id: data.id },
      data: {
        name: data.name,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        producerId: data.producerId,
      },
    });
    return NextResponse.json(cake);
  }
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();
  if (data.type === 'producer') {
    // Hapus produsen
    await prisma.producer.delete({ where: { id: data.id } });
    return NextResponse.json({ success: true });
  } else if (data.type === 'cake') {
    // Hapus kue
    await prisma.cake.delete({ where: { id: data.id } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
} 