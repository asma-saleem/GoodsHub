import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ProductVariantType } from '@/types/product';

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
        orderBy: { createdAt: 'asc' },
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

  const total = await prisma.product.count({ where });

  return { products: enrichedProducts, total };
};

export async function getVariantById(variantId: string) {
  return prisma.productVariant.findUnique({
    where: { id: variantId }
  });
}

export async function reactivateVariant(variantId: string) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data: { isVariantDeleted: false }
  });
}

export async function findProductByTitleExcludingId({title, id}: {
  title: string;
  id: string;
}) {
  return prisma.product.findFirst({
    where: {
      title: {
        equals: title,
        mode: 'insensitive'
      },
      NOT: { id }
    }
  });
}

export async function updateProductTitle({id, data}: {
  id: string;
  data: { title: string };
}) {
  return prisma.product.update({
    where: { id },
    data,
    include: { variants: true }
  });
}

export async function softDeleteProduct({ id }: {
  id: string;
}) {
  return prisma.product.update({
    where: { id },
    data: { isProductDeleted: true }
  });
}

export async function findProductByTitle({ title }: { title: string }) {
  return prisma.product.findFirst({
    where: { title: {
        equals: title.trim(),
        mode: 'insensitive' // makes it case-insensitive
      } 
    }
  });
}

export async function createVariants(variants: ProductVariantType[]) {
  const seen = new Set<string>();

  return variants
    .map((variant) => {
      const color = variant.color?.trim().toLowerCase() || '';
      const size = variant.size?.trim().toLowerCase() || '';
      const key = `${color}-${size}`;

      if (seen.has(key)) return null;
      seen.add(key);

      const imageData =
        variant.image as string | { url?: string }[] | undefined;

      return {
        color: variant.color ?? null,
        colorCode: variant.colorCode ?? null,
        size: variant.size ?? null,
        price: Number(variant.price),
        stock: Number(variant.stock),
        image:
          typeof imageData === 'string'
            ? imageData
            : imageData?.[0]?.url ?? null
      };
    })
    .filter((v) => v !== null);
}

export async function createProductWithVariants({ title, variantData }: {
  title: string;
  variantData: Awaited<ReturnType<typeof createVariants>>;
}) {
  return prisma.product.create({
    data: {
      title,
      variants: {
        create: variantData
      }
    },
    include: { variants: true }
  });
}

export async function findVariant({ productId, color, size }: { productId: string; color?: string; size?: string }) {
  return prisma.productVariant.findFirst({
    where: { productId, color, size }
  });
}

// Create a new variant
export async function createVariant({
  productId,
  color,
  colorCode,
  size,
  price,
  stock,
  image
}: {
  productId: string;
  color?: string | null;
  colorCode?: string | null;
  size?: string | null;
  price: number;
  stock: number;
  image?: string | null;
}) {
  return prisma.productVariant.create({
    data: {
      productId,
      color: color ?? null,
      colorCode: colorCode ?? null,
      size: size ?? null,
      price,
      stock,
      image: image ?? null
    }
  });
}

// Find a variant by its ID
export async function findVariantById(variantId: string) {
  return prisma.productVariant.findUnique({ where: { id: variantId } });
}

// Check for duplicate variant in same product
export async function findDuplicateVariant({ productId, color, size, excludeId }: { productId: string; color?: string; size?: string; excludeId?: string }) {
  return prisma.productVariant.findFirst({
    where: {
      productId,
      color,
      size,
      NOT: { id: excludeId }
    }
  });
}

// Update a variant
export async function updateVariant({
  variantId,
  color,
  colorCode,
  size,
  price,
  stock,
  image
}: {
  variantId: string;
  color?: string | null;
  colorCode?: string | null;
  size?: string | null;
  price: number;
  stock: number;
  image?: string | null;
}) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data: { color, colorCode, size, price, stock, image }
  });
}

// Soft delete a variant
export async function softDeleteVariant(variantId: string) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data: { isVariantDeleted: true }
  });
}




