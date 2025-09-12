import { NextResponse } from 'next/server';
import { getProducts } from '@/services/productService';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
