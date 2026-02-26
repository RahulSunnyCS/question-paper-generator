import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload: unknown = await request.json();

    if (!isPaperPayload(payload)) {
      return NextResponse.json(
        { error: 'Invalid paper payload.' },
        { status: 400 },
      );
    }

    console.info('[pdf] Generating PDF for paper:', payload.paperTitle);

    const pdfBuffer = await generatePdf(payload);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(payload.paperTitle)}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[pdf] PDF generation failed.', error);

    return NextResponse.json(
      { error: 'Unable to generate PDF right now.' },
      { status: 500 },
    );
  }
}
