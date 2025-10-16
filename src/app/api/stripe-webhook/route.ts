import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderStatus } from '@/services/order';
import Joi from 'joi';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const metadataSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required()
}).required();

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

      const { error, value } = metadataSchema.validate(session.metadata, {
        abortEarly: false,
        allowUnknown: true 
      });

      if (error) {
        console.error('Invalid session metadata:', error.details);
        return NextResponse.json({ received: true });
      }
      const { orderId, userId } = value;

      if (!orderId || !userId) {
        console.error('Missing orderId or userId in metadata.');
        return NextResponse.json({ received: true });
      }

      const order = await updateOrderStatus(orderId, 'PAID');

      console.log('Order status updated successfully:', order.id);
    }
    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.canceled') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { error, value } = metadataSchema.validate(session.metadata, { allowUnknown: true });
      if (!error) {
        const { orderId } = value;
        await updateOrderStatus(orderId, 'CANCELED');
        console.log(`Order ${orderId} marked as CANCELLED`);
      }
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