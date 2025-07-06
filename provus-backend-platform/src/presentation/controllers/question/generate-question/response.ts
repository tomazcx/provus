import { ApiProperty } from "@nestjs/swagger";

export class GenerateQuestionResponse {
  @ApiProperty({
    description: 'The question generated',
    example: 'Exemplo da pergunta da questão',
  })
  question: string;

  @ApiProperty({
    description: 'The correct answer to the question',
    example: 'Exemplo da resposta correta da questão',
  })
  correctAnswer: string;
}
