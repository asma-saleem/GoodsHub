import { NextRequest, NextResponse } from 'next/server';

import { getOrderById } from '@/services/order';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params; 
  const id = params.id;
  
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }        

  try {
    const order = await getOrderById(id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error('Order fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
