import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductVariantType } from '@/types/product';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as ProductVariantType;

    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: id,
        size: body.size,
        color: body.color
      }
    });

    if (existingVariant) {
    return NextResponse.json(
      { error: 'Variant with this size and color already exists' },
      { status: 400 }
    );
    }


    let imageUrl = '';

    if (typeof body.image === 'string') {
      imageUrl = body.image;
    } else if (Array.isArray(body.image)) {
      const firstImage = body.image[0] as { url?: string } | undefined;
      if (firstImage?.url) {
        imageUrl = firstImage.url;
      }
    }
    const newVariant = await prisma.productVariant.create({
      data: {
        productId: id,
        color: body.color ?? null,
        colorCode: body.colorCode ?? null,
        size: body.size ?? null,
        price: Number(body.price),
        stock: Number(body.stock),
        image: imageUrl || null
      }
    });

    return NextResponse.json(newVariant);
  } catch (error) {
    console.error('Failed to add variant:', error);
    return NextResponse.json(
      { error: 'Failed to add variant' },
      { status: 500 }
    );
  }
}
