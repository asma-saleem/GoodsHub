
import { NextResponse } from 'next/server';
// import {prisma} from '@/lib/prisma'; // your prisma client
import { createOrder } from '@/services/order';

export async function POST(req: Request) {
  try {
    const { cart, email } = await req.json();

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 });
    }
    const order = await createOrder(cart, email);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
