
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import Joi from 'joi';

// Joi schema
const schema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Reset token is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
    })
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate request body
    const { error, value } = schema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: error.details.map((d) => d.message) },
        { status: 400 }
      );
    }

    const { token, password } = value;

    // 🔑 Verify JWT
    const decoded = jwt.verify(token, process.env.EMAIL_PASS!) as { email: string };

    if (!decoded?.email) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // 🔒 Hash and update password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
