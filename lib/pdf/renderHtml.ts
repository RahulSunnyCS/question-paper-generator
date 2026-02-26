import type { Paper, Question } from '../../shared/types/paper';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderQuestion = (question: Question, index: number): string => {
  const marks = question.marks === '' ? '-' : String(question.marks);

  if (question.type === 'Fill in the Blanks') {
    return `
      <article class="question">
        <div class="question-row">
          <span class="question-index">${index}.</span>
          <p class="question-text">${escapeHtml(question.text)}</p>
          <span class="marks">[${marks}]</span>
        </div>
        <p class="answer-line">_______________________________</p>
      </article>
    `;
  }

  if (question.type === 'Match the Following') {
    const rows = question.matchPairs
      .map(
        (pair, pairIndex) => `
          <li class="match-row">
            <span class="left">${String.fromCharCode(65 + pairIndex)}. ${escapeHtml(pair.left)}</span>
            <span class="right">${pairIndex + 1}. ${escapeHtml(pair.right)}</span>
          </li>
        `,
      )
      .join('');

    return `
      <article class="question">
        <div class="question-row">
          <span class="question-index">${index}.</span>
          <p class="question-text">${escapeHtml(question.text)}</p>
          <span class="marks">[${marks}]</span>
        </div>
        <ul class="match-grid">${rows}</ul>
      </article>
    `;
  }

  return `
    <article class="question">
      <div class="question-row">
        <span class="question-index">${index}.</span>
        <p class="question-text">${escapeHtml(question.text)}</p>
        <span class="marks">[${marks}]</span>
      </div>
    </article>
  `;
};

export const renderPaperHtml = (paper: Paper): string => {
  const instructionItems = paper.instructions
    .map((instruction) => `<li>${escapeHtml(instruction)}</li>`)
    .join('');

  const sections = paper.sections
    .map((section, sectionIndex) => {
      const questions = section.questions
        .map((question, questionIndex) => renderQuestion(question, questionIndex + 1))
        .join('');

      return `
        <section class="section avoid-break">
          <header class="section-header">
            <h2>Section ${sectionIndex + 1}: ${escapeHtml(section.title)}</h2>
            <p>${escapeHtml(section.instructions)}</p>
          </header>
          <div class="questions">${questions}</div>
        </section>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
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

      body {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: white;
      }

      .paper {
        display: grid;
        gap: 12px;
      }

      .paper-header {
        border-bottom: 1px solid #d1d5db;
        padding-bottom: 8px;
      }

      .paper-header h1 {
        margin: 0;
        font-size: 20px;
      }

      .meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
        margin-top: 8px;
      }

      .instructions,
      .section,
      .question,
      .match-row {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .instructions ul,
      .questions {
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }

      .instructions li {
        margin-left: 16px;
      }

      .section-header h2 {
        margin: 0 0 4px 0;
        font-size: 16px;
      }

      .section-header p {
        margin: 0;
        color: #374151;
      }

      .question-row {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 6px;
        align-items: start;
      }

      .question-index,
      .marks {
        white-space: nowrap;
      }

      .question-text {
        margin: 0;
      }

      .answer-line {
        margin: 8px 0 0 24px;
      }

      .match-grid {
        margin: 8px 0 0 24px;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 4px;
      }

      .match-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      @media print {
        html,
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
  </head>
  <body>
    <main class="paper">
      <header class="paper-header avoid-break">
        <h1>${escapeHtml(paper.paperTitle)}</h1>
        <div class="meta">
          <span><strong>Subject:</strong> ${escapeHtml(paper.subject)}</span>
          <span><strong>Duration:</strong> ${escapeHtml(paper.duration)}</span>
          <span><strong>Total Marks:</strong> ${paper.totalMarks}</span>
        </div>
      </header>

      <section class="instructions avoid-break">
        <h2>Instructions</h2>
        <ul>${instructionItems}</ul>
      </section>

      ${sections}
    </main>
  </body>
</html>
`.trim();
};
