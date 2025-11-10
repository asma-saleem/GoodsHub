import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderStatus } from '@/services/order';

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
    console.log('event',event);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId, userId } = session.metadata as { orderId?: string; userId?: string };

      if (!orderId || !userId) {
        console.error('Missing orderId or userId in metadata.');
        return NextResponse.json({ received: true });
      }

      const order = await updateOrderStatus(orderId, 'PAID');

      console.log('Order status updated successfully:', order.id);
    }
    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.canceled') {
      const session = event.data.object as Stripe.Checkout.Session;
        const { orderId } = session.metadata as { orderId?: string };
        if (!orderId) {
          console.error('Missing orderId in metadata.');
          return NextResponse.json({ received: true });
        }
        await updateOrderStatus(orderId, 'CANCELED');
        console.log(`Order ${orderId} marked as CANCELLED`);
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