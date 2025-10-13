import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { createOrder } from '@/services/order';

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

    // ✅ When payment completes successfully
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;

      console.log('✅ Payment successful for user:', userId);

      // ✅ Extract product details from metadata (we sent the full cart earlier)
      const cartDataRaw = session.metadata?.cart;
      const cart = cartDataRaw ? JSON.parse(cartDataRaw) : [];

      if (!userId || !cart.length) {
        console.error('Missing user or cart in metadata.');
        return NextResponse.json({ received: true });
      }

      // ✅ Validate product variants exist before saving
      const errors: string[] = [];
      for (const item of cart) {
        const variant = await prisma.productVariant.findFirst({
          where: {
            id: item.variantId,
            productId: item.id,
            size: item.size,
            color: item.color,
            availabilityStatus: 'ACTIVE'
          }
        });

        if (!variant) {
          errors.push(`Variant ${item.color}/${item.size} does not exist.`);
          continue;
        }
        if (variant.stock < item.qty) {
          errors.push(`Not enough stock for ${item.color}/${item.size}.`);
        }
      }

      if (errors.length > 0) {
        console.error('Order validation errors:', errors);
        return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
      }

      // ✅ Create order in DB (using your existing service)
      const order = await createOrder(cart, userId);

      console.log('🧾 Order saved successfully:', order.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
  if (err instanceof Error) {
    console.error('❌ Webhook Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  console.error('❌ Unknown Webhook Error:', err);
  return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
}

}
