// import { NextResponse } from 'next/server';
// import Joi from 'joi';

// import { createOrder } from '@/services/order';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { getServerSession } from 'next-auth';
// import { prisma } from '@/lib/prisma';
// import { CartItemType } from '@/types/cart';

// const cartItemSchema = Joi.object({
//   key: Joi.number().required(),
//   id: Joi.string().uuid().required(),
//   variantId: Joi.string().uuid().required(),
//   title: Joi.string().required(),
//   image: Joi.string().required(),
//   price: Joi.number().min(0).required(),
//   qty: Joi.number().min(1).required(),
//   stock: Joi.number().min(0).required(),
//   size: Joi.string().required(),
//   color: Joi.string().required(),
//   colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required()
// });

// const cartSchema = Joi.array().items(cartItemSchema).min(1).required();

// export async function POST(req: Request) {
//   try {
//     const { cart } = await req.json();
//     const session = await getServerSession(authOptions);
//     const userId = session?.user?.id;

//     if (!userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { error } = cartSchema.validate(cart, { abortEarly: false });
//     if (error) {
//       return NextResponse.json({ error: 'Invalid cart', details: error.details }, { status: 400 });
//     }

//     const variantIds = (cart as CartItemType[]).map(item => item.variantId);
//     const variants = await prisma.productVariant.findMany({
//       where: {
//         id: { in: variantIds },
//         availabilityStatus: 'ACTIVE'
//       }
//     });

//     const variantMap = new Map(variants.map(v => [v.id, v]));

//     const errors: string[] = [];

//     for (const item of cart) {
//       const variant = variantMap.get(item.variantId);

//       if (!variant || variant.productId !== item.id || variant.size !== item.size || variant.color !== item.color) {
//         errors.push(`Variant ${item.color} / ${item.size} does not exist.`);
//         continue;
//       }

//       if (variant.stock < item.qty) {
//         errors.push(`Not enough stock for ${item.color} / ${item.size}`);
//       }
//     }

//     if (errors.length > 0) {
//       return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
//     }
//     const order = await createOrder(cart, userId);

//     return NextResponse.json({ success: true, order }, { status: 201 });
//   } catch (err) {
//     console.error('Checkout error:', err);
//     return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import Joi from 'joi';

import { createOrder } from '@/services/order';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { CartItemType } from '@/types/cart';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const cartItemSchema = Joi.object({
  key: Joi.number().required(),
  id: Joi.string().uuid().required(),
  variantId: Joi.string().uuid().required(),
  title: Joi.string().required(),
  image: Joi.string().required(),
  price: Joi.number().min(0).required(),
  qty: Joi.number().min(1).required(),
  stock: Joi.number().min(0).required(),
  size: Joi.string().required(),
  color: Joi.string().required(),
  colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required()
});

const cartSchema = Joi.array().items(cartItemSchema).min(1).required();

export async function POST(req: Request) {
  try {
    const { cart } = await req.json(); 
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = cartSchema.validate(cart, { abortEarly: false });
    if (error) return NextResponse.json({ error: 'Invalid cart', details: error.details }, { status: 400 });

   
    const order = await createOrder(cart, userId); 

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const stripeCustomer = await stripe.customers.create({
      name: user?.fullname,
      email: user?.email,
      metadata: { orderId: order.id, userId }
    });
    const line_items = cart.map((item: CartItemType) => {
      const priceWithTax = item.price * 1.10;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title
          },
          unit_amount: Math.round(priceWithTax * 100)
        },
        quantity: item.qty
      };
    });

    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      metadata: { orderId: order.id, userId },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`
    });

    return NextResponse.json({ success: true, url: stripeSession.url, orderId: order.id });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}

