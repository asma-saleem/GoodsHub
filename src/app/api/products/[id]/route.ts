import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// UPDATE product
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        image: body.image,
        title: body.name,
        price: parseFloat(body.price),
        stock: parseInt(body.quantity),
        color: body.color || null,
        colorCode: body.colorCode || null,
        size: body.size || null
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
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
      data: { status: 'inactive' } 
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
