import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Ambil semua kue beserta produsen
  const cakes = await prisma.cake.findMany({
    include: { producer: true },
    orderBy: { id: 'asc' },
  });
  // Ambil hanya produsen yang tidak disembunyikan
  const producers = await prisma.producer.findMany({ 
    where: { isHidden: false }, 
    orderBy: { id: 'asc' } 
  });
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
    const updateData: any = { name: data.name };
    if (data.isHidden !== undefined) {
      updateData.isHidden = data.isHidden;
    }
    
    const producer = await prisma.producer.update({
      where: { id: data.id },
      data: updateData,
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
    // Hide produsen alih-alih menghapus
    const producer = await prisma.producer.update({
      where: { id: data.id },
      data: { isHidden: true },
    });
    return NextResponse.json(producer);
  } else if (data.type === 'cake') {
    // Hapus kue
    await prisma.cake.delete({ where: { id: data.id } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
} 