import { FormEvent } from 'react';
import { questionTypes, usePaperBuilderStore } from '../store/paperBuilderStore';

export const PaperBuilder = () => {
  const {
    paperTitle,
    sections,
    errors,
    setPaperTitle,
    addSection,
    updateSection,
    removeSection,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addMatchPair,
    updateMatchPair,
    removeMatchPair,
    validatePaper,
  } = usePaperBuilderStore();

  const handleValidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    validatePaper();
  };

  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-slate-100 p-6 lg:grid-cols-2">
      <form onSubmit={handleValidate} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Paper Title</label>
          <input
            value={paperTitle}
            onChange={(event) => setPaperTitle(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Mid-Term Examination"
          />
        </div>

        {sections.map((section, sectionIndex) => {
          const sectionError = errors[section.id];

          return (
            <div key={section.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-800">Section {sectionIndex + 1}</h2>
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  className="text-xs text-rose-600 hover:text-rose-700"
                >
                  Remove Section
                </button>
              </div>

              <div className="space-y-2">
                <input
                  value={section.title}
                  onChange={(event) => updateSection(section.id, { title: event.target.value })}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Section title"
                />
                {sectionError?.title && <p className="text-xs text-rose-600">{sectionError.title}</p>}

                <textarea
                  value={section.instructions}
                  onChange={(event) =>
                    updateSection(section.id, {
                      instructions: event.target.value,
                    })
                  }
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Instructions (optional)"
                  rows={2}
                />
              </div>

              <div className="mt-4 space-y-3">
                {section.questions.map((question, questionIndex) => {
                  const questionError = sectionError?.questions[question.id];

                  return (
                    <div key={question.id} className="rounded border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-700">Question {questionIndex + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeQuestion(section.id, question.id)}
                          className="text-xs text-rose-600"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid gap-2 md:grid-cols-3">
                        <textarea
                          value={question.text}
                          onChange={(event) =>
                            updateQuestion(section.id, question.id, { text: event.target.value })
                          }
                          className="md:col-span-2 rounded border border-slate-300 px-3 py-2 text-sm"
                          rows={2}
                          placeholder="Enter question text"
                        />

                        <div className="space-y-2">
                          <select
                            value={question.type}
                            onChange={(event) =>
                              updateQuestion(section.id, question.id, {
                                type: event.target.value as (typeof questionTypes)[number],
                              })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                          >
                            {questionTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>

                          <input
                            type="number"
                            min={1}
                            value={question.marks}
                            onChange={(event) =>
                              updateQuestion(section.id, question.id, {
                                marks:
                                  event.target.value === '' ? '' : Number.parseInt(event.target.value, 10),
                              })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Marks"
                          />
                        </div>
                      </div>

                      {question.type === 'Fill in the Blanks' && (
                        <div className="mt-2">
                          <input
                            value={question.blankAnswer ?? ''}
                            onChange={(event) =>
                              updateQuestion(section.id, question.id, {
                                blankAnswer: event.target.value,
                              })
                            }
                            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Expected answer"
                          />
                        </div>
                      )}

                      {question.type === 'Match the Following' && (
                        <div className="mt-2 space-y-2">
                          {question.matchPairs.map((pair) => (
                            <div key={pair.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                              <input
                                value={pair.left}
                                onChange={(event) =>
                                  updateMatchPair(
                                    section.id,
                                    question.id,
                                    pair.id,
                                    'left',
                                    event.target.value,
                                  )
                                }
                                className="rounded border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Column A"
                              />
                              <input
                                value={pair.right}
                                onChange={(event) =>
                                  updateMatchPair(
                                    section.id,
                                    question.id,
                                    pair.id,
                                    'right',
                                    event.target.value,
                                  )
                                }
                                className="rounded border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Column B"
                              />
                              <button
                                type="button"
                                onClick={() => removeMatchPair(section.id, question.id, pair.id)}
                                className="rounded bg-rose-100 px-2 text-xs text-rose-700"
                              >
                                Delete
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addMatchPair(section.id, question.id)}
                            className="rounded border border-indigo-400 px-3 py-1 text-xs text-indigo-700"
                          >
                            + Add Match Pair
                          </button>
                        </div>
                      )}

                      <div className="mt-1 space-y-1 text-xs text-rose-600">
                        {questionError?.text && <p>{questionError.text}</p>}
                        {questionError?.marks && <p>{questionError.marks}</p>}
                        {questionError?.blankAnswer && <p>{questionError.blankAnswer}</p>}
                        {questionError?.matchPairs && <p>{questionError.matchPairs}</p>}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => addQuestion(section.id)}
                  className="rounded border border-indigo-500 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  + Add Question
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={addSection}
            className="rounded bg-indigo-50 px-3 py-2 text-sm text-indigo-700"
          >
            + Add Section
          </button>
          <button type="submit" className="rounded bg-indigo-600 px-3 py-2 text-sm text-white">
            Validate Paper
          </button>
        </div>
      </form>

      <aside className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 border-b border-slate-200 pb-2 text-lg font-bold text-slate-800">{paperTitle}</h2>

        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <section key={section.id} className="space-y-2">
              <h3 className="font-semibold text-slate-700">
                Section {sectionIndex + 1}: {section.title || 'Untitled Section'}
              </h3>
              {section.instructions && <p className="text-sm text-slate-600">{section.instructions}</p>}

              <ol className="space-y-2 pl-5 text-sm text-slate-800">
                {section.questions.map((question) => (
                  <li key={question.id} className="list-decimal">
                    <div className="flex items-start justify-between gap-3">
                      <p>{question.text || 'Question text pending...'}</p>
                      <span className="whitespace-nowrap text-xs text-slate-500">[{question.marks || 0} marks]</span>
                    </div>
                    <p className="text-xs text-slate-500">Type: {question.type}</p>

                    {question.type === 'Fill in the Blanks' && (
                      <p className="text-xs text-slate-500">Answer: {question.blankAnswer || 'Not provided'}</p>
                    )}

                    {question.type === 'Match the Following' && (
                      <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
                        {question.matchPairs.length === 0 ? (
                          <li>No match pairs added yet.</li>
                        ) : (
                          question.matchPairs.map((pair) => (
                            <li key={pair.id}>
                              {pair.left || '...'} ↔ {pair.right || '...'}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
};
