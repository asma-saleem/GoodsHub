import { NextResponse } from 'next/server';
import {
  findProductByTitleExcludingId,
  updateProductTitle,
  softDeleteProduct
} from '@/services/product';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const value = await req.json();

    const existingProduct = await findProductByTitleExcludingId({
      title: value.name,
      id
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this title already exists' },
        { status: 400 }
      );
    }

    const updatedProduct = await updateProductTitle({
      id,
      data: { title: value.name }
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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await softDeleteProduct({ id });

    return NextResponse.json({ message: 'Product marked as inactive' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to deactivate product' },
      { status: 500 }
    );
  }
}
