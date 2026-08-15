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
    const now = new Date();
    const currentDay = overrideDay ? Number(overrideDay) : now.getDate();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Start of today for duplicate check
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Fetch ALL tenants across ALL registered landlords
    const tenants = await prisma.tenant.findMany({
      include: {
        user: true
      }
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
      status: string;
      matchedRule: 'UPCOMING_3_DAYS' | 'DUE_TODAY' | 'OVERDUE' | 'PAID_NO_ACTION' | 'DISABLED_AUTO_SMS' | 'NONE';
      smsAttempted: boolean;
      apiResponse?: any;
    }> = [];

    for (const tenant of tenants) {
      const landlord = tenant.user;
      if (!landlord) continue;

      const dueDay = tenant.dueDay;
      const amountStr = tenant.rentAmount.toLocaleString();

      // Skip auto SMS if landlord has disabled it (unless manual test override)
      if (!landlord.autoSmsEnabled && !body?.isManualTest) {
        evaluatedTenants.push({
          id: tenant.id,
          tenantName: tenant.tenantName,
          landlordName: landlord.name,
          landlordEmail: landlord.email,
          roomNumber: tenant.roomNumber,
          dueDay: tenant.dueDay,
          status: tenant.status,
          matchedRule: 'DISABLED_AUTO_SMS',
          smsAttempted: false
        });
        continue;
      }

      if (tenant.status === 'paid') {
        evaluatedTenants.push({
          id: tenant.id,
          tenantName: tenant.tenantName,
          landlordName: landlord.name,
          landlordEmail: landlord.email,
          roomNumber: tenant.roomNumber,
          dueDay: tenant.dueDay,
          status: tenant.status,
          matchedRule: 'PAID_NO_ACTION',
          smsAttempted: false
        });
        continue;
      }

      // Dynamically build landlord payment details string
      const paymentMethods: string[] = [];
      if (landlord.telebirrNumber) {
        paymentMethods.push(`Telebirr: ${landlord.telebirrNumber}`);
      }
      const bankName = landlord.bankName || 'CBE';
      const bankAcc = landlord.bankAccountNumber || landlord.cbeAccount;
      const holder = landlord.accountHolderName || landlord.name;
      if (bankAcc) {
        paymentMethods.push(`${bankName}: ${bankAcc} (${holder})`);
      }

      const paymentString = paymentMethods.length > 0
        ? `\nክፍያ በ ${paymentMethods.join(' ወይም ')} መላክ ይችላሉ።`
        : '';

      // Rule Evaluation
      const isUpcoming3Days = (dueDay - currentDay === 3) || (dueDay - currentDay === -27);
      const isDueToday = (dueDay === currentDay);
      const isOverdue = (currentDay > dueDay);

      // CASE A: 3 Days Before Due Date (Upcoming)
      if (isUpcoming3Days) {
        const existingLog = await prisma.sMSLog.findFirst({
          where: {
            userId: landlord.id,
            roomNumber: tenant.roomNumber,
            type: 'ADVANCE_NOTICE',
            createdAt: { gte: startOfToday }
          }
        });

        let smsAttempted = false;
        let apiResponse = null;

        if (!existingLog || body?.isManualTest) {
          smsAttempted = true;
          const tenantMsg = `Hello ${tenant.tenantName}, your monthly rent for Room ${tenant.roomNumber} (${amountStr} ETB) is due in 3 days (Day ${dueDay}).${paymentString}\nThank you!`;
          
          apiResponse = await sendSMSEthiopiaGateway(tenant.phone, tenantMsg);

          await prisma.sMSLog.create({
            data: {
              userId: landlord.id,
              recipientName: tenant.tenantName,
              roomNumber: tenant.roomNumber,
              phone: tenant.phone,
              message: tenantMsg,
              status: apiResponse.success ? 'Delivered' : 'Failed',
              type: 'ADVANCE_NOTICE',
              sentAt: timeString
            }
          });
          tenantSmsSent++;
          logsCreated++;
        }

        evaluatedTenants.push({
          id: tenant.id,
          tenantName: tenant.tenantName,
          landlordName: landlord.name,
          landlordEmail: landlord.email,
          roomNumber: tenant.roomNumber,
          dueDay: tenant.dueDay,
          status: tenant.status,
          matchedRule: 'UPCOMING_3_DAYS',
          smsAttempted,
          apiResponse
        });
      }

      // CASE B: ON Due Date (Due Today)
      else if (isDueToday) {
        const existingTenantLog = await prisma.sMSLog.findFirst({
          where: {
            userId: landlord.id,
            roomNumber: tenant.roomNumber,
            type: 'DUE_DATE_REMINDER',
            createdAt: { gte: startOfToday }
          }
        });

        let smsAttempted = false;
        let apiResponse = null;

        if (!existingTenantLog || body?.isManualTest) {
          smsAttempted = true;
          const tenantMsg = `Hello ${tenant.tenantName}, your monthly rent for Room ${tenant.roomNumber} (${amountStr} ETB) is due today (Day ${dueDay}).${paymentString}\nPlease complete your payment. Thank you!`;

          apiResponse = await sendSMSEthiopiaGateway(tenant.phone, tenantMsg);

          await prisma.sMSLog.create({
            data: {
              userId: landlord.id,
              recipientName: tenant.tenantName,
              roomNumber: tenant.roomNumber,
              phone: tenant.phone,
              message: tenantMsg,
              status: apiResponse.success ? 'Delivered' : 'Failed',
              type: 'DUE_DATE_REMINDER',
              sentAt: timeString
            }
          });
          tenantSmsSent++;
          logsCreated++;

          // Alert Landlord
          const landlordTargetPhone = landlord.landlordPhone || landlord.phone;
          if (landlordTargetPhone) {
            const landlordMsg = `[NOTICE] Room ${tenant.roomNumber} (${tenant.tenantName}) rent is due today (Day ${dueDay}). Amount: ${amountStr} ETB.`;

            await sendSMSEthiopiaGateway(landlordTargetPhone, landlordMsg);

            await prisma.sMSLog.create({
              data: {
                userId: landlord.id,
                recipientName: `Landlord (${landlord.name})`,
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

        evaluatedTenants.push({
          id: tenant.id,
          tenantName: tenant.tenantName,
          landlordName: landlord.name,
          landlordEmail: landlord.email,
          roomNumber: tenant.roomNumber,
          dueDay: tenant.dueDay,
          status: tenant.status,
          matchedRule: 'DUE_TODAY',
          smsAttempted,
          apiResponse
        });
      }

      // CASE C: 1+ Days After Due Date (Overdue)
      else if (isOverdue) {
        // Update database status to overdue if not already set
        if (tenant.status !== 'overdue') {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { status: 'overdue' }
          });
        }

        const daysOverdue = currentDay - dueDay;

        const existingOverdueLog = await prisma.sMSLog.findFirst({
          where: {
            userId: landlord.id,
            roomNumber: tenant.roomNumber,
            type: 'OVERDUE_ALERT',
            createdAt: { gte: startOfToday }
          }
        });

        let smsAttempted = false;
        let apiResponse = null;

        if (!existingOverdueLog || body?.isManualTest) {
          smsAttempted = true;
          const landlordTargetPhone = landlord.landlordPhone || landlord.phone;
          if (landlordTargetPhone) {
            const landlordMsg = `[ALERT] Room ${tenant.roomNumber} (${tenant.tenantName}) rent is ${daysOverdue} days overdue! (Due: Day ${dueDay}) Amount: ${amountStr} ETB.`;

            apiResponse = await sendSMSEthiopiaGateway(landlordTargetPhone, landlordMsg);

            await prisma.sMSLog.create({
              data: {
                userId: landlord.id,
                recipientName: `Landlord (${landlord.name})`,
                roomNumber: tenant.roomNumber,
                phone: landlordTargetPhone,
                message: landlordMsg,
                status: apiResponse.success ? 'Delivered' : 'Failed',
                type: 'OVERDUE_ALERT',
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
          status: 'overdue',
          matchedRule: 'OVERDUE',
          smsAttempted,
          apiResponse
        });
      } else {
        evaluatedTenants.push({
          id: tenant.id,
          tenantName: tenant.tenantName,
          landlordName: landlord.name,
          landlordEmail: landlord.email,
          roomNumber: tenant.roomNumber,
          dueDay: tenant.dueDay,
          status: tenant.status,
          matchedRule: 'NONE',
          smsAttempted: false
        });
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
