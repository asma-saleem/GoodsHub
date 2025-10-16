import { getProducts } from '@/services/product';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductVariantType } from '@/types/product';
import Joi from 'joi';

async function createVariants(variants: ProductVariantType[]) {
  return variants.map((variant) => {
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
  });
}

const variantSchema = Joi.object({
  id: Joi.string().optional(),
  color: Joi.string().optional().allow(null, ''),
  colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().allow(null, ''),
  size: Joi.string().optional().allow(null, ''),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  image: Joi.alternatives().try(
      Joi.string().pattern(/^(\/|https?:\/\/).+\.(jpg|jpeg|png|webp)$/i, 'valid image path or URL'),
      Joi.array().items(
        Joi.object({ url: Joi.string().pattern(/^(\/|https?:\/\/).+\.(jpg|jpeg|png|webp)$/i).required() })
      )
    ).optional()
});

const productSchema = Joi.object({
  name: Joi.string().min(1).required(),
  variants: Joi.array().items(variantSchema).min(1).required()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 8);
    const query = searchParams.get('q') || ''; 
    const sortBy = searchParams.get('sortBy') || 'createdAt_desc';

    const data = await getProducts(page, limit, query, sortBy);

    return NextResponse.json({
      products: data.products || [],
      total: data.total || 0
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ products: [], total: 0, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error, value } = productSchema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json({ error: 'Invalid product data', details: error.details }, { status: 400 });
    }

    const variantData = await createVariants(value.variants);

    const product = await prisma.product.create({
      data: {
        title: value.name,
        variants: {
          create: variantData
        }
      },
      include: { variants: true }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

