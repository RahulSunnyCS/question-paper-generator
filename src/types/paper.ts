import type { Section } from '../../shared/types/paper';

export type {
  MatchPair,
  Paper,
  Question,
  QuestionType,
  Section,
} from '../../shared/types/paper';

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
