import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductVariantType } from '@/types/product';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const value = (await req.json()) as ProductVariantType;
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        productId: id,
        size: value.size,
        color: value.color
      }
    });

    if (existingVariant) {
      return NextResponse.json(
        { error: 'Variant with this size and color already exists' },
        { status: 400 }
      );
    }

    let imageUrl = '';
    if (typeof value.image === 'string') {
      imageUrl = value.image;
    } else if (Array.isArray(value.image)) {
      const firstImage = value.image[0] as { url?: string } | undefined;
      if (firstImage?.url) {
        imageUrl = firstImage.url;
      }
    }

    const newVariant = await prisma.productVariant.create({
      data: {
        productId: id,
        color: value.color ?? null,
        colorCode: value.colorCode ?? null,
        size: value.size ?? null,
        price: Number(value.price),
        stock: Number(value.stock),
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

