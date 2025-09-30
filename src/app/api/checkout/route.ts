import { NextResponse } from 'next/server';

import { createOrder } from '@/services/order';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const { cart } = await req.json();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    const order = await createOrder(cart, userId);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
