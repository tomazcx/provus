import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class FindArquivosByIdsRequest {
  @ApiProperty({
    description: 'Uma lista de IDs de arquivos para buscar os detalhes.',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  @IsInt({ each: true })
  arquivoIds: number[];
}
