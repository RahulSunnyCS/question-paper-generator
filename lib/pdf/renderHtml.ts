import type { Paper, Question } from '../../shared/types/paper';

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderAnswerLines = (lines: number = 4): string =>
  `<div class="qp-answer-lines" aria-hidden="true">${Array.from({ length: lines })
    .map(() => `<div class="qp-answer-line"></div>`)
    .join('')}</div>`;

const renderFillInTheBlanks = (question: Question): string => {
  const minBlanks = 1;
  const inferredBlanks = Math.max(
    minBlanks,
    Math.ceil((question.blankAnswer?.trim().length ?? 12) / 12),
  );
  const count = Math.min(inferredBlanks, 2);
  const spans = Array.from({ length: count })
    .map(() => `<span class="qp-blank-line"></span>`)
    .join('');
  return `<div class="qp-fill-blanks" aria-hidden="true">${spans}</div>`;
};

const renderMatchTheFollowing = (question: Question): string => {
  const columnA = question.matchPairs
    .map(
      (pair, index) =>
        `<div class="qp-match-row"><span class="qp-match-index">${index + 1}.</span><span>${escapeHtml(pair.left)}</span></div>`,
    )
    .join('');
  const columnB = question.matchPairs
    .map(
      (pair, index) =>
        `<div class="qp-match-row"><span class="qp-match-index">${String.fromCharCode(65 + index)}.</span><span>${escapeHtml(pair.right)}</span></div>`,
    )
    .join('');
  return `<div class="qp-match-block print-avoid-break">
    <div class="qp-match-column">
      <p class="qp-match-title">Column A</p>
      <div class="qp-match-rows">${columnA}</div>
    </div>
    <div class="qp-match-column">
      <p class="qp-match-title">Column B</p>
      <div class="qp-match-rows">${columnB}</div>
    </div>
  </div>`;
};

const renderQuestionContent = (question: Question): string => {
  if (question.type === 'Fill in the Blanks') {
    return renderFillInTheBlanks(question);
  }
  if (question.type === 'Match the Following') {
    return renderMatchTheFollowing(question);
  }
  return renderAnswerLines(4);
};

const renderSections = (paper: Paper): string =>
  paper.sections
    .map((section, sectionIndex) => {
      const totalSectionMarks = section.questions.reduce(
        (sum, question) => sum + (typeof question.marks === 'number' ? question.marks : 0),
        0,
      );

      const questions = section.questions
        .map((question, questionIndex) => {
          const parts = question.text
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean);

          const stem = parts[0] ?? question.text;
          const subparts = parts.slice(1);

          const subpartsHtml =
            subparts.length > 0
              ? `<div class="qp-subparts">${subparts
                  .map(
                    (part, index) =>
                      `<div class="qp-subpart"><span class="qp-subpart-label">${String.fromCharCode(65 + index)})</span><span>${escapeHtml(part)}</span></div>`,
                  )
                  .join('')}</div>`
              : '';

          return `<div class="qp-question print-avoid-break">
          <div class="qp-question-row">
            <div>
              <div class="qp-question-main">
                <span class="qp-question-number">${questionIndex + 1}.</span>
                <p class="qp-question-text">${escapeHtml(stem)}</p>
              </div>
              ${subpartsHtml}
              ${renderQuestionContent(question)}
            </div>
            <p class="qp-marks">[${question.marks || 0}]</p>
          </div>
        </div>`;
        })
        .join('');

      const sectionInstructionsHtml = section.instructions
        ? `<p class="qp-question-text">${escapeHtml(section.instructions)}</p>`
        : '';

      return `<section class="qp-section print-avoid-break">
        <div class="qp-section-title-row">
          <h3 class="qp-section-title">Section ${String.fromCharCode(65 + sectionIndex)}: ${escapeHtml(section.title)}</h3>
          <p class="qp-marks">[${totalSectionMarks}]</p>
        </div>
        ${sectionInstructionsHtml}
        <div class="qp-questions">${questions}</div>
      </section>`;
    })
    .join('');

const renderInstructions = (instructions: string[]): string =>
  instructions.map((instruction) => `<li>${escapeHtml(instruction)}</li>`).join('');

const CSS = `
  :root {
    --qp-font-base: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
    --qp-text-base: 12pt;
    --qp-text-meta: 10.5pt;
    --qp-text-section: 14pt;
    --qp-text-title: 16pt;
    --qp-space-1: 8px;
    --qp-space-2: 16px;
    --qp-space-3: 24px;
    --qp-rule: #222;
  }

  .qp-paper {
    max-width: 210mm;
    margin: 0 auto;
    padding: 20mm;
    box-sizing: border-box;
    color: #111;
    background: #fff;
    font-family: var(--qp-font-base);
    font-size: var(--qp-text-base);
    line-height: 1.45;
    counter-reset: page;
  }

  .print-avoid-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .qp-header {
    display: grid;
    gap: var(--qp-space-2);
    padding-bottom: var(--qp-space-2);
    border-bottom: 1px solid var(--qp-rule);
  }

  .qp-header-top {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: start;
    gap: var(--qp-space-1);
  }

  .qp-page-no {
    text-transform: uppercase;
    font-size: var(--qp-text-meta);
    letter-spacing: 0.04em;
    justify-self: start;
  }

  .qp-board-name {
    justify-self: center;
    font-size: var(--qp-text-section);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .qp-title {
    justify-self: center;
    font-size: var(--qp-text-title);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: center;
    margin: var(--qp-space-1) 0 0;
  }

  .qp-meta-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--qp-space-1);
  }

  .qp-meta-box {
    border: 1px solid #333;
    min-height: 54px;
    padding: 6px 8px;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 4px;
  }

  .qp-label {
    font-size: var(--qp-text-meta);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
  }

  .qp-value-line {
    border-bottom: 1px solid #555;
    min-height: 16px;
    width: 100%;
  }

  .qp-meta-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--qp-space-2);
    align-items: end;
  }

  .qp-info-block,
  .qp-instructions {
    margin-top: var(--qp-space-2);
    padding: var(--qp-space-2);
    border: 1px solid #333;
  }

  .qp-block-title {
    margin: 0;
    font-size: var(--qp-text-section);
    font-weight: 700;
    text-transform: uppercase;
  }

  .qp-instructions-list {
    margin: var(--qp-space-1) 0 0;
    padding-left: 22px;
    display: grid;
    gap: 4px;
  }

  .qp-sections {
    margin-top: var(--qp-space-3);
    display: grid;
    gap: var(--qp-space-3);
  }

  .qp-section {
    display: grid;
    gap: var(--qp-space-2);
  }

  .qp-section-title-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--qp-space-1);
    align-items: end;
    border-bottom: 1px solid #333;
    padding-bottom: var(--qp-space-1);
  }

  .qp-section-title {
    margin: 0;
    font-size: var(--qp-text-section);
    font-weight: 700;
    text-transform: uppercase;
  }

  .qp-marks {
    font-weight: 700;
    white-space: nowrap;
    text-align: right;
  }

  .qp-questions {
    display: grid;
    gap: var(--qp-space-2);
  }

  .qp-question {
    display: grid;
    gap: var(--qp-space-1);
  }

  .qp-question-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--qp-space-2);
    align-items: start;
  }

  .qp-question-main {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--qp-space-1);
    align-items: start;
  }

  .qp-question-number {
    font-weight: 700;
  }

  .qp-question-text {
    margin: 0;
  }

  .qp-subparts {
    margin-top: var(--qp-space-1);
    margin-left: 20px;
    display: grid;
    gap: 4px;
  }

  .qp-subpart {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--qp-space-1);
  }

  .qp-subpart-label {
    font-weight: 700;
  }

  .qp-fill-blanks {
    margin-top: var(--qp-space-1);
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .qp-blank-line {
    display: inline-block;
    width: 140px;
    border-bottom: 1px solid #444;
    min-height: 1em;
  }

  .qp-match-block {
    margin-top: var(--qp-space-1);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--qp-space-2);
  }

  .qp-match-title {
    margin: 0;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 11pt;
  }

  .qp-match-rows {
    margin-top: var(--qp-space-1);
    display: grid;
    gap: var(--qp-space-1);
  }

  .qp-match-row {
    display: grid;
    grid-template-columns: 24px 1fr;
    gap: var(--qp-space-1);
    min-height: 24px;
    align-items: start;
  }

  .qp-match-index {
    font-weight: 700;
  }

  .qp-answer-lines {
    margin-top: var(--qp-space-1);
    display: grid;
    gap: var(--qp-space-1);
  }

  .qp-answer-line {
    border-bottom: 1px solid #666;
    min-height: 20px;
  }

  .qp-footer {
    margin-top: var(--qp-space-3);
    text-align: right;
    font-size: var(--qp-text-meta);
    text-transform: uppercase;
  }

  @media print {
    @page {
      size: A4;
      margin: 20mm;
    }

    .qp-paper {
      margin: 0;
      padding: 0;
      max-width: none;
    }

    .qp-footer {
      position: fixed;
      right: 0;
      bottom: 0;
    }

    .qp-footer::after {
      content: 'Page ' counter(page) ' of ' counter(pages);
    }
  }
`;

export const renderPaperHtml = (paper: Paper): string => {
  const body = `<article class="qp-paper">
    <header class="qp-header print-avoid-break">
      <div class="qp-header-top">
        <p class="qp-page-no">Page 1</p>
        <div>
          <p class="qp-board-name">Cambridge Primary</p>
          <h1 class="qp-title">${escapeHtml(paper.paperTitle)}</h1>
        </div>
        <div></div>
      </div>

      <div class="qp-meta-grid">
        <div class="qp-meta-box"><span class="qp-label">Name</span><span class="qp-value-line"></span></div>
        <div class="qp-meta-box"><span class="qp-label">Centre Number</span><span class="qp-value-line"></span></div>
        <div class="qp-meta-box"><span class="qp-label">Candidate Number</span><span class="qp-value-line"></span></div>
        <div class="qp-meta-box"><span class="qp-label">Grade</span><span class="qp-value-line"></span></div>
        <div class="qp-meta-box"><span class="qp-label">Date</span><span class="qp-value-line"></span></div>
      </div>

      <div class="qp-meta-row">
        <p><span class="qp-label">Subject:</span> ${escapeHtml(paper.subject)}</p>
        <p><span class="qp-label">Duration:</span> ${escapeHtml(paper.duration)} &nbsp;|&nbsp; <span class="qp-label">Total Marks:</span> ${paper.totalMarks}</p>
      </div>
    </header>

    <section class="qp-info-block print-avoid-break">
      <h2 class="qp-block-title">Information</h2>
      <p>Answer all questions. Write clearly in the spaces provided. Marks for each question are shown in brackets at the right.</p>
    </section>

    <section class="qp-instructions print-avoid-break">
      <h2 class="qp-block-title">Instructions</h2>
      <ul class="qp-instructions-list">${renderInstructions(paper.instructions)}</ul>
    </section>

    <div class="qp-sections">${renderSections(paper)}</div>

    <footer class="qp-footer" aria-hidden="true"></footer>
  </article>`;

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
        font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif;
        color: #111827;
        font-size: 12px;
        line-height: 1.5;
      }
      ${CSS}
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`.trim();
};
