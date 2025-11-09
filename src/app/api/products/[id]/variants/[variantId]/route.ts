import { NextResponse } from 'next/server';
import {
  findVariantById,
  findDuplicateVariant,
  updateVariant,
  softDeleteVariant
} from '@/services/product';


export async function PUT(req: Request, context: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const { id, variantId } = await context.params;
    const value = await req.json();

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 });
    }
    const existingVariant = await findVariantById(variantId);
    
    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const duplicate = await findDuplicateVariant({
      productId: id,
      color: value.color,
      size: value.size,
      excludeId: variantId
    });

    if (duplicate) {
      return NextResponse.json(
        { error: 'Variant with this color and size already exists.' },
        { status: 400 }
      );
    }

    let imageUrl = '';
    if (typeof value.image === 'string') {
      imageUrl = value.image;
    } else if (Array.isArray(value.image) && value.image[0]?.url) {
      imageUrl = value.image[0].url!;
    }

    const updatedVariant = await updateVariant({
      variantId,
      color: value.color ?? existingVariant.color,
      colorCode: value.colorCode ?? existingVariant.colorCode,
      size: value.size ?? existingVariant.size,
      price: Number(value.price),
      stock: Number(value.stock),
      image: imageUrl
    });

    // if (value.name) {
    //   await prisma.product.update({ where: { id }, data: { title: value.name } });
    // }

    return NextResponse.json(
      {
        success: true,
        message: 'Variant updated successfully',
        variant: updatedVariant
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Single variant update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update single variant' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const { variantId } = await context.params;
    const existingVariant = await findVariantById(variantId);

    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

   const updatedVariant = await softDeleteVariant(variantId);

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
