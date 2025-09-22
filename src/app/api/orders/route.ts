// app/api/orders/route.ts
import { NextResponse,NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getOrdersByEmail } from '@/services/order';
import { authOptions } from '../auth/[...nextauth]/route'; 

export async function GET(req: NextRequest) {
  try {
    // ✅ get session directly from server
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const result = await getOrdersByEmail(email,page, pageSize);

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      orders: result.orders,
      total: result.total,
      page,
      pageSize
    });
  } catch (err) {
    console.error('Orders fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
