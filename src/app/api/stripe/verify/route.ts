import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import Joi from 'joi';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const metadataSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required()
}).required();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata as { orderId?: string; userId?: string };
    const { error, value } = metadataSchema.validate(metadata, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      console.error('Invalid session metadata:', error.details);
      return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 });
    }

    const { orderId, userId } = value;

    if (!orderId || !userId) {
      return NextResponse.json({ error: 'Missing orderId or userId in session metadata' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.orderStatus; 

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

