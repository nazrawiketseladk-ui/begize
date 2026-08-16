import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

const DEFAULT_SMS_TEMPLATE = "ሰላም {tenant_name}፣ የክፍል {room_number} የዚህ ወር ኪራይ {amount} ETB ዛሬ መከፈል አለበት። ክፍያ: {payment_details}። እናመሰግናለን!";

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
      smsTemplate: user.smsTemplate || DEFAULT_SMS_TEMPLATE,
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
      smsTemplate,
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
        ...(smsTemplate !== undefined && { smsTemplate }),
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
      smsTemplate: updatedUser.smsTemplate || DEFAULT_SMS_TEMPLATE,
      preferredAlertTime: updatedUser.preferredAlertTime || '09:00',
      autoSmsEnabled: updatedUser.autoSmsEnabled ?? true
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
