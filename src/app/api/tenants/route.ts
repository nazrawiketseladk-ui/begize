import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/tenants
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenants = await prisma.tenant.findMany({
      where: { userId: user.id },
      orderBy: { roomNumber: 'asc' }
    });

    return NextResponse.json(tenants);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/tenants - Create new tenant room
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { roomNumber, tenantName, phone, rentAmount, dueDay, status, notes } = body;

    if (!roomNumber || !tenantName || !phone || !rentAmount) {
      return NextResponse.json({ error: 'Missing required tenant fields' }, { status: 400 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        userId: user.id,
        roomNumber: String(roomNumber).trim(),
        tenantName: String(tenantName).trim(),
        phone: String(phone).trim(),
        rentAmount: Number(rentAmount),
        dueDay: Number(dueDay) || 5,
        status: status || 'due-soon',
        notes: notes || null
      }
    });

    return NextResponse.json(tenant);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/tenants - Update tenant room or payment status
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, roomNumber, tenantName, phone, rentAmount, dueDay, status, lastPaidDate, notes } = body;

    if (!id) return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });

    const updated = await prisma.tenant.update({
      where: { id, userId: user.id },
      data: {
        ...(roomNumber && { roomNumber: String(roomNumber).trim() }),
        ...(tenantName && { tenantName: String(tenantName).trim() }),
        ...(phone && { phone: String(phone).trim() }),
        ...(rentAmount && { rentAmount: Number(rentAmount) }),
        ...(dueDay !== undefined && { dueDay: Number(dueDay) }),
        ...(status && { status }),
        ...(lastPaidDate !== undefined && { lastPaidDate }),
        ...(notes !== undefined && { notes })
      }
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/tenants - Delete tenant room
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });

    await prisma.tenant.delete({
      where: { id, userId: user.id }
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
