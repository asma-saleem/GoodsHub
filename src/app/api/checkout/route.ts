import { NextResponse } from 'next/server';
import { createOrder, updateOrderStripeSessionId } from '@/services/order';
import { getUserById } from '@/services/user';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { CartItemType } from '@/types/cart';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function isError(err: unknown): err is Error {
  return typeof err === 'object' && err !== null && 'message' in err;
}

export async function POST(req: Request) {
  try {
    const { cart } = await req.json();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await createOrder(cart, userId);
    if (!order?.id) {
      throw new Error('Failed to create order');
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      throw new Error('Stripe customer ID not found for user');
    }

    const line_items = cart.map((item: CartItemType) => {
      const priceWithTax = item.price * 1.1; 
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: item.title },
          unit_amount: Math.round(priceWithTax * 100)
        },
        quantity: item.qty
      };
    });

    const stripeSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items,
        metadata: { orderId: order.id, userId },

        customer_update: {
          address: 'auto',
          name: 'auto'
        },
        payment_intent_data: {
          setup_future_usage: 'off_session' 
        },

        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancel`
      });


    await updateOrderStripeSessionId(order.id, stripeSession.id);

    return NextResponse.json({
      success: true,
      url: stripeSession.url,
      orderId: order.id
    });
  } catch (err: unknown) {
    console.error('Checkout error:', err);

    const message = isError(err)
      ? err.message
      : 'Checkout failed — unknown error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

