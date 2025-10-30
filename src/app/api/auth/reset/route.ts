import { findUserByResetToken, updateUserPassword } from '@/services/user';
import bcrypt from 'bcryptjs';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { token, password } = body;
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }
      if (err instanceof JsonWebTokenError) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
      }

      return NextResponse.json(
        { error: 'Something went wrong' },
        { status: 500 }
      );
    }
    const user = await findUserByResetToken(token, decoded.email);
    if (!user) {
      return NextResponse.json(
        { error: 'Reset link has already been used or expired' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await updateUserPassword(decoded.email, password);

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
