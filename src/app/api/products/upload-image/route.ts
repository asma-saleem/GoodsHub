// import { NextRequest, NextResponse } from 'next/server';
// import path from 'path';
// import fs from 'fs';
// import { IncomingForm, File } from 'formidable';
// import { Readable } from 'stream';
// import { IncomingMessage } from 'http';

// export const dynamic = 'force-dynamic';

// const uploadDir = path.join(process.cwd(), 'public/uploads/home');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// function toNodeReadable(req: NextRequest): IncomingMessage {
//   if (!req.body) {
//     throw new Error('Request body is empty');
//   }
//   const webStream = req.body as unknown as import('stream/web').ReadableStream<Uint8Array>;
//   const readable = Readable.fromWeb(webStream);

//   const nodeReq = Object.assign(readable, {
//     headers: Object.fromEntries(req.headers),
//     method: req.method,
//     url: req.url
//   }) as IncomingMessage;

//   return nodeReq;
// }

// export async function POST(req: NextRequest) {
//   return new Promise<NextResponse>((resolve) => {
//     const form = new IncomingForm({
//       multiples: false,
//       uploadDir,
//       keepExtensions: true
//     });

//     const nodeReq = toNodeReadable(req);

//     form.parse(nodeReq, (err, _fields, files) => {
//       if (err) {
//         resolve(
//           NextResponse.json({ error: 'Upload failed' }, { status: 500 })
//         );
//         return;
//       }

//       const uploaded = files.file;
//       const file: File | undefined = Array.isArray(uploaded)
//         ? uploaded[0]
//         : uploaded;

//       if (!file || !file.newFilename) {
//         resolve(
//           NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
//         );
//         return;
//       }

//       const url = `/uploads/home/${file.newFilename}`;
//       resolve(NextResponse.json({ url }));
//     });
//   });
// }

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { IncomingForm, File } from 'formidable';
import { Readable } from 'stream';
import { IncomingMessage } from 'http';
import Joi from 'joi';

export const dynamic = 'force-dynamic';

const uploadDir = path.join(process.cwd(), 'public/uploads/home');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function toNodeReadable(req: NextRequest): IncomingMessage {
  if (!req.body) {
    throw new Error('Request body is empty');
  }
  console.log('req.body:', req.body);
  const webStream = req.body as unknown as import('stream/web').ReadableStream<Uint8Array>;
  const readable = Readable.fromWeb(webStream);

  const nodeReq = Object.assign(readable, {
    headers: Object.fromEntries(req.headers),
    method: req.method,
    url: req.url
  }) as IncomingMessage;

  return nodeReq;
}

const fileSchema = Joi.object({
  file: Joi.object({
    originalFilename: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().positive().required()
  }).required()
});

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

      const { error } = fileSchema.validate({ file }, { allowUnknown: true });
      if (error) {
        resolve(
          NextResponse.json({ error: 'Invalid file', details: error.details }, { status: 400 })
        );
        return;
      }

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
