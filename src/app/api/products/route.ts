import { getProducts } from '@/services/product';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {ProductVariantType} from '@/types/product';

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

    const product = await prisma.product.create({
      data: {
        title: body.name,
        variants: {
          create: body.variants.map((variant: ProductVariantType) => {
            // 👇 define imageData correctly using "const" and a semicolon
            const imageData = variant.image as string | { url?: string }[] | undefined;

            return {
              color: variant.color ?? null,
              size: variant.size ?? null,
              price: Number(variant.price),
              stock: Number(variant.stock),
              image:
                typeof imageData === 'string'
                  ? imageData
                  : imageData?.[0]?.url ?? null
            };
          })
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


