import { ApiProperty } from '@nestjs/swagger';

export class ExpandirQuestoesResponse {
  @ApiProperty({
    description: 'IDs das questões expandidas',
    example: [1, 2, 3],
  })
  questionIds: number[];
}
