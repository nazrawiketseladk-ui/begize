import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      phone,
      telebirrNumber,
      bankName,
      bankAccountNumber,
      accountHolderName
    } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const formattedTelebirr = telebirrNumber ? telebirrNumber.trim() : null;
    const formattedBankName = bankName ? bankName.trim() : 'Commercial Bank of Ethiopia (CBE)';
    const formattedBankAccountNumber = bankAccountNumber ? bankAccountNumber.trim() : null;
    const formattedAccountHolderName = accountHolderName ? accountHolderName.trim() : name.trim();

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        landlordPhone: phone ? phone.trim() : null,
        telebirrNumber: formattedTelebirr,
        bankName: formattedBankName,
        bankAccountNumber: formattedBankAccountNumber,
        accountHolderName: formattedAccountHolderName,
        cbeAccount: formattedBankAccountNumber || null
      }
    });

    const token = await signToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        telebirrNumber: user.telebirrNumber,
        bankName: user.bankName,
        bankAccountNumber: user.bankAccountNumber,
        accountHolderName: user.accountHolderName
      }
    });

    setAuthCookie(response, token);
    return response;
  } catch (err: any) {
    console.error('Signup Error:', err);
    return NextResponse.json(
      { error: err.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
