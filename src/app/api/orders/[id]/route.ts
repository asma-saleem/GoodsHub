import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/services/order';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
 
  const params = await context.params; 
  const id = params.id;        

  try {
   
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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
