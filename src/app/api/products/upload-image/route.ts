import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { IncomingForm, File } from 'formidable';
import { Readable } from 'stream';
import { IncomingMessage } from 'http';

export const dynamic = 'force-dynamic';

// uploads dir
const uploadDir = path.join(process.cwd(), 'public/uploads/home');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// safe conversion helper
function toNodeReadable(req: NextRequest): IncomingMessage {
  if (!req.body) {
    throw new Error('Request body is empty');
  }

  // convert DOM stream → unknown → Node stream
  const webStream = req.body as unknown as import('stream/web').ReadableStream<Uint8Array>;
  const readable = Readable.fromWeb(webStream);

  const nodeReq = Object.assign(readable, {
    headers: Object.fromEntries(req.headers),
    method: req.method,
    url: req.url
  }) as IncomingMessage;

  return nodeReq;
}

export async function POST(req: NextRequest) {
  return new Promise<NextResponse>((resolve) => {
    const form = new IncomingForm({
      multiples: false,
      uploadDir,
      keepExtensions: true
    });

    const nodeReq = toNodeReadable(req);

    form.parse(nodeReq, (err, _fields, files) => {
      if (err) {
        resolve(
          NextResponse.json({ error: 'Upload failed' }, { status: 500 })
        );
        return;
      }

      const uploaded = files.file;
      const file: File | undefined = Array.isArray(uploaded)
        ? uploaded[0]
        : uploaded;

      if (!file || !file.newFilename) {
        resolve(
          NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        );
        return;
      }

      const url = `/uploads/home/${file.newFilename}`;
      resolve(NextResponse.json({ url }));
    });
  });
}
