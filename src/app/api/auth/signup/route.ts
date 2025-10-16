
import { NextResponse } from 'next/server';
import { updateStripeCustomerId } from '@/services/user';
import Joi from 'joi';
import { hashPassword } from '@/utils/hash';
import Stripe from 'stripe';

import { createUser, findUserByEmail } from '@/services/user';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const signupSchema = Joi.object({
  fullname: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 3 characters',
    'string.max': 'Full name cannot exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format'
  }),
  mobile: Joi.string()
    .pattern(/^(?:\+92|0)[0-9]{10}$/) 
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base':
        'Enter a valid mobile number (e.g. 03001234567 or +923001234567)'
    }),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.pattern.base':
        'Password must be at least 8 characters, include uppercase, lowercase, number & special character'
    })
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error, value } = signupSchema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((err) => err.message) },
        { status: 400 }
      );
    }

    const { fullname, email, mobile, password } = value;

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
    // Step 2: Create Stripe customer immediately
    const stripeCustomer = await stripe.customers.create({
      name: fullname,
      email,
      metadata: { userId: user.id }
    });

    // Step 3: Save Stripe customer ID in user record
    await updateStripeCustomerId(user.id, stripeCustomer.id);

    return NextResponse.json({ user:{ ...user, stripeCustomerId: stripeCustomer.id } }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

