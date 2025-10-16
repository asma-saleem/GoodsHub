import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Joi from 'joi';

const updateVariantSchema = Joi.object({
  id: Joi.string().optional(),
  variantId: Joi.string().optional(),
  color: Joi.string().optional().allow(null, ''),
  colorCode: Joi.string()
    .pattern(/^#([0-9A-Fa-f]{6})$/)
    .required()
    .messages({
      'string.empty': 'Color code is required',
      'string.pattern.base': 'Invalid color code format'
    }),
  size: Joi.string().optional().allow(null, ''),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  image: Joi.string()
    .allow('', null)
    .pattern(/^(https?:\/\/|\/|[a-zA-Z0-9_\-]+\.(jpg|jpeg|png|webp))/, 'valid image path')
    .messages({
      'string.pattern.name': 'Please provide a valid image URL or path'
    }),
  name: Joi.string().optional().allow(null, '')
});

const deleteVariantSchema = Joi.object({
  id: Joi.string().optional(),
  variantId: Joi.string().uuid().optional()
});

export async function PUT(req: Request, context: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const { id, variantId } = await context.params;
    const body = await req.json();

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 });
    }
    const { error, value } = updateVariantSchema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json({ error: 'Invalid input', details: error.details }, { status: 400 });
    }
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    let imageUrl = '';
    if (typeof value.image === 'string') {
      imageUrl = value.image;
    } else if (Array.isArray(value.image) && value.image[0]?.url) {
      imageUrl = value.image[0].url!;
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        color: value.color ?? existingVariant.color,
        colorCode: value.colorCode ?? existingVariant.colorCode,
        size: value.size ?? existingVariant.size,
        price: Number(value.price),
        stock: Number(value.stock),
        image: imageUrl || existingVariant.image
      }
    });

    if (value.name) {
      await prisma.product.update({ where: { id }, data: { title: value.name } });
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

export async function DELETE(req: Request, context: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const { variantId } = await context.params;
    const { error } = deleteVariantSchema.validate({ variantId });
    if (error) {
      return NextResponse.json({ error: 'Invalid variantId', details: error.details }, { status: 400 });
    }

    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!existingVariant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { isVariantDeleted: true}
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
