import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import Joi from 'joi';
import { parse } from 'csv-parse/sync';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'CSV file required' }, { status: 400 });

    const text = await file.text();

    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    const schema = Joi.object({
      title: Joi.string().required(),
      image: Joi.string().pattern(/\.(png|jpg|jpeg)$/i).required(),
      price: Joi.number().positive().required(),
      stock: Joi.number().min(0).required(),
      color: Joi.string().required(),
      colorCode: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
      size: Joi.string().required()
    });

    const errors: string[] = [];
    records.forEach((row, idx: number) => {
      const { error } = schema.validate(row, { abortEarly: false });
      if (error) {
        error.details.forEach((d) => errors.push(`Row ${idx + 2}: ${d.message}`)); 
      }
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const forwardData = new FormData();
    forwardData.append('file', file);

    const fastApiRes = await fetch('http://localhost:8000/upload-csv/', {
      method: 'POST',
      body: forwardData
    });

    const data = await fastApiRes.json();

    if (!fastApiRes.ok) {
      return NextResponse.json({ error: data.error || 'FastAPI call failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data.message || 'CSV uploaded successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
