import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class FindQuestoesByIdsRequest {
  @ApiProperty({
    description: 'IDs das questões',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNotEmpty()
  questionIds: number[];
}
