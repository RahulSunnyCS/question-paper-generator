import { Paper, Question } from '../types/paper';

interface QuestionPaperPrintLayoutProps {
  paper: Paper;
}

interface AnswerLinesProps {
  lines?: number;
}

const AnswerLines = ({ lines = 3 }: AnswerLinesProps) => (
  <div className="mt-3 grid gap-2" aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="h-5 border-b border-slate-400" />
    ))}
  </div>
);

const renderFillInTheBlank = (question: Question) => {
  const placeholderCount = Math.max(8, question.blankAnswer?.trim().length ?? 8);

  return (
    <p className="mt-1 text-sm leading-6 text-slate-900">
      <span className="inline-block min-w-24 border-b border-slate-500 align-baseline">
        {'_'.repeat(Math.min(placeholderCount, 24))}
      </span>
    </p>
  );
};

const renderMatchTheFollowing = (question: Question) => (
  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-900">
    <div className="space-y-2">
      <p className="font-medium">Column A</p>
      {question.matchPairs.map((pair, index) => (
        <p key={pair.id} className="grid grid-cols-[1.5rem_1fr] gap-2">
          <span>{index + 1}.</span>
          <span>{pair.left}</span>
        </p>
      ))}
    </div>

    <div className="space-y-2">
      <p className="font-medium">Column B</p>
      {question.matchPairs.map((pair, index) => (
        <p key={pair.id} className="grid grid-cols-[1.5rem_1fr] gap-2">
          <span>{String.fromCharCode(65 + index)}.</span>
          <span>{pair.right}</span>
        </p>
      ))}
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

  return (
    <>
      <p className="mt-1 text-sm leading-6 text-slate-900">{question.text}</p>
      <AnswerLines lines={4} />
    </>
  );
};

export const QuestionPaperPrintLayout = ({ paper }: QuestionPaperPrintLayoutProps) => {
  return (
    <article className="mx-auto w-full max-w-[210mm] bg-white p-8 text-slate-950 print:p-0">
      <style>{`
        @page {
          size: A4;
          margin: 20mm;
        }

        @media print {
          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <header className="border-b border-slate-300 pb-4">
        <h1 className="text-center text-2xl font-bold tracking-tight">{paper.paperTitle}</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <p>
            <span className="font-semibold">Subject:</span> {paper.subject}
          </p>
          <p className="text-right">
            <span className="font-semibold">Duration:</span> {paper.duration}
          </p>
          <p className="col-span-2 text-right">
            <span className="font-semibold">Total Marks:</span> {paper.totalMarks}
          </p>
        </div>
      </header>

      <section className="print-avoid-break mt-5 border border-slate-300 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Instructions</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
          {paper.instructions.map((instruction, index) => (
            <li key={`${instruction}-${index}`}>{instruction}</li>
          ))}
        </ul>
      </section>

      <div className="mt-6 space-y-6">
        {paper.sections.map((section, sectionIndex) => {
          const totalSectionMarks = section.questions.reduce(
            (sum, question) => sum + (typeof question.marks === 'number' ? question.marks : 0),
            0,
          );

          return (
            <section key={section.id} className="space-y-3">
              <div className="grid grid-cols-[1fr_auto] items-end border-b border-slate-300 pb-2">
                <h3 className="text-lg font-semibold">
                  Section {sectionIndex + 1}: {section.title}
                </h3>
                <p className="text-sm font-medium">[{totalSectionMarks} marks]</p>
              </div>

              {section.instructions && <p className="text-sm text-slate-700">{section.instructions}</p>}

              <div className="space-y-4">
                {section.questions.map((question, questionIndex) => (
                  <div key={question.id} className="print-avoid-break rounded-sm border border-slate-200 p-3">
                    <div className="grid grid-cols-[1fr_auto] items-start gap-4">
                      <div>
                        <p className="text-sm font-medium">Q{questionIndex + 1}. {question.text}</p>
                        {renderQuestionContent(question)}
                      </div>
                      <p className="text-sm font-medium">({question.marks || 0})</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </article>
  );
};

export { AnswerLines };
