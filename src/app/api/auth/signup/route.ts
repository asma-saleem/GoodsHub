import { NextResponse } from 'next/server';
import { hashPassword } from '@/utils/hash';
import { createUser, findUserByEmail } from '@/services/userService';

export async function POST(req: Request) {
  try {
    const { fullname, email, mobile, password } = await req.json();

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Save user via service
    const user = await createUser({
      fullname,
      email,
      mobile,
      password: hashedPassword
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
