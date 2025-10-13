import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);


export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId || !userId) {
        console.error('Missing orderId or userId in metadata.');
        return NextResponse.json({ received: true });
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: 'PAID' } 
      });

      console.log('🟢 Order status updated successfully:', order.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    if (err instanceof Error) {
      console.error('Webhook Error:', err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('Unknown Webhook Error:', err);
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
}