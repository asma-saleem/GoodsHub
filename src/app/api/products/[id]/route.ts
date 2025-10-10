import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    if (!body?.name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { title: body.name },
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
