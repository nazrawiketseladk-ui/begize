import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { seedDatabaseIfEmpty } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    await seedDatabaseIfEmpty();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await signToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        cbeAccount: user.cbeAccount,
        telebirrNumber: user.telebirrNumber,
        landlordPhone: user.landlordPhone,
        preferredAlertTime: user.preferredAlertTime,
        autoSmsEnabled: user.autoSmsEnabled
      }
    });

    setAuthCookie(response, token);
    return response;
  } catch (err: any) {
    console.error('Login Error:', err);
    return NextResponse.json(
      { error: err.message || 'Login failed' },
      { status: 500 }
    );
  }
}
