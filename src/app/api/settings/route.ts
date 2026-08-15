import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
      cbeAccount: user.cbeAccount || user.bankAccountNumber || '',
      telebirrNumber: user.telebirrNumber || '',
      bankName: user.bankName || 'Commercial Bank of Ethiopia (CBE)',
      bankAccountNumber: user.bankAccountNumber || user.cbeAccount || '',
      accountHolderName: user.accountHolderName || user.name || '',
      landlordPhone: user.landlordPhone || user.phone || '',
      preferredAlertTime: user.preferredAlertTime || '09:00',
      autoSmsEnabled: user.autoSmsEnabled ?? true
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      cbeAccount,
      telebirrNumber,
      bankName,
      bankAccountNumber,
      accountHolderName,
      landlordPhone,
      preferredAlertTime,
      autoSmsEnabled
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(cbeAccount !== undefined && { cbeAccount }),
        ...(telebirrNumber !== undefined && { telebirrNumber }),
        ...(bankName !== undefined && { bankName }),
        ...(bankAccountNumber !== undefined && { bankAccountNumber, cbeAccount: bankAccountNumber }),
        ...(accountHolderName !== undefined && { accountHolderName, name: accountHolderName }),
        ...(landlordPhone !== undefined && { landlordPhone }),
        ...(preferredAlertTime !== undefined && { preferredAlertTime }),
        ...(autoSmsEnabled !== undefined && { autoSmsEnabled })
      }
    });

    return NextResponse.json({
      cbeAccount: updatedUser.cbeAccount || updatedUser.bankAccountNumber || '',
      telebirrNumber: updatedUser.telebirrNumber || '',
      bankName: updatedUser.bankName || 'Commercial Bank of Ethiopia (CBE)',
      bankAccountNumber: updatedUser.bankAccountNumber || updatedUser.cbeAccount || '',
      accountHolderName: updatedUser.accountHolderName || updatedUser.name || '',
      landlordPhone: updatedUser.landlordPhone || updatedUser.phone || '',
      preferredAlertTime: updatedUser.preferredAlertTime || '09:00',
      autoSmsEnabled: updatedUser.autoSmsEnabled ?? true
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
