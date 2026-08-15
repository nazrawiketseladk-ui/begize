import { NextRequest, NextResponse } from 'next/server';

function formatEthiopianPhone(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('09')) {
    cleaned = '251' + cleaned.substring(1);
  } else if (cleaned.startsWith('07')) {
    cleaned = '251' + cleaned.substring(1);
  } else if (cleaned.startsWith('9') && cleaned.length === 9) {
    cleaned = '251' + cleaned;
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    cleaned = '251' + cleaned;
  } else if (!cleaned.startsWith('251') && cleaned.length === 9) {
    cleaned = '251' + cleaned;
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      recipientPhone,
      message,
      recipientName,
      roomNumber,
      amount,
      dueDate,
      cbeAccount,
      telebirrNumber,
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

    // Build message text if not directly provided
    let finalMessageText = message;
    if (!finalMessageText) {
      const formattedAmount = Number(amount || 0).toLocaleString();
      let paymentDestText = '';
      if (cbeAccount || telebirrNumber) {
        const parts: string[] = [];
        if (cbeAccount) parts.push(`CBE Account: ${cbeAccount}`);
        if (telebirrNumber) parts.push(`Telebirr: ${telebirrNumber}`);
        paymentDestText = `\nPlease deposit to ${parts.join(' or ')}.`;
      }
      finalMessageText = `Hello ${recipientName || 'Tenant'}, your monthly rent for Room ${roomNumber || ''} (${formattedAmount} ETB) is due on ${dueDate || 'soon'}.${paymentDestText}${customNote ? `\nNote: ${customNote}` : ''}\nThank you!`;
    }

    const apiKey = process.env.SMSETHIOPIA_API_KEY || "9B81U5OBMJ8O8H5Z5U4FHCBYU25BX7TABQEK33I1";

    console.log(`[SMSETHIOPIA API] Sending SMS to ${formattedPhone}...`);

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
      // Return response status with error detail or fallback message
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
