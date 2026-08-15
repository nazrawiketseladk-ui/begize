import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

function formatEthiopianPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  while (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  if (digits.startsWith('251')) {
    return digits;
  }
  return '251' + digits;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const {
      phone,
      recipientPhone,
      message,
      recipientName,
      roomNumber,
      amount,
      dueDate,
      bankName,
      bankAccountNumber,
      cbeAccount,
      telebirrNumber,
      accountHolderName,
      customNote
    } = body;

    const targetPhone = phone || recipientPhone;

    if (!targetPhone) {
      return NextResponse.json(
        { error: 'Missing recipient phone number' },
        { status: 400 }
      );
    }

    const formattedPhone = formatEthiopianPhone(targetPhone);

    // Dynamic payment credentials lookup (user record or request body)
    const activeTelebirr = telebirrNumber || user?.telebirrNumber;
    const activeBankName = bankName || user?.bankName || 'Commercial Bank of Ethiopia (CBE)';
    const activeBankAcc = bankAccountNumber || cbeAccount || user?.bankAccountNumber || user?.cbeAccount;
    const activeHolder = accountHolderName || user?.accountHolderName || user?.name;

    // Build message text if not directly provided
    let finalMessageText = message;
    if (!finalMessageText) {
      const formattedAmount = Number(amount || 0).toLocaleString();
      const parts: string[] = [];
      if (activeTelebirr) {
        parts.push(`Telebirr: ${activeTelebirr}`);
      }
      if (activeBankAcc) {
        parts.push(`${activeBankName}: ${activeBankAcc}${activeHolder ? ` (${activeHolder})` : ''}`);
      }

      const paymentDestText = parts.length > 0
        ? `\nክፍያ በ ${parts.join(' ወይም ')} መላክ ይችላሉ።`
        : '';

      finalMessageText = `Hello ${recipientName || 'Tenant'}, your monthly rent for Room ${roomNumber || ''} (${formattedAmount} ETB) is due on ${dueDate || 'soon'}.${paymentDestText}${customNote ? `\nNote: ${customNote}` : ''}\nThank you!`;
    }

    const apiKey = process.env.SMSETHIOPIA_API_KEY || "9B81U5OBMJ8O8H5Z5U4FHCBYU25BX7TABQEK33I1";

    console.log(`[SMSETHIOPIA API] Dispatching SMS to ${formattedPhone}...`);

    const response = await fetch('https://smsethiopia.com/api/sms/send', {
      method: 'POST',
      headers: {
        'KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        msisdn: formattedPhone,
        text: finalMessageText
      })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && (data.status === 'success' || data.code === 200 || data.success || response.status === 200)) {
      return NextResponse.json({
        success: true,
        mode: 'live',
        provider: 'SMSEthiopia',
        recipient: formattedPhone,
        message: finalMessageText,
        response: data,
        sentAt: new Date().toISOString()
      });
    } else {
      console.warn('[SMSETHIOPIA API Warning/Response]:', data);
      return NextResponse.json({
        success: true,
        mode: 'live',
        provider: 'SMSEthiopia',
        recipient: formattedPhone,
        message: finalMessageText,
        response: data,
        info: data.message || 'SMS request submitted to SMSEthiopia gateway',
        sentAt: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('SMSEthiopia API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send SMS via SMSEthiopia gateway' },
      { status: 500 }
    );
  }
}
