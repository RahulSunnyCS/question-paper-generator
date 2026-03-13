import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { generatePdf } from '../../../lib/pdf/generatePdf';
import type { Paper } from '../../../shared/types/paper';

const isPaperPayload = (value: unknown): value is Paper => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const paper = value as Partial<Paper>;

  return (
    typeof paper.paperTitle === 'string' &&
    typeof paper.subject === 'string' &&
    typeof paper.duration === 'string' &&
    typeof paper.totalMarks === 'number' &&
    Array.isArray(paper.instructions) &&
    Array.isArray(paper.sections)
  );
};

const MAX_HEADER_SIZE = 2 * 1024 * 1024; // 2MB

async function mergePdfs(headerBytes: Uint8Array, paperBytes: Uint8Array): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  const headerDoc = await PDFDocument.load(headerBytes);
  const paperDoc = await PDFDocument.load(paperBytes);

  const headerPages = await merged.copyPages(headerDoc, headerDoc.getPageIndices());
  headerPages.forEach((page) => merged.addPage(page));

  const paperPages = await merged.copyPages(paperDoc, paperDoc.getPageIndices());
  paperPages.forEach((page) => merged.addPage(page));

  return merged.save();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') ?? '';

    let payload: unknown;
    let headerPdfBytes: Uint8Array | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      const paperField = formData.get('paper');
      if (typeof paperField !== 'string') {
        return NextResponse.json({ error: 'Invalid paper payload.' }, { status: 400 });
      }
      payload = JSON.parse(paperField);

      const headerFile = formData.get('headerPdf');
      if (headerFile instanceof Blob) {
        if (headerFile.size > MAX_HEADER_SIZE) {
          return NextResponse.json(
            { error: 'Header PDF exceeds the 2 MB size limit.' },
            { status: 400 },
          );
        }
        headerPdfBytes = new Uint8Array(await headerFile.arrayBuffer());
      }
    } else {
      payload = await request.json();
    }

    if (!isPaperPayload(payload)) {
      return NextResponse.json({ error: 'Invalid paper payload.' }, { status: 400 });
    }

    console.info('[pdf] Generating PDF for paper:', payload.paperTitle);

    const paperBuffer = await generatePdf(payload);
    const paperBytes = new Uint8Array(paperBuffer);

    const finalBytes =
      headerPdfBytes !== null ? await mergePdfs(headerPdfBytes, paperBytes) : paperBytes;

    const pdfBlob = new Blob([finalBytes], { type: 'application/pdf' });

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(payload.paperTitle)}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[pdf] PDF generation failed.', error);

    return NextResponse.json({ error: 'Unable to generate PDF right now.' }, { status: 500 });
  }
}
