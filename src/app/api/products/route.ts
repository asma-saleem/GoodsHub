import { getProducts } from '@/services/product';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    return NextResponse.json({ products: [], total: 0, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const ids = body.ids || [];

    if(!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids }},
      select: { id: true, stock: true, title: true }
    });
    
    return NextResponse.json(products);
  } catch(error) {
    console.error(error);
    return NextResponse.json(
      {error: 'Failed to fetch stock'},
      {status: 500}
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
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
    console.log(error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

