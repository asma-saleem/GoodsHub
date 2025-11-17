import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ProductVariantType } from '@/types/product';
export interface VariantResponse {
  id: string;
  color?: string | null;
  colorCode?: string | null;
  size?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  isVariantDeleted: boolean;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface FindProductResponse {
  id: string;
  title: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isProductDeleted: boolean;
}
export interface NewVariantData {
  color: string | null;
  colorCode: string | null;
  size: string | null;
  price: number;
  stock: number;
  image: string | null;
}
export interface CreateProductWithVariantsResponse {
  id: string;
  title: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isProductDeleted: boolean;

  variants: {
    id: string;
    color?: string | null;
    colorCode?: string | null;
    size?: string | null;
    price: number;
    stock: number;
    image?: string | null;
    isVariantDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export interface VariantLite {
  id: string;
  color: string | null;
  colorCode: string | null;
  size: string | null;
  image: string | null;
  price: number;
  stock: number;
}

export interface ProductWithVariantLite {
  id: string;
  title: string;
  isProductDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;

  variants: VariantLite[];

  defaultVariant: VariantLite | null;
  minPrice: number | null;
}
export const getProducts = async (
  page: number = 1,
  limit: number = 8,
  query = '',
  sortBy: string = 'createdAt_desc'
) : Promise<{ products: ProductWithVariantLite[]; total: number }> => {
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
        orderBy: [
          { createdAt: 'desc' },
          { id: 'asc' }
        ],
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

export const getVariantById = async (
  variantId: string
) : Promise<VariantResponse | null> => {
  return prisma.productVariant.findUnique({
    where: { id: variantId }
  });
};

export const reactivateVariant = async (
  variantId: string,
  updates?: { price?: number; stock?: number;image?: string }
) : Promise<VariantResponse> => {
  return prisma.productVariant.update({
    where: { id: variantId },
    data: {
      isVariantDeleted: false,
      ...(updates?.price !== undefined && { price: updates.price }),
      ...(updates?.stock !== undefined && { stock: updates.stock }),
      ...(updates?.image !== undefined && { image: updates.image })
    }
  });
};

export const findProductByTitleExcludingId = async ({
  title,
  id
}: {
  title: string;
  id: string;
}) : Promise<FindProductResponse | null> => {
  return prisma.product.findFirst({
    where: {
      title: {
        equals: title,
        mode: 'insensitive'
      },
      NOT: { id }
    }
  });
};

export const updateProductTitle = async ({
  id,
  data
}: {
  id: string;
  data: { title: string };
}) : Promise<CreateProductWithVariantsResponse> => {
  return prisma.product.update({
    where: { id },
    data,
    include: { variants: true }
  });
};

export const softDeleteProduct = async ({ id }: { id: string }) : Promise<FindProductResponse>=>
 prisma.product.update({
    where: { id },
    data: { isProductDeleted: true }
  });

export const findProductByTitle = async ({ title }: { title: string }): Promise<FindProductResponse|null> =>
  prisma.product.findFirst({
    where: {
      title: {
        equals: title.trim(),
        mode: 'insensitive'
      }
    }
  });


export const createVariants = async (variants: ProductVariantType[]) : Promise<NewVariantData[]> => {
  const seen = new Set<string>();

  return variants.map((variant) => {
    const color = variant.color?.trim().toLowerCase() || '';
    const size = variant.size?.trim().toLowerCase() || '';
    const key = `${color}-${size}`;

    if (seen.has(key)) {
      throw new Error(
        `Duplicate variant found with color "${variant.color}" and size "${variant.size}".`
      );
    }
    seen.add(key);

    const imageData = variant.image as string | { url?: string }[] | undefined;

    return {
      color: variant.color ?? null,
      colorCode: variant.colorCode ?? null,
      size: variant.size ?? null,
      price: Number(variant.price),
      stock: Number(variant.stock),
      image:
        typeof imageData === 'string' ? imageData : imageData?.[0]?.url ?? null
    };
  });
};

export const createProductWithVariants = async ({
  title,
  variantData
}: {
  title: string;
  variantData: NewVariantData[];
}) : Promise<CreateProductWithVariantsResponse> =>
  prisma.product.create({
    data: {
      title,
      variants: {
        create: variantData
      }
    },
    include: { variants: true }
  });

export const findVariant = async ({
  productId,
  color,
  size
}: {
  productId: string;
  color?: string;
  size?: string;
}) : Promise<VariantResponse | null> =>
  prisma.productVariant.findFirst({
    where: { productId, color, size }
  });

export const createVariant = async ({
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
}) : Promise<VariantResponse> =>
  prisma.productVariant.create({
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

export const findVariantById = async (variantId: string) : Promise<VariantResponse | null> =>
  prisma.productVariant.findUnique({ where: { id: variantId } });

export const findDuplicateVariant = async ({
  productId,
  color,
  size,
  excludeId
}: {
  productId: string;
  color?: string;
  size?: string;
  excludeId?: string;
}) : Promise<VariantResponse | null> =>
  prisma.productVariant.findFirst({
    where: {
      productId,
      color,
      size,
      NOT: { id: excludeId }
    }
  });

export const updateVariant = async ({
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
}) : Promise<VariantResponse | null> =>
  prisma.productVariant.update({
    where: { id: variantId },
    data: { color, colorCode, size, price, stock, image }
  });

export const softDeleteVariant = async (variantId: string) : Promise<VariantResponse | null> =>
  prisma.productVariant.update({
    where: { id: variantId },
    data: { isVariantDeleted: true }
  });
