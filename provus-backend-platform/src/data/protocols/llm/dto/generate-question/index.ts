import { Difficulty } from "src/domain/services/question/dto";

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
