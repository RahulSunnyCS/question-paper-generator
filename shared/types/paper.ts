export type QuestionType = 'Fill in the Blanks' | 'Match the Following' | 'Descriptive';

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

export interface Paper {
  paperTitle: string;
  subject: string;
  duration: string;
  totalMarks: number;
  instructions: string[];
  sections: Section[];
  subjectCode?: string;
  grade?: string;
  assessmentType?: string;
  schoolName?: string;
  schoolLogoUrl?: string;
  boardLogoUrl?: string;
}
