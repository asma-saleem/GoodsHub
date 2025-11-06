import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getOrdersByUserId, getAllOrders } from '@/services/order';
import { orderQuerySchema } from '@/validations/orders/order';

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
    const queryObj = {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      q: searchParams.get('q') || ''
    };
    
    const { error, value } = orderQuerySchema.validate(queryObj, { convert: true });
    if (error) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.details }, { status: 400 });
    }
    const { page, pageSize, q: searchQuery } = value;

    if (role === 'ADMIN') {
      result = await getAllOrders(page, pageSize, searchQuery);
      if (!result) {
        return NextResponse.json({ error: 'admin orders not found' }, { status: 404 });
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
