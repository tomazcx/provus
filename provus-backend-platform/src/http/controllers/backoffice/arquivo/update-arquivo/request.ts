import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsInt } from 'class-validator';
import { IsOptional } from 'class-validator';

export class UpdateArquivoRequest {
  @ApiProperty({
    description: 'Título do arquivo.',
    example: 'Exemplo de arquivo',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Descrição do arquivo.',
    example: 'Descrição do arquivo',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;
}
