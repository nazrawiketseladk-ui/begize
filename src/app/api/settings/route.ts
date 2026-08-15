import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
      cbeAccount: user.cbeAccount,
      telebirrNumber: user.telebirrNumber,
      accountHolderName: user.name,
      landlordPhone: user.landlordPhone,
      preferredAlertTime: user.preferredAlertTime,
      autoSmsEnabled: user.autoSmsEnabled
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
    const { cbeAccount, telebirrNumber, accountHolderName, landlordPhone, preferredAlertTime, autoSmsEnabled } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(cbeAccount !== undefined && { cbeAccount }),
        ...(telebirrNumber !== undefined && { telebirrNumber }),
        ...(accountHolderName !== undefined && { name: accountHolderName }),
        ...(landlordPhone !== undefined && { landlordPhone }),
        ...(preferredAlertTime !== undefined && { preferredAlertTime }),
        ...(autoSmsEnabled !== undefined && { autoSmsEnabled })
      }
    });

    return NextResponse.json({
      cbeAccount: updatedUser.cbeAccount,
      telebirrNumber: updatedUser.telebirrNumber,
      accountHolderName: updatedUser.name,
      landlordPhone: updatedUser.landlordPhone,
      preferredAlertTime: updatedUser.preferredAlertTime,
      autoSmsEnabled: updatedUser.autoSmsEnabled
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
