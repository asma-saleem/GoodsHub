import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId is required' }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true, variant: true }
        },
        user: true
      }
    });

    if (!order) return NextResponse.json({ error: 'Order not found', status: 404 });
    if (order.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden', status: 403 });
    if (order.orderStatus !== 'PENDING') {
      return NextResponse.json({ error: 'Only pending orders can be paid again', status: 400 });
    }

    if (order.stripeSessionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      return NextResponse.json({ url: existingSession.url });
    }

    const line_items = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.title,
          images: item.variant?.image ? [item.variant.image] : []
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?status=cancel`,
      customer: order.user.stripeCustomerId || undefined,
      metadata: { orderId: order.id }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id }
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
