import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const createUser = async (user: {
  fullname: string;
  email: string;
  mobile?: string;
  password: string;
}) => {
  return prisma.user.create({
    data: user
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email }
  });
};

export const updateUser = async (
  email: string,
  token: string,
  expiry: Date
) => {
  return prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry
    }
  });
};

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullname: true,
      email: true,
      stripeCustomerId: true
    }
  });
  return user;
}

export async function updateStripeCustomerId(
  userId: string,
  stripeCustomerId: string
) {
  return await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId }
  });
}

export async function findUserByResetToken(token: string, email: string) {
  return prisma.user.findFirst({
    where: {
      email,
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });
}

export async function updateUserPassword(email: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });
}
