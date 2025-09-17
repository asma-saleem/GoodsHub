import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client'; 

export const getProducts = async (page: number = 1, limit: number = 8, query = '', sortBy: string = 'createdAt_desc') => {
  const where: Prisma.ProductWhereInput = query
    ? { 
        title: { 
          contains: query, 
          mode: 'insensitive' 
        } 
      }
    : {};
  const skip = (page - 1) * limit;

  let order: Prisma.Enumerable<Prisma.ProductOrderByWithRelationInput>;
  switch (sortBy) {
    case 'price_asc':
      order = { price: 'asc' };
      break;
    case 'price_desc':
      order = { price: 'desc' };
      break;
    case 'title_asc':
      order = { title: 'asc' };
      break;
    case 'title_desc':
      order = { title: 'desc' };
      break;
    case 'createdAt_desc':
    default:
      order = { createdAt: 'desc' };
  }
  // Fetch products with pagination
  const products = await prisma.product.findMany({
    skip,
    take: limit,
    where,
    orderBy: order 
  });

  const total = await prisma.product.count({ where }); 

  return { products, total };
};