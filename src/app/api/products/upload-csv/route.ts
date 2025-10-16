import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync'; 
import { prisma } from '@/lib/prisma';

interface CsvProduct {
  image: string;
  title: string;
  price: string; 
  color: string;
  colorCode: string;
  stock: string; 
  size: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();
    const filePath = path.join(process.cwd(), 'public', fileUrl);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 400 });
    }

    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true }) as CsvProduct[];

    const productMap = new Map<string, CsvProduct[]>();
    records.forEach((record) => {
      if (!productMap.has(record.title)) productMap.set(record.title, []);
      productMap.get(record.title)!.push(record);
    });

    for (const [title, variants] of productMap.entries()) {

      const product = await prisma.product.create({
        data: { title }
      });

      await delay(200);

      const variantsData = variants.map((v) => ({
        productId: product.id,
        color: v.color || null,
        colorCode: v.colorCode || null,
        size: v.size || null,
        image: v.image || null,
        price: parseFloat(v.price),
        stock: parseInt(v.stock, 10)
      }));
      await prisma.productVariant.createMany({
        data: variantsData
      });
    }

    return NextResponse.json({ message: 'Products with variants uploaded successfully!' });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 }); 
  }
}
