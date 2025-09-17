// src/app/api/auth/forgot/route.ts
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import {findUserByEmail} from '@/services/userService';

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

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000* 60 * 10); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expires }
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
    // const transporter = nodemailer.createTransport({
    //   service: 'Gmail',
    //   auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    // });

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
