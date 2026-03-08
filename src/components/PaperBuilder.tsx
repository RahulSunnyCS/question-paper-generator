import { FormEvent, useMemo } from 'react';
import { questionTypes, usePaperBuilderStore } from '@/store/paperBuilderStore';
import { Paper } from '@/types/paper';
import { PaginatedPreview } from '@/components/PaginatedPreview';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DownloadPdfButton } from '@/components/DownloadPdfButton';

export const PaperBuilder = () => {
  const {
    paperTitle,
    subject,
    duration,
    totalMarks,
    instructions,
    sections,
    errors,
    setPaperTitle,
    setSubject,
    setDuration,
    setTotalMarks,
    addInstruction,
    updateInstruction,
    removeInstruction,
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

  const printPaper = useMemo<Paper>(
    () => ({
      paperTitle: paperTitle.trim() || 'Untitled Question Paper',
      subject: subject.trim() || 'General',
      duration: duration.trim() || '3 Hours',
      totalMarks,
      instructions,
      sections,
    }),
    [paperTitle, subject, duration, totalMarks, instructions, sections],
  );

  const handleValidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    validatePaper();
  };

  return (
    <div className="grid min-h-screen grid-cols-1 gap-6 bg-slate-100 p-6 lg:grid-cols-2">
      <form onSubmit={handleValidate} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Paper Title</label>
          <Input value={paperTitle} onChange={(event) => setPaperTitle(event.target.value)} placeholder="Mid-Term Examination" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Subject</label>
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Mathematics" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Duration</label>
            <Input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="3 Hours" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Total Marks</label>
            <Input
              type="number"
              min={0}
              value={totalMarks === 0 ? '' : totalMarks}
              onChange={(event) =>
                setTotalMarks(event.target.value === '' ? 0 : Number.parseInt(event.target.value, 10))
              }
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">General Instructions</label>
            <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
              + Add Instruction
            </Button>
          </div>
          <div className="space-y-2">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={instruction}
                  onChange={(event) => updateInstruction(index, event.target.value)}
                  placeholder={`Instruction ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInstruction(index)}
                  className="shrink-0 bg-rose-100 text-rose-700 hover:bg-rose-200"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={sections.map((section) => section.id)}
          className="space-y-4"
        >
          {sections.map((section, sectionIndex) => {
            const sectionError = errors[section.id];

            return (
              <AccordionItem key={section.id} value={section.id}>
                <div className="flex items-center justify-between gap-3 px-2">
                  <AccordionTrigger className="flex-1 py-4 text-sm font-semibold text-slate-800">
                    Section {sectionIndex + 1}: {section.title || 'Untitled Section'}
                  </AccordionTrigger>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSection(section.id)}
                    className="mr-2"
                  >
                    Remove Section
                  </Button>
                </div>

                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      value={section.title}
                      onChange={(event) => updateSection(section.id, { title: event.target.value })}
                      placeholder="Section title"
                    />
                    {sectionError?.title && <p className="text-xs text-rose-600">{sectionError.title}</p>}

                    <Textarea
                      value={section.instructions}
                      onChange={(event) =>
                        updateSection(section.id, {
                          instructions: event.target.value,
                        })
                      }
                      placeholder="Instructions (optional)"
                      rows={2}
                    />
                  </div>

                  <Accordion
                    type="multiple"
                    defaultValue={section.questions.map((question) => `${section.id}:${question.id}`)}
                    className="space-y-3"
                  >
                    {section.questions.map((question, questionIndex) => {
                      const questionError = sectionError?.questions[question.id];
                      const questionValue = `${section.id}:${question.id}`;

                      return (
                        <AccordionItem key={question.id} value={questionValue} className="bg-slate-50">
                          <div className="flex items-center justify-between gap-3 px-2">
                            <AccordionTrigger className="flex-1 py-3 text-xs font-medium text-slate-700">
                              Question {questionIndex + 1}
                            </AccordionTrigger>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeQuestion(section.id, question.id)}
                              className="mr-2"
                            >
                              Remove
                            </Button>
                          </div>

                          <AccordionContent className="space-y-2 bg-slate-50">
                            <div className="grid gap-2 md:grid-cols-3">
                              <Textarea
                                value={question.text}
                                onChange={(event) => updateQuestion(section.id, question.id, { text: event.target.value })}
                                className="md:col-span-2"
                                rows={2}
                                placeholder="Enter question text"
                              />

                              <div className="space-y-2">
                                <Select
                                  value={question.type}
                                  onChange={(event) =>
                                    updateQuestion(section.id, question.id, {
                                      type: event.target.value as (typeof questionTypes)[number],
                                    })
                                  }
                                >
                                  {questionTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </Select>

                                <Input
                                  type="number"
                                  min={1}
                                  value={question.marks}
                                  onChange={(event) =>
                                    updateQuestion(section.id, question.id, {
                                      marks: event.target.value === '' ? '' : Number.parseInt(event.target.value, 10),
                                    })
                                  }
                                  placeholder="Marks"
                                />
                              </div>
                            </div>

                            {question.type === 'Fill in the Blanks' && (
                              <Input
                                value={question.blankAnswer ?? ''}
                                onChange={(event) =>
                                  updateQuestion(section.id, question.id, {
                                    blankAnswer: event.target.value,
                                  })
                                }
                                placeholder="Expected answer"
                              />
                            )}

                            {question.type === 'Match the Following' && (
                              <div className="mt-2 space-y-2">
                                {question.matchPairs.map((pair) => (
                                  <div key={pair.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                    <Input
                                      value={pair.left}
                                      onChange={(event) =>
                                        updateMatchPair(section.id, question.id, pair.id, 'left', event.target.value)
                                      }
                                      placeholder="Column A"
                                    />
                                    <Input
                                      value={pair.right}
                                      onChange={(event) =>
                                        updateMatchPair(section.id, question.id, pair.id, 'right', event.target.value)
                                      }
                                      placeholder="Column B"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeMatchPair(section.id, question.id, pair.id)}
                                      className="bg-rose-100 text-rose-700 hover:bg-rose-200"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                ))}

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addMatchPair(section.id, question.id)}
                                  className="border-indigo-400"
                                >
                                  + Add Match Pair
                                </Button>
                              </div>
                            )}

                            <div className="mt-1 space-y-1 text-xs text-rose-600">
                              {questionError?.text && <p>{questionError.text}</p>}
                              {questionError?.marks && <p>{questionError.marks}</p>}
                              {questionError?.blankAnswer && <p>{questionError.blankAnswer}</p>}
                              {questionError?.matchPairs && <p>{questionError.matchPairs}</p>}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(section.id)}
                  >
                    + Add Question
                  </Button>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={addSection}>
            + Add Section
          </Button>
          <Button type="submit" variant="default">
            Validate Paper
          </Button>
          <DownloadPdfButton paper={printPaper} />
        </div>
      </form>

      <PaginatedPreview paper={printPaper} enableRefreshButton />
    </div>
  );
};
