// import { prisma } from '@/lib/prisma';
// import type { Prisma } from '@prisma/client'; 

// export const getProducts = async (
//   page: number = 1,
//   limit: number = 8,
//   query = '',
//   sortBy: string = 'createdAt_desc'
// ) => {
//   const where: Prisma.ProductWhereInput = {
//     status: 'active',
//     ...(query
//       ? {
//           title: {
//             contains: query,
//             mode: 'insensitive'
//           }
//         }
//       : {})
//   };
//   const skip = (page - 1) * limit;

//   let order: Prisma.Enumerable<Prisma.ProductOrderByWithRelationInput>;
//   switch (sortBy) {
//     case 'price_asc':
//       order = { price: 'asc' };
//       break;
//     case 'price_desc':
//       order = { price: 'desc' };
//       break;
//     case 'title_asc':
//       order = { title: 'asc' };
//       break;
//     case 'title_desc':
//       order = { title: 'desc' };
//       break;
//     case 'createdAt_desc':
//     default:
//       order = { createdAt: 'desc' };
//   }
//   const products = await prisma.product.findMany({
//     skip,
//     take: limit,
//     where,
//     orderBy: order 
//   });

//   const total = await prisma.product.count({ where }); 

//   return { products, total };
// };
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const getProducts = async (
  page: number = 1,
  limit: number = 8,
  query = '',
  sortBy: string = 'createdAt_desc'
) => {
  const where: Prisma.ProductWhereInput = {
    isDeleted: 'active',
    ...(query
      ? {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        }
      : {})
  };

  const skip = (page - 1) * limit;

  // ✅ Only use fields Prisma supports
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

  // ✅ Fetch products with all active variants
  const products = await prisma.product.findMany({
    skip,
    take: limit,
    where,
    orderBy: order,
    include: {
      variants: {
        where: { availabilityStatus: 'ACTIVE' },
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

  // ✅ Enrich with lowest-price variant
  const enrichedProducts = products.map((product) => {
    if (!product.variants.length) {
      return {
        ...product,
        defaultVariant: null,
        minPrice: null
      };
    }

    // find lowest price variant (Daraz style)
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

  // ✅ Sort in-memory if sorting by price
  let sortedProducts = enrichedProducts;
  if (sortBy === 'price_asc') {
    sortedProducts = [...enrichedProducts].sort(
      (a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity)
    );
  } else if (sortBy === 'price_desc') {
    sortedProducts = [...enrichedProducts].sort(
      (a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0)
    );
  }

  const total = await prisma.product.count({ where });

  return { products: sortedProducts, total };
};

