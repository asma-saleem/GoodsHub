import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getOrdersByUserId, getAllOrders } from '@/services/order';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = session.user.role;
    let result;

    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page')
      ? Number(searchParams.get('page'))
      : 1;
    const pageSize = searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : 10;
    const searchQuery = searchParams.get('q') || '';

    if (role === 'ADMIN') {
      result = await getAllOrders(page, pageSize, searchQuery);
      
      if (!result) {
        return NextResponse.json(
          { error: 'admin orders not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        orders: result.orders,
        total: result.total,
        totalOrders: result.totalOrders,
        totalUnits: result.totalUnits,
        totalAmount: result.totalAmount,
        page,
        pageSize
      });
    } else {
      result = await getOrdersByUserId(userId, page, pageSize, searchQuery);

      if (!result) {
        return NextResponse.json(
          { error: 'User orders not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        orders: result.orders,
        total: result.total,
        page,
        pageSize
      });
    }
  } catch (err) {
    console.error('Orders fetch error:', err);

    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
