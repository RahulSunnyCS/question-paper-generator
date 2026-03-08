import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PaperBuilderState, Question, QuestionType, Section } from '../types/paper';

interface PaperBuilderActions {
  setPaperTitle: (value: string) => void;
  addSection: () => void;
  updateSection: (sectionId: string, payload: Partial<Pick<Section, 'title' | 'instructions'>>) => void;
  removeSection: (sectionId: string) => void;
  addQuestion: (sectionId: string) => void;
  updateQuestion: (sectionId: string, questionId: string, payload: Partial<Question>) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
  addMatchPair: (sectionId: string, questionId: string) => void;
  updateMatchPair: (
    sectionId: string,
    questionId: string,
    pairId: string,
    side: 'left' | 'right',
    value: string,
  ) => void;
  removeMatchPair: (sectionId: string, questionId: string, pairId: string) => void;
  validatePaper: () => boolean;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const defaultQuestion = (): Question => ({
  id: uid(),
  text: '',
  marks: '',
  type: 'Fill in the Blanks',
  blankAnswer: '',
  matchPairs: [],
});

const defaultSection = (): Section => ({
  id: uid(),
  title: '',
  instructions: '',
  questions: [defaultQuestion()],
});

export const usePaperBuilderStore = create<PaperBuilderState & PaperBuilderActions>()(
  persist(
    (set, get) => ({
  paperTitle: 'Untitled Question Paper',
  sections: [defaultSection()],
  errors: {},

  setPaperTitle: (value) => set({ paperTitle: value }),

  addSection: () =>
    set((state) => ({
      sections: [...state.sections, defaultSection()],
    })),

  updateSection: (sectionId, payload) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId ? { ...section, ...payload } : section,
      ),
    })),

  removeSection: (sectionId) =>
    set((state) => ({
      sections: state.sections.length === 1 ? state.sections : state.sections.filter((s) => s.id !== sectionId),
    })),

  addQuestion: (sectionId) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: [...section.questions, defaultQuestion()],
            }
          : section,
      ),
    })),

  updateQuestion: (sectionId, questionId, payload) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      ...payload,
                      ...(payload.type === 'Fill in the Blanks' ? { matchPairs: [] } : {}),
                      ...(payload.type === 'Match the Following' ? { blankAnswer: '' } : {}),
                    }
                  : question,
              ),
            }
          : section,
      ),
    })),

  removeQuestion: (sectionId, questionId) =>
    set((state) => ({
      sections: state.sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }

        const remaining = section.questions.filter((question) => question.id !== questionId);
        return {
          ...section,
          questions: remaining.length > 0 ? remaining : [defaultQuestion()],
        };
      }),
    })),

  addMatchPair: (sectionId, questionId) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      matchPairs: [...question.matchPairs, { id: uid(), left: '', right: '' }],
                    }
                  : question,
              ),
            }
          : section,
      ),
    })),

  updateMatchPair: (sectionId, questionId, pairId, side, value) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      matchPairs: question.matchPairs.map((pair) =>
                        pair.id === pairId ? { ...pair, [side]: value } : pair,
                      ),
                    }
                  : question,
              ),
            }
          : section,
      ),
    })),

  removeMatchPair: (sectionId, questionId, pairId) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((question) =>
                question.id === questionId
                  ? {
                      ...question,
                      matchPairs: question.matchPairs.filter((pair) => pair.id !== pairId),
                    }
                  : question,
              ),
            }
          : section,
      ),
    })),

  validatePaper: () => {
    const { sections } = get();
    const errors: PaperBuilderState['errors'] = {};

    sections.forEach((section) => {
      const sectionError: PaperBuilderState['errors'][string] = { questions: {} };

      if (!section.title.trim()) {
        sectionError.title = 'Section title is required.';
      }

      section.questions.forEach((question) => {
        const questionError: NonNullable<(typeof sectionError.questions)[string]> = {};

        if (!question.text.trim()) {
          questionError.text = 'Question text is required.';
        }

        if (question.marks === '' || Number(question.marks) <= 0) {
          questionError.marks = 'Marks should be greater than 0.';
        }

        if (question.type === 'Fill in the Blanks' && !question.blankAnswer?.trim()) {
          questionError.blankAnswer = 'Expected answer is required for this type.';
        }

        if (
          question.type === 'Match the Following' &&
          (question.matchPairs.length < 2 ||
            question.matchPairs.some((pair) => !pair.left.trim() || !pair.right.trim()))
        ) {
          questionError.matchPairs = 'Add at least 2 complete match pairs.';
        }

        if (Object.keys(questionError).length > 0) {
          sectionError.questions[question.id] = questionError;
        }
      });

      if (sectionError.title || Object.keys(sectionError.questions).length > 0) {
        errors[section.id] = sectionError;
      }
    });

    set({ errors });
    return Object.keys(errors).length === 0;
  },
    }),
    {
      name: 'question-paper-builder',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        paperTitle: state.paperTitle,
        sections: state.sections,
        errors: state.errors,
      }),
    },
  ),
);

export const questionTypes: QuestionType[] = ['Fill in the Blanks', 'Match the Following'];
