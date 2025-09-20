// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getOrdersByEmail } from '@/services/order';
import { authOptions } from '../auth/[...nextauth]/route'; // ✅ your next-auth config

export async function GET() {
  try {
    // ✅ get session directly from server
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const orders = await getOrdersByEmail(email);

    if (!orders) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error('Orders fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
