import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createOrder, updateOrderStripeSessionId } from '@/services/order';
import { getUserById } from '@/services/user';
import { CartItemType } from '@/types/cart';
import { TAX_RATE } from '@/lib/utils';

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
      const priceWithTax = item.price * (1 + TAX_RATE);
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

    return NextResponse.json(
      {
        success: true,
        url: stripeSession.url,
        orderId: order.id
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Checkout error:', err);

    if (
      typeof err === 'object' &&
      err &&
      'validation' in err &&
      'errors' in err
    ) {
      const e = err as { errors: string[] };
      return NextResponse.json(
        { success: false, errors: e.errors },
        { status: 400 }
      );
    }

    const message = isError(err)
      ? err.message
      : 'Checkout failed — unknown error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
