// app/api/orders/route.ts
import { NextResponse } from 'next/server';
// import {prisma} from '@/lib/prisma';
import { getOrdersByEmail } from '@/services/order';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email'); 

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const orders = await getOrdersByEmail(email);
    if (!orders) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
