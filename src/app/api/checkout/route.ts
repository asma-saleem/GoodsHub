import { NextResponse } from 'next/server';
import Joi from 'joi';

import { createOrder } from '@/services/order';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

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
    const errors: string[] = [];
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { error } = cartSchema.validate(cart, { abortEarly: false });
    if (error) {
      return NextResponse.json({ error: 'Invalid cart', details: error.details }, { status: 400 });
    }
    console.log(JSON.stringify(cart));
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
       errors.push(`Variant ${item.color} / ${item.size} does not exist.\n`);
       continue; 
    }

    if (variant.stock < item.qty) {
      errors.push(`Not enough stock for ${item.color} / ${item.size}`);
     }

    }
    if (errors.length > 0) {
        return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
    }
    const order = await createOrder(cart, userId);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
