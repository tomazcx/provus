export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class GenerateQuestionDto {
  subject: string;
  content: string;
  difficulty: Difficulty;
  questionTheme?: string;
  questions: {
    question: string;
    correctAnswer: string;
  }[];
}
