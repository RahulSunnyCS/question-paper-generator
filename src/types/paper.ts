export type QuestionType = 'Fill in the Blanks' | 'Match the Following';

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  marks: number | '';
  blankAnswer?: string;
  matchPairs: MatchPair[];
}

export interface Section {
  id: string;
  title: string;
  instructions: string;
  questions: Question[];
}

export interface ValidationError {
  title?: string;
  instructions?: string;
  questions: Record<
    string,
    {
      text?: string;
      marks?: string;
      blankAnswer?: string;
      matchPairs?: string;
    }
  >;
}

export interface PaperBuilderState {
  paperTitle: string;
  sections: Section[];
  errors: Record<string, ValidationError>;
}
