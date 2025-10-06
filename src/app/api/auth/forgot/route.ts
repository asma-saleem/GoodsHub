import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

import { findUserByEmail, updateUser } from '@/services/user';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    const user = await findUserByEmail(email);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
      expiresIn: '10m'
    });
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await updateUser(email, token, expiry);
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
      from: `'Support' <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border:1px solid #eee; border-radius:8px;'>
      <h2 style='color:#333; text-align:center;'>Password Reset Request</h2>
      <p>Hello,</p>
      <p>You recently requested to reset your password for your account.</p>
      <p>Please click the link below to reset your password. This link will expire in <strong>10 minutes</strong>.</p>
      <a href="${resetUrl}" style="color:#007bff; text-decoration:underline;">
          Reset your password
        </a>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <hr style='margin:30px 0;'/>
      <p style='font-size:12px; color:#888; text-align:center;'>
        © ${new Date().getFullYear()} Your Company. All rights reserved. <br/>
        Need help? Contact us at <a href='mailto:${process.env.EMAIL_USER}'>${
        process.env.EMAIL_USER
      }</a>
      </p>
    </div>
  `
    });

    return new Response(JSON.stringify({ message: 'Reset email sent' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error', err);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
