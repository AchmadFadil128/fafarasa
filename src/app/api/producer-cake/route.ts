import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProducerUpdateData {
  name?: string;
  isHidden?: boolean;
}

interface CakeUpdateData {
  name?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  producerId?: number;
  isHidden?: boolean;
}

export async function GET(req: NextRequest) {
  const includeHidden = req.nextUrl.searchParams.get('includeHidden') === 'true';

  const cakes = await prisma.cake.findMany({
    where: includeHidden ? undefined : { isHidden: false },
    include: { producer: true },
    orderBy: { id: 'asc' },
  });
  const producers = await prisma.producer.findMany({ 
    where: { isHidden: false }, 
    orderBy: { id: 'asc' } 
  });
  return NextResponse.json({ cakes, producers });
}

interface ProducerCakePostData {
  type: 'producer' | 'cake';
  name?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  producerId?: number;
}

export async function POST(req: NextRequest) {
  const data: ProducerCakePostData = await req.json();
  if (data.type === 'producer') {
    // Tambah produsen
    const producer = await prisma.producer.create({ data: { name: data.name || '' } });
    return NextResponse.json(producer);
  } else if (data.type === 'cake') {
    // Tambah kue
    const cake = await prisma.cake.create({
      data: {
        name: data.name || '',
        purchasePrice: data.purchasePrice || 0,
        sellingPrice: data.sellingPrice || 0,
        producerId: data.producerId || 0,
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
    const updateData: ProducerUpdateData = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.isHidden !== undefined) {
      updateData.isHidden = data.isHidden;
    }
    
    const producer = await prisma.producer.update({
      where: { id: data.id },
      data: updateData,
    });
    return NextResponse.json(producer);
  } else if (data.type === 'cake') {
    const updateData: CakeUpdateData = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    if (data.purchasePrice !== undefined) {
      updateData.purchasePrice = data.purchasePrice;
    }
    if (data.sellingPrice !== undefined) {
      updateData.sellingPrice = data.sellingPrice;
    }
    if (data.producerId !== undefined) {
      updateData.producerId = data.producerId;
    }
    if (data.isHidden !== undefined) {
      updateData.isHidden = data.isHidden;
    }

    const cake = await prisma.cake.update({
      where: { id: data.id },
      data: updateData,
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
    try {
      await prisma.cake.delete({ where: { id: data.id } });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err?.code === 'P2003') {
        return NextResponse.json(
          {
            error:
              'Kue tidak bisa dihapus karena sudah dipakai pada data stok/penjualan. Hapus data terkait terlebih dahulu.',
          },
          { status: 409 }
        );
      }
      throw error;
    }
  }
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
} 