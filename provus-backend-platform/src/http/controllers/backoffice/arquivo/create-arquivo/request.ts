import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArquivoRequest {
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

  @ApiProperty({
    description: 'ID da pasta onde o arquivo será criado.',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  paiId?: number;

  @ApiProperty({
    description: 'Arquivo a ser enviado.',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
