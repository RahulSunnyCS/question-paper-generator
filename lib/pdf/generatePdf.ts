import type { Paper } from '../../shared/types/paper';
import { getBrowser } from './browserManager';

const A4_VIEWPORT = {
  width: 794,
  height: 1123,
};

export const generatePdf = async (paper: Paper): Promise<Buffer> => {
  const browser = await getBrowser();
  const page = await browser.newPage({
    viewport: A4_VIEWPORT,
    deviceScaleFactor: 1,
  });

  try {
    await page.emulateMedia({ media: 'print' });
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
          caret-color: transparent !important;
        }
      `,
    });

    const { renderPaperHtml } = await import('./renderHtml');
    const html = renderPaperHtml(paper);

    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 15_000,
    });

    await page.evaluate(async () => {
      if ('fonts' in document) {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      }
    });

    return Buffer.from(
      await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        preferCSSPageSize: true,
      }),
    );
  } finally {
    await page.close({ runBeforeUnload: false });
  }
};
