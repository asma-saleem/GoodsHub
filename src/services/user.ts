import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
export interface User {
  id: string;
  fullname: string;
  email: string;
  role: string;
  mobile?: string | null;
  password: string;
  stripeCustomerId?: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  fullname: string;
  email: string;
  stripeCustomerId?: string | null;
}

export const createUser = async (user: {
  fullname: string;
  email: string;
  mobile?: string;
  password: string;
}) : Promise<User> => {
  return prisma.user.create({
    data: user
  });
};

export const findUserByEmail = async (email: string):Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email }
  });
};

export const updateUser = async (
  email: string,
  token: string,
  expiry: Date
): Promise<User> =>{
  return prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry
    }
  });
};

export const getUserById = async(userId: string): Promise<PublicUser | null>=> {
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
};

export const updateStripeCustomerId = async(
  userId: string,
  stripeCustomerId: string
) : Promise<User> => {
  return await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId }
  });
};

export const findUserByResetToken = async(token: string, email: string) : Promise<User | null> => {
  return prisma.user.findFirst({
    where: {
      email,
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    }
  });
};

export const updateUserPassword = async(email: string, newPassword: string) : Promise<User> => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });
};
