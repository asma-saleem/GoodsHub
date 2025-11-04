import { getProducts } from '@/services/product';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductVariantType } from '@/types/product';

async function createVariants(variants: ProductVariantType[]) {
  const seen = new Set<string>(); // track unique color-size combinations

  return variants
    .map((variant) => {
      const color = variant.color?.trim().toLowerCase() || '';
      const size = variant.size?.trim().toLowerCase() || '';
      const key = `${color}-${size}`;

      // agar duplicate mila to skip karo
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
    // null (duplicates) ko filter karo
    .filter((v) => v !== null);
}

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

    const existingProduct = await prisma.product.findFirst({
      where: { title: body.name.trim() }
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this title already exists' },
        { status: 400 }
      );
    }

    const variantData = await createVariants(body.variants);

    await prisma.product.create({
      data: {
        title: body.name,
        variants: {
          create: variantData
        }
      },
      include: { variants: true }
    });

    return NextResponse.json(
      { success: true,  message: 'Product created successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Product creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

