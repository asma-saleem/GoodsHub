import { getProducts } from '@/services/product';
import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// const prisma = new PrismaClient();

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

