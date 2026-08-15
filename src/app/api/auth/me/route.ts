import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { seedDatabaseIfEmpty } from '@/lib/seed';

export async function GET(req: NextRequest) {
  try {
    await seedDatabaseIfEmpty();

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}
