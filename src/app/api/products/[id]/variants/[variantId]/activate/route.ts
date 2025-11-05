import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const { variantId } = await context.params;

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    if (!variant.isVariantDeleted) {
      return NextResponse.json(
        { message: 'Variant is already active' },
        { status: 200 }
      );
    }

    const reactivatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { isVariantDeleted: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Variant reactivated successfully',
      variant: reactivatedVariant
    });
  } catch (error) {
    console.error('Failed to reactivate variant:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate variant' },
      { status: 500 }
    );
  }
}
