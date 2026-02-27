import { Paper, Question } from '../types/paper';

interface QuestionPaperPrintLayoutProps {
  paper: Paper;
}

interface AnswerLinesProps {
  lines?: number;
}

const AnswerLines = ({ lines = 4 }: AnswerLinesProps) => (
  <div className="qp-answer-lines" aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="qp-answer-line" />
    ))}
  </div>
);

const renderFillInTheBlank = (question: Question) => {
  const minBlanks = 1;
  const inferredBlanks = Math.max(minBlanks, Math.ceil((question.blankAnswer?.trim().length ?? 12) / 12));

  return (
    <div className="qp-fill-blanks" aria-hidden="true">
      {Array.from({ length: Math.min(inferredBlanks, 2) }).map((_, index) => (
        <span key={index} className="qp-blank-line" />
      ))}
    </div>
  );
};

const renderMatchTheFollowing = (question: Question) => (
  <div className="qp-match-block print-avoid-break">
    <div className="qp-match-column">
      <p className="qp-match-title">Column A</p>
      <div className="qp-match-rows">
        {question.matchPairs.map((pair, index) => (
          <div key={pair.id} className="qp-match-row">
            <span className="qp-match-index">{index + 1}.</span>
            <span>{pair.left}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="qp-match-column">
      <p className="qp-match-title">Column B</p>
      <div className="qp-match-rows">
        {question.matchPairs.map((pair, index) => (
          <div key={pair.id} className="qp-match-row">
            <span className="qp-match-index">{String.fromCharCode(65 + index)}.</span>
            <span>{pair.right}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const renderQuestionContent = (question: Question) => {
  if (question.type === 'Fill in the Blanks') {
    return renderFillInTheBlank(question);
  }

  if (question.type === 'Match the Following') {
    return renderMatchTheFollowing(question);
  }

  return <AnswerLines lines={4} />;
};

export const QuestionPaperPrintLayout = ({ paper }: QuestionPaperPrintLayoutProps) => {
  return (
    <article className="qp-paper">
      <style>{`
        :root {
          --qp-font-serif: 'Times New Roman', Times, 'Liberation Serif', serif;
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
          font-family: var(--qp-font-serif);
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
      `}</style>

      <header className="qp-header print-avoid-break">
        <div className="qp-header-top">
          <p className="qp-page-no">Page 1</p>
          <div>
            <p className="qp-board-name">Cambridge Primary</p>
            <h1 className="qp-title">{paper.paperTitle}</h1>
          </div>
          <div />
        </div>

        <div className="qp-meta-grid">
          <div className="qp-meta-box">
            <span className="qp-label">Name</span>
            <span className="qp-value-line" />
          </div>
          <div className="qp-meta-box">
            <span className="qp-label">Centre Number</span>
            <span className="qp-value-line" />
          </div>
          <div className="qp-meta-box">
            <span className="qp-label">Candidate Number</span>
            <span className="qp-value-line" />
          </div>
          <div className="qp-meta-box">
            <span className="qp-label">Grade</span>
            <span className="qp-value-line" />
          </div>
          <div className="qp-meta-box">
            <span className="qp-label">Date</span>
            <span className="qp-value-line" />
          </div>
        </div>

        <div className="qp-meta-row">
          <p><span className="qp-label">Subject:</span> {paper.subject}</p>
          <p>
            <span className="qp-label">Duration:</span> {paper.duration} &nbsp;|&nbsp; <span className="qp-label">Total Marks:</span> {paper.totalMarks}
          </p>
        </div>
      </header>

      <section className="qp-info-block print-avoid-break">
        <h2 className="qp-block-title">Information</h2>
        <p>
          Answer all questions. Write clearly in the spaces provided. Marks for each question are shown in brackets at the right.
        </p>
      </section>

      <section className="qp-instructions print-avoid-break">
        <h2 className="qp-block-title">Instructions</h2>
        <ul className="qp-instructions-list">
          {paper.instructions.map((instruction, index) => (
            <li key={`${instruction}-${index}`}>{instruction}</li>
          ))}
        </ul>
      </section>

      <div className="qp-sections">
        {paper.sections.map((section, sectionIndex) => {
          const totalSectionMarks = section.questions.reduce(
            (sum, question) => sum + (typeof question.marks === 'number' ? question.marks : 0),
            0,
          );

          return (
            <section key={section.id} className="qp-section print-avoid-break">
              <div className="qp-section-title-row">
                <h3 className="qp-section-title">Section {String.fromCharCode(65 + sectionIndex)}: {section.title}</h3>
                <p className="qp-marks">[{totalSectionMarks}]</p>
              </div>

              {section.instructions && <p className="qp-question-text">{section.instructions}</p>}

              <div className="qp-questions">
                {section.questions.map((question, questionIndex) => {
                  const parts = question.text
                    .split(/\n+/)
                    .map((line) => line.trim())
                    .filter(Boolean);

                  const stem = parts[0] ?? question.text;
                  const subparts = parts.slice(1);

                  return (
                    <div key={question.id} className="qp-question print-avoid-break">
                      <div className="qp-question-row">
                        <div>
                          <div className="qp-question-main">
                            <span className="qp-question-number">{questionIndex + 1}.</span>
                            <p className="qp-question-text">{stem}</p>
                          </div>

                          {subparts.length > 0 && (
                            <div className="qp-subparts">
                              {subparts.map((part, index) => (
                                <div key={`${question.id}-subpart-${index}`} className="qp-subpart">
                                  <span className="qp-subpart-label">{String.fromCharCode(65 + index)})</span>
                                  <span>{part}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {renderQuestionContent(question)}
                        </div>
                        <p className="qp-marks">[{question.marks || 0}]</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="qp-footer" aria-hidden="true" />
    </article>
  );
};

export { AnswerLines };
