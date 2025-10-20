
import { NextResponse } from 'next/server';
import { updateStripeCustomerId } from '@/services/user';
import { hashPassword } from '@/utils/hash';
import Stripe from 'stripe';

import { createUser, findUserByEmail } from '@/services/user';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { fullname, email, mobile, password } = body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await createUser({
      fullname,
      email,
      mobile,
      password: hashedPassword
    });

    const stripeCustomer = await stripe.customers.create({
      name: fullname,
      email,
      metadata: { userId: user.id }
    });

    await updateStripeCustomerId(user.id, stripeCustomer.id);

    return NextResponse.json({ user:{ ...user, stripeCustomerId: stripeCustomer.id } }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

