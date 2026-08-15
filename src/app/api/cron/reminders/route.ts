import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

function formatEthiopianPhone(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    cleaned = '251' + cleaned.substring(1);
  } else if ((cleaned.startsWith('9') || cleaned.startsWith('7')) && cleaned.length === 9) {
    cleaned = '251' + cleaned;
  } else if (!cleaned.startsWith('251') && cleaned.length === 9) {
    cleaned = '251' + cleaned;
  }
  return cleaned;
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
    return { success: res.ok, response: data };
  } catch (err: any) {
    return { success: false, error: err.message };
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
    let user = await getAuthenticatedUser(req);

    // Fallback if triggered via cron without auth cookie: pick default user
    if (!user) {
      user = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          cbeAccount: true,
          telebirrNumber: true,
          landlordPhone: true,
          preferredAlertTime: true,
          autoSmsEnabled: true,
          createdAt: true
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'No user found for automation' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const overrideDay = searchParams.get('day') || body?.overrideDay;
    const now = new Date();
    const currentDay = overrideDay ? Number(overrideDay) : now.getDate();

    if (!user.autoSmsEnabled && !body?.isManualTest) {
      return NextResponse.json({
        success: false,
        message: 'Automated SMS triggers are currently disabled in Settings.',
        tenantSmsSent: 0,
        landlordAlertsSent: 0,
        logsCreated: 0
      });
    }

    const tenants = await prisma.tenant.findMany({
      where: { userId: user.id }
    });

    const paymentParts: string[] = [];
    if (user.cbeAccount) paymentParts.push(`CBE Account: ${user.cbeAccount}`);
    if (user.telebirrNumber) paymentParts.push(`Telebirr: ${user.telebirrNumber}`);
    const paymentString = paymentParts.length > 0 ? `\nPlease deposit to ${paymentParts.join(' or ')}.` : '';

    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Start of today for duplicate check
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let tenantSmsSent = 0;
    let landlordAlertsSent = 0;
    let logsCreated = 0;

    for (const tenant of tenants) {
      if (tenant.status === 'paid') continue;

      const dueDay = tenant.dueDay;
      const amountStr = tenant.rentAmount.toLocaleString();

      // CASE A: 3 Days Before Due Date (Advance Notice)
      if (dueDay - currentDay === 3 || (dueDay - currentDay === -27)) {
        // Check duplicate today
        const existingLog = await prisma.sMSLog.findFirst({
          where: {
            userId: user.id,
            roomNumber: tenant.roomNumber,
            type: 'ADVANCE_NOTICE',
            createdAt: { gte: startOfToday }
          }
        });

        if (!existingLog || body?.isManualTest) {
          const tenantMsg = `Hello ${tenant.tenantName}, your monthly rent for Room ${tenant.roomNumber} (${amountStr} ETB) is due in 3 days (Day ${dueDay}).${paymentString}\nThank you!`;
          
          await sendSMSEthiopiaGateway(tenant.phone, tenantMsg);

          await prisma.sMSLog.create({
            data: {
              userId: user.id,
              recipientName: tenant.tenantName,
              roomNumber: tenant.roomNumber,
              phone: tenant.phone,
              message: tenantMsg,
              status: 'Delivered',
              type: 'ADVANCE_NOTICE',
              sentAt: timeString
            }
          });
          tenantSmsSent++;
          logsCreated++;
        }
      }

      // CASE B: Exact Due Date Today
      else if (dueDay === currentDay) {
        // Check duplicate today
        const existingTenantLog = await prisma.sMSLog.findFirst({
          where: {
            userId: user.id,
            roomNumber: tenant.roomNumber,
            type: 'DUE_DATE_REMINDER',
            createdAt: { gte: startOfToday }
          }
        });

        if (!existingTenantLog || body?.isManualTest) {
          const tenantMsg = `Hello ${tenant.tenantName}, your monthly rent for Room ${tenant.roomNumber} (${amountStr} ETB) is due today (Day ${dueDay}).${paymentString}\nPlease complete your payment. Thank you!`;

          await sendSMSEthiopiaGateway(tenant.phone, tenantMsg);

          await prisma.sMSLog.create({
            data: {
              userId: user.id,
              recipientName: tenant.tenantName,
              roomNumber: tenant.roomNumber,
              phone: tenant.phone,
              message: tenantMsg,
              status: 'Delivered',
              type: 'DUE_DATE_REMINDER',
              sentAt: timeString
            }
          });
          tenantSmsSent++;
          logsCreated++;

          // Alert Landlord
          const landlordTargetPhone = user.landlordPhone || user.phone;
          if (landlordTargetPhone) {
            const landlordMsg = `[NOTICE] Room ${tenant.roomNumber} (${tenant.tenantName}) rent is due today (Day ${dueDay}). Amount: ${amountStr} ETB.`;

            await sendSMSEthiopiaGateway(landlordTargetPhone, landlordMsg);

            await prisma.sMSLog.create({
              data: {
                userId: user.id,
                recipientName: `Landlord (${user.name})`,
                roomNumber: tenant.roomNumber,
                phone: landlordTargetPhone,
                message: landlordMsg,
                status: 'Delivered',
                type: 'DUE_DATE_REMINDER',
                sentAt: timeString
              }
            });
            landlordAlertsSent++;
            logsCreated++;
          }
        }
      }

      // CASE C: Overdue (Past Due Date)
      else if (currentDay > dueDay) {
        // Update database status to overdue
        if (tenant.status !== 'overdue') {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { status: 'overdue' }
          });
        }

        const daysOverdue = currentDay - dueDay;

        // Check duplicate today
        const existingOverdueLog = await prisma.sMSLog.findFirst({
          where: {
            userId: user.id,
            roomNumber: tenant.roomNumber,
            type: 'OVERDUE_ALERT',
            createdAt: { gte: startOfToday }
          }
        });

        if (!existingOverdueLog || body?.isManualTest) {
          const landlordTargetPhone = user.landlordPhone || user.phone;
          if (landlordTargetPhone) {
            const landlordMsg = `[ALERT] Room ${tenant.roomNumber} (${tenant.tenantName}) rent is ${daysOverdue} days overdue! (Due: Day ${dueDay}) Amount: ${amountStr} ETB.`;

            await sendSMSEthiopiaGateway(landlordTargetPhone, landlordMsg);

            await prisma.sMSLog.create({
              data: {
                userId: user.id,
                recipientName: `Landlord (${user.name})`,
                roomNumber: tenant.roomNumber,
                phone: landlordTargetPhone,
                message: landlordMsg,
                status: 'Delivered',
                type: 'OVERDUE_ALERT',
                sentAt: timeString
              }
            });
            landlordAlertsSent++;
            logsCreated++;
          }
        }
      }
    }

    console.log(`[BEGIZE CRON] Automated daily check completed for Day ${currentDay}. Tenant SMS: ${tenantSmsSent}, Landlord Alerts: ${landlordAlertsSent}`);

    return NextResponse.json({
      success: true,
      currentDay,
      processedTenantsCount: tenants.length,
      tenantSmsSent,
      landlordAlertsSent,
      logsCreated,
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
