import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const getProducts = async (
  page: number = 1,
  limit: number = 8,
  query = '',
  sortBy: string = 'createdAt_desc'
) => {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || 'USER';
  const where: Prisma.ProductWhereInput = {
    isProductDeleted: false,
    ...(query
      ? {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        }
      : {}),
      ...(role !== 'ADMIN'
      ? {
          variants: {
            some: { isVariantDeleted: false }
          }
        }
      : {})
  };

  const skip = (page - 1) * limit;

  let order: Prisma.Enumerable<Prisma.ProductOrderByWithRelationInput>;
  switch (sortBy) {
    case 'title_asc':
      order = { title: 'asc' };
      break;
    case 'title_desc':
      order = { title: 'desc' };
      break;
    case 'createdAt_asc':
      order = { createdAt: 'asc' };
      break;
    case 'createdAt_desc':
    default:
      order = { createdAt: 'desc' };
  }

  const products = await prisma.product.findMany({
    skip,
    take: limit,
    where,
    orderBy: order,
    include: {
      variants: {
        where: { isVariantDeleted: false },
        select: {
          id: true,
          color: true,
          colorCode: true,
          size: true,
          price: true,
          image: true,
          stock: true
        }
      }
    }
  });
  const enrichedProducts = products.map((product) => {
    if (!product.variants.length) {
      return {
        ...product,
        defaultVariant: null,
        minPrice: null
      };
    }
    const defaultVariant = product.variants.reduce((lowest, v) =>
      v.price < lowest.price ? v : lowest
    );

    return {
      ...product,
      defaultVariant,
      minPrice: defaultVariant.price,
      image: defaultVariant.image
    };
  });

  // let sortedProducts = enrichedProducts;
  // if (sortBy === 'price_asc') {
  //   sortedProducts = [...enrichedProducts].sort(
  //     (a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity)
  //   );
  // } else if (sortBy === 'price_desc') {
  //   sortedProducts = [...enrichedProducts].sort(
  //     (a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0)
  //   );
  // }

  const total = await prisma.product.count({ where });

  return { products: enrichedProducts, total };
};


