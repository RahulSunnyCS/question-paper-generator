import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server.node';
import { QuestionPaperPrintLayout } from '../../src/components/QuestionPaperPrintLayout';
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
