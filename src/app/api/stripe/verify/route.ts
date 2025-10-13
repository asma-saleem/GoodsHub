import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata as { orderId?: string; userId?: string };

    if (!metadata?.orderId || !metadata.userId) {
      return NextResponse.json({ error: 'Missing orderId or userId in session metadata' }, { status: 400 });
    }

    // Fetch order from DB
    const order = await prisma.order.findUnique({
      where: { id: metadata.orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Determine latest status: webhook already updates DB, so we just report it
    const currentStatus = order.orderStatus; // e.g., 'PENDING', 'PAID', etc.

    return NextResponse.json({
      success: true,
      status: currentStatus,
      session,
      order
    });
  } catch (err) {
    console.error('Verify session error:', err);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
