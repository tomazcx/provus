import { Injectable } from '@nestjs/common';
import { LLMProvider } from 'src/data/protocols/llm';
import {
  AnswerEvaluationDto,
  EvaluateAnswerDto,
  GenerateQuestionDto,
} from 'src/data/protocols/llm/dto';
import { openai } from '../config';
import { Env } from 'src/shared/env';

@Injectable()
export class LLMProviderImpl implements LLMProvider {
  async generateQuestion(dto: GenerateQuestionDto): Promise<{
    question: string;
    correctAnswer: string;
  }> {
    const response = await openai.chat.completions.create({
      model: Env.DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a assistant reponsable for generating a question for a test.
            You will receive a json with an object. The object contains the subject of the test,
            the content of the test, the difficulty of the question that is being generated and the theme of the question based on the subject and the content.
            You will also receive a json with an array of objects, each object has one question already written by the teacher for the test, 
            also with a sample of a correct answer to help evaluate the question.
            You need to generate a question for the test based on the subject, the content, the difficulty, the theme and the previous questions.
            The question must be in brazilian portuguese.
            The question must be at the same difficulty as the questions already written by the teacher.
            The question must be related to the theme of the questions already written by the teacher.
            The question must be different from the questions already written by the teacher.
            The response must be a json with the following structure:
            {
              "question": "The generated question",
              "correctAnswer": "The correct answer of the generated question (to help evaluate the question)"
            }
            `,
        },
        {
          role: 'user',
          content: JSON.stringify(dto),
        },
      ],
    });

    console.log(response.choices[0].message.content);
    return JSON.parse(
      response.choices[0].message.content
        .replace(/```json\s*([\s\S]*?)\s*```/, '$1')
        .trim(),
    );
  }

  async evaluateAnswer(
    dto: EvaluateAnswerDto[],
  ): Promise<AnswerEvaluationDto[]> {
    const response = await openai.chat.completions.create({
      model: Env.DEFAULT_OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a assistant reponsable for evaluating the answer of the user for a test.
            You will receibe a json with an array of objects, each object has one question, its answer and a sample of a correct answer written by the teacher.
            You need to evaluate the answer of each object of the array based on the question, the correct answer and
            return a json with the evaluation of the test.
            The language must be in brazilian portuguese.
            The comment of the evaluation must be an explanation of the evaluation, of why its correct or incorrect.
            The json will have the following structure:
            [{
              "evaluation": "correct" | "incorrect" | "partially correct"
              "comment": "comment about the answer"
            }]`,
        },
        {
          role: 'user',
          content: JSON.stringify(dto),
        },
      ],
    });

    return JSON.parse(
      response.choices[0].message.content
        .replace(/```json\s*([\s\S]*?)\s*```/, '$1')
        .trim(),
    );
  }
}
