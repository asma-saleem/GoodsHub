import { getProducts } from '@/services/product';
import { NextResponse } from 'next/server';
import {
  findProductByTitle,
  createVariants,
  createProductWithVariants
} from '@/services/product';

export async function GET(req: Request) {
  
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 8);
    const query = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt_desc';

    const data = await getProducts(page, limit, query, sortBy);

    return NextResponse.json({
      products: data.products || [],
      total: data.total || 0
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { products: [], total: 0, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  
  try {
    const body = await req.json();

    const existingProduct = await findProductByTitle({ title: body.name });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this title already exists' },
        { status: 400 }
      );
    }

    const variantData = await createVariants(body.variants);

    await createProductWithVariants({ title: body.name, variantData });

    return NextResponse.json(
      { success: true, message: 'Product created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation failed:', error);
    
    if (error instanceof Error && error.message.includes('Duplicate variant')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
