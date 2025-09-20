// src/app/api/auth/forgot/route.ts
// import { prisma } from '@/lib/prisma';
// import crypto from 'crypto';
import nodemailer from 'nodemailer';
import {findUserByEmail} from '@/services/userService';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    const user = await findUserByEmail(email);

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const token = jwt.sign({ email }, process.env.EMAIL_PASS!, {
      expiresIn: '5m'
    });
    
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Instructions',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this link to reset your password:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 10 minutes.</p>
      `
    });

    return new Response(
      JSON.stringify({ message: 'Reset email sent' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error',err);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
