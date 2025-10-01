import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class ExpandirArquivosRequest {
  @ApiProperty({
    description: 'Uma lista de IDs de pastas para serem expandidas.',
    example: [1, 5, 12],
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  folderIds: number[];
}
