import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Joi from 'joi';

const updateProductSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(1).required()
});

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { error, value } = updateProductSchema.validate(body, { abortEarly: false });
    if (error) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.details },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { title: value.name },
      include: { variants: true }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Failed to update product title:', error);
    return NextResponse.json(
      { error: 'Failed to update product title' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.product.update({
      where: { id },
      data: { isProductDeleted: true } 
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
