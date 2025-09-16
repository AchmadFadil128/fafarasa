// app/api/admin/change-credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { currentUsername, currentPassword, newUsername, newPassword } = await request.json();

    // Validasi input
    if (!currentUsername || !currentPassword || !newUsername || !newPassword) {
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Validasi panjang password baru
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'Password baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cari user admin dengan username saat ini
    const currentAdmin = await prisma.userLogin.findFirst({
      where: {
        username: currentUsername,
        role: 'ADMIN'
      }
    });

    if (!currentAdmin) {
      return NextResponse.json(
        { message: 'Username admin tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verifikasi password saat ini
    const isPasswordValid = await bcrypt.compare(currentPassword, currentAdmin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Password saat ini tidak valid' },
        { status: 401 }
      );
    }

    // Cek apakah username baru sudah ada (jika berbeda dari username saat ini)
    if (newUsername !== currentUsername) {
      const existingUser = await prisma.userLogin.findUnique({
        where: { username: newUsername }
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'Username baru sudah digunakan' },
          { status: 409 }
        );
      }
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update kredensial admin
    const updatedAdmin = await prisma.userLogin.update({
      where: { id: currentAdmin.id },
      data: {
        username: newUsername,
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Kredensial admin berhasil diubah',
      admin: {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        role: updatedAdmin.role,
        updatedAt: updatedAdmin.updatedAt
      }
    });

  } catch (error) {
    console.error('Error changing admin credentials:', error);
  
    // Selalu return JSON format
    return NextResponse.json(
      { 
        message: 'Terjadi kesalahan server internal',
        // Tambah as Error untuk skip
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}