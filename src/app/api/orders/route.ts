// app/api/orders/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getOrdersByUserId, getAllOrders } from '@/services/order';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const role = session.user.role;
    const page = parseInt(searchParams.get('page') || '1' , 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const searchQuery = searchParams.get('q') || '';
    let result;

    if (role === 'ADMIN') {
      result = await getAllOrders(page, pageSize, searchQuery);
      if (!result) {
        return NextResponse.json({ error: 'admin orders not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        orders: result.orders,
        total: result.total,
        totalUnits: result.totalUnits,
        totalAmount: result.totalAmount,
        page,
        pageSize
      });
    } else {
      result = await getOrdersByUserId(userId, page, pageSize, searchQuery);
      
      if (!result) {
        return NextResponse.json({ error: 'User orders not found' }, { status: 404 });
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
