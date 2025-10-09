import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import {ProductVariantType} from '@/types/product';

// UPDATE single product variant
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const body = (await req.json()) as {
      variantId: string;
      name: string;
      color?: string;
      size?: string;
      price: string;
      stock: string;
      image?: string | { url?: string }[];
    };

    if (!body.variantId) {
      return NextResponse.json(
        { error: 'variantId is required' },
        { status: 400 }
      );
    }

    // Find existing variant
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: body.variantId }
    });

    if (!existingVariant) {
      return NextResponse.json(
        { error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Determine image URL
    let imageUrl = '';
    if (typeof body.image === 'string') {
      imageUrl = body.image;
    } else if (Array.isArray(body.image) && body.image[0]?.url) {
      imageUrl = body.image[0].url!;
    }

    // Update variant
    const updatedVariant = await prisma.productVariant.update({
      where: { id: body.variantId },
      data: {
        color: body.color ?? existingVariant.color,
        size: body.size ?? existingVariant.size,
        price: Number(body.price),
        stock: Number(body.stock),
        image: imageUrl
      }
    });

    // Update product title if provided
    if (body.name) {
      await prisma.product.update({
        where: { id },
        data: { title: body.name }
      });
    }

    return NextResponse.json({ updatedVariant });
  } catch (error) {
    console.error('❌ Single variant update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update single variant' },
      { status: 500 }
    );
  }
}



// DELETE product
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    await prisma.product.update({
      where: { id },
      data: { isDeleted: 'inactive' } 
    });

    return NextResponse.json({ message: 'Product marked as inactive' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to deactivate product' },
      { status: 500 }
    );
  }
}
