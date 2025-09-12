import { prisma } from '@/lib/prisma';

// Get all products
export const getProducts = async () => {
  return prisma.product.findMany();
};

// export const createProducts = async (
//   data: { image: string; title: string; price: number }[]
// ) => {
//   return prisma.product.createMany({
//     data,
//     skipDuplicates: true // avoid inserting duplicates if same record exists
//   });
// };
