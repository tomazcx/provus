import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class ExpandirQuestoesRequest {
  @ApiProperty({
    description: 'IDs das pastas a serem expandidas',
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNotEmpty()
  folderIds: number[];
}
