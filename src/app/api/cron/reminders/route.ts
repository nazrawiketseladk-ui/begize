import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

async function sendSMSEthiopiaGateway(phone: string, text: string) {
  const apiKey = process.env.SMSETHIOPIA_API_KEY || '9B81U5OBMJ8O8H5Z5U4FHCBYU25BX7TABQEK33I1';
  const msisdn = formatEthiopianPhone(phone);

  try {
    const res = await fetch('https://smsethiopia.com/api/sms/send', {
      method: 'POST',
      headers: {
        'KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ msisdn, text })
    });
    const data = await res.json().catch(() => ({}));
    return { success: res.ok, status: res.status, msisdn, response: data };
  } catch (err: any) {
    return { success: false, error: err.message, msisdn };
  }
}

export async function GET(req: NextRequest) {
  return handleCronProcess(req, null);
}

export async function POST(req: NextRequest) {
  let body = null;
  try {
    body = await req.json();
  } catch (e) {
    // Empty body
  }
  return handleCronProcess(req, body);
}

async function handleCronProcess(req: NextRequest, body: any) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const overrideDay = searchParams.get('day') || body?.overrideDay;

    // Calculate current day integer explicitly using Ethiopian Time (Africa/Addis_Ababa, UTC+3)
    const eatDateString = new Date().toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" });
    const currentDay = overrideDay ? Number(overrideDay) : new Date(eatDateString).getDate();
    const timeString = new Date(eatDateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Start of today for duplicate check
    const startOfToday = new Date(eatDateString);
    startOfToday.setHours(0, 0, 0, 0);

    // Query tenants matching today's day of the month
    const tenants = await prisma.tenant.findMany({
      where: body?.forceAll ? {} : {
        dueDay: currentDay,
      },
      include: {
        user: true,
      },
    });

    let tenantSmsSent = 0;
    let landlordAlertsSent = 0;
    let logsCreated = 0;

    const evaluatedTenants: Array<{
      id: string;
      tenantName: string;
      landlordName: string;
      landlordEmail: string;
      roomNumber: string;
      dueDay: number;
      matchedRule: 'DUE_DAY_MATCH' | 'DISABLED_AUTO_SMS';
      smsAttempted: boolean;
      apiResponse?: any;
    }> = [];

    for (const tenant of tenants) {
      const landlord = tenant.user;
      if (!landlord) continue;

      const amountStr = tenant.rentAmount.toLocaleString();

      // Skip auto SMS if landlord has disabled auto SMS (unless manual test override)
      if (!landlord.autoSmsEnabled && !body?.isManualTest) {
        evaluatedTenants.push({
          id: tenant.id,
          tenantName: tenant.tenantName,
          landlordName: landlord.name,
          landlordEmail: landlord.email,
          roomNumber: tenant.roomNumber,
          dueDay: tenant.dueDay,
          matchedRule: 'DISABLED_AUTO_SMS',
          smsAttempted: false
        });
        continue;
      }

      // Check if SMS was already dispatched today for this room
      const existingLog = await prisma.sMSLog.findFirst({
        where: {
          userId: landlord.id,
          roomNumber: tenant.roomNumber,
          type: 'DUE_DAY_REMINDER',
          createdAt: { gte: startOfToday }
        }
      });

      let smsAttempted = false;
      let apiResponse = null;

      if (!existingLog || body?.isManualTest) {
        smsAttempted = true;

        // Construct dynamic payment details string
        const paymentMethods: string[] = [];
        if (landlord.telebirrNumber) {
          paymentMethods.push(`Telebirr: ${landlord.telebirrNumber}`);
        }
        const bankName = landlord.bankName || 'CBE';
        const bankAcc = landlord.bankAccountNumber || landlord.cbeAccount;
        const holder = landlord.accountHolderName || landlord.name;
        if (bankAcc) {
          paymentMethods.push(`${bankName}: ${bankAcc}${holder ? ` (${holder})` : ''}`);
        }
        const paymentDetailsStr = paymentMethods.length > 0 ? paymentMethods.join(' / ') : 'እባክዎ አከራይዎን ያነጋግሩ';

        // Custom template or default Amharic template
        const rawTemplate = landlord.smsTemplate ||
          'ሰላም {tenant_name}፣ የክፍል {room_number} የዚህ ወር ኪራይ {amount} ETB ዛሬ መከፈል አለበት። ክፍያ: {payment_details}። እናመሰግናለን!';

        const tenantMsg = rawTemplate
          .replace(/{tenant_name}/g, tenant.tenantName)
          .replace(/{room_number}/g, tenant.roomNumber)
          .replace(/{amount}/g, amountStr)
          .replace(/{due_date}/g, `ቀን ${tenant.dueDay}`)
          .replace(/{payment_details}/g, paymentDetailsStr);

        apiResponse = await sendSMSEthiopiaGateway(tenant.phone, tenantMsg);

        await prisma.sMSLog.create({
          data: {
            userId: landlord.id,
            recipientName: tenant.tenantName,
            roomNumber: tenant.roomNumber,
            phone: tenant.phone,
            message: tenantMsg,
            status: apiResponse.success ? 'Delivered' : 'Failed',
            type: 'DUE_DAY_REMINDER',
            language: 'am',
            sentAt: timeString
          }
        });
        tenantSmsSent++;
        logsCreated++;

        // Notify Landlord alert
        const landlordTargetPhone = landlord.landlordPhone || landlord.phone;
        if (landlordTargetPhone) {
          const landlordMsg = `[BEGIZE REMINDER DISPATCHED] Room ${tenant.roomNumber} (${tenant.tenantName}) monthly rent reminder sent. Amount: ${amountStr} ETB.`;

          await sendSMSEthiopiaGateway(landlordTargetPhone, landlordMsg);

          await prisma.sMSLog.create({
            data: {
              userId: landlord.id,
              recipientName: `Landlord (${landlord.name})`,
              roomNumber: tenant.roomNumber,
              phone: landlordTargetPhone,
              message: landlordMsg,
              status: 'Delivered',
              type: 'DUE_DAY_REMINDER',
              language: 'en',
              sentAt: timeString
            }
          });
          landlordAlertsSent++;
          logsCreated++;
        }
      }

      evaluatedTenants.push({
        id: tenant.id,
        tenantName: tenant.tenantName,
        landlordName: landlord.name,
        landlordEmail: landlord.email,
        roomNumber: tenant.roomNumber,
        dueDay: tenant.dueDay,
        matchedRule: 'DUE_DAY_MATCH',
        smsAttempted,
        apiResponse
      });
    }

    console.log(`[BEGIZE CRON EAT] Monthly Due Day Reminder check completed for Day ${currentDay} (Africa/Addis_Ababa). Tenant SMS: ${tenantSmsSent}, Landlord Alerts: ${landlordAlertsSent}`);

    return NextResponse.json({
      success: true,
      timeZone: 'Africa/Addis_Ababa',
      currentDay,
      processedTenantsCount: tenants.length,
      tenantSmsSent,
      landlordAlertsSent,
      logsCreated,
      evaluatedTenants,
      executedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Cron Automation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute daily cron automation' },
      { status: 500 }
    );
  }
}
