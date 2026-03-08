// Use require() to avoid Next.js App Router's static-analysis ban on
// react-dom/server imports in the server-component module graph.
// This is an API route (not a Server Component), so the restriction is a
// false positive — the code is identical at runtime.
/* eslint-disable @typescript-eslint/no-require-imports */
const { createElement } = require('react') as typeof import('react');
const { renderToStaticMarkup } = require('react-dom/server') as typeof import('react-dom/server');
const { QuestionPaperPrintLayout } = require('../../src/components/QuestionPaperPrintLayout') as typeof import('../../src/components/QuestionPaperPrintLayout');
/* eslint-enable @typescript-eslint/no-require-imports */
import type { Paper } from '../../shared/types/paper';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const renderPaperHtml = (paper: Paper): string => {
  const body = renderToStaticMarkup(createElement(QuestionPaperPrintLayout, { paper }));

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(paper.paperTitle)}</title>
    <style>
      @page {
        size: A4;
        margin: 20mm;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        font-family: Inter, Arial, Helvetica, sans-serif;
        color: #111827;
        font-size: 12px;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`.trim();
};
