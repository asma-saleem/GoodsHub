import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync'; 
import { prisma } from '@/lib/prisma';

interface CsvProduct {
  image: string;
  title: string;
  price: string;  // CSV se string
  color: string;
  colorCode: string;
  stock: string;  // CSV se string
  size: string;
}

export async function POST(req: NextRequest) {
  try {
    const { fileUrl } = await req.json();

    const filePath = path.join(process.cwd(), 'public', fileUrl);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 400 });
    }

    // ✅ read & parse CSV
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    }) as CsvProduct[];

    // ✅ Bulk Insert (faster)
    await prisma.product.createMany({
      data: records.map((record) => ({
        image: record.image,
        title: record.title,
        price: parseFloat(record.price),    // 👈 number me convert
        color: record.color,
        colorCode: record.colorCode,
        stock: parseInt(record.stock, 10),  // 👈 number me convert
        size: record.size
      }))
    });

    return NextResponse.json({ message: 'Products uploaded successfully!' });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 }); // 👈 debug ke liye
  }
}
