import { NextResponse } from 'next/server';
import { ProductVariantType } from '@/types/product';
import {
  findVariant,
  createVariant
} from '@/services/product';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const value = (await req.json()) as ProductVariantType;
    const existingVariant = await findVariant({ productId: id, color: value.color, size: value.size });

    if (existingVariant && !existingVariant.isVariantDeleted) {
      return NextResponse.json(
        { error: 'Variant with this size and color already exists' },
        { status: 400 }
      );
    }

    if (existingVariant && existingVariant.isVariantDeleted) {
      return NextResponse.json(
        {
          inactiveVariant: existingVariant,
          message: 'An inactive variant with same size and color exists. Reactivate it?'
        },
        { status: 409 }
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

    const newVariant = await createVariant({
      productId: id,
      color: value.color,
      colorCode: value.colorCode,
      size: value.size,
      price: Number(value.price),
      stock: Number(value.stock),
      image: imageUrl
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

