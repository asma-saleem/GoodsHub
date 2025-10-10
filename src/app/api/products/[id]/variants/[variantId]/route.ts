import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const { id, variantId } = params;
    const body = await req.json();

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 });
    }
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    let imageUrl = '';
    if (typeof body.image === 'string') {
      imageUrl = body.image;
    } else if (Array.isArray(body.image) && body.image[0]?.url) {
      imageUrl = body.image[0].url!;
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        color: body.color ?? existingVariant.color,
        colorCode: body.colorCode ?? existingVariant.colorCode,
        size: body.size ?? existingVariant.size,
        price: Number(body.price),
        stock: Number(body.stock),
        image: imageUrl || existingVariant.image
      }
    });

    if (body.name) {
      await prisma.product.update({
        where: { id },
        data: { title: body.name }
      });
    }

    return NextResponse.json({ updatedVariant });
  } catch (error) {
    console.error('Single variant update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update single variant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; variantId: string } }
) {
  try {
    const { variantId } = params;

    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { availabilityStatus: 'OUT_OF_STOCK' }
    });

    return NextResponse.json({
      message: 'Variant marked as inactive',
      variant: updatedVariant
    });
  } catch (error) {
    console.error('Failed to soft delete variant:', error);
    return NextResponse.json(
      { error: 'Failed to delete variant' },
      { status: 500 }
    );
  }
}
