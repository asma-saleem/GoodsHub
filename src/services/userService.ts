import { prisma } from '@/lib/prisma';

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
