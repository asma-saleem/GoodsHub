// app/api/orders/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import Joi from 'joi';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getOrdersByUserId, getAllOrders } from '@/services/order';

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().allow('').default('')
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const queryObj = {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      q: searchParams.get('q') || ''
    };
    const { error, value } = querySchema.validate(queryObj, { convert: true });
    if (error) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.details }, { status: 400 });
    }
    const { page, pageSize, q: searchQuery } = value;
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const role = session.user.role;
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
