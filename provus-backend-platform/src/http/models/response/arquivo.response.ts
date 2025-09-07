import { ApiProperty } from '@nestjs/swagger';

export class ArquivoResponse {
  @ApiProperty({
    description: 'ID do arquivo.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Título do arquivo.',
    example: 'Exemplo de arquivo',
  })
  titulo: string;

  @ApiProperty({
    description: 'URL do arquivo.',
    example: 'https://example.com/arquivo.pdf',
  })
  url: string;

  @ApiProperty({
    description: 'Descrição do arquivo.',
    example: 'Descrição do arquivo',
  })
  descricao: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes.',
    example: 1024,
  })
  tamanhoEmBytes: number;

  @ApiProperty({
    description: 'Caminho do arquivo.',
    example: 'Exemplo de caminho',
  })
  path: string;

  @ApiProperty({
    description: 'Data de criação do arquivo.',
    example: '2021-01-01',
  })
  criadoEm: string;

  @ApiProperty({
    description: 'Data de atualização do arquivo.',
    example: '2021-01-01',
  })
  atualizadoEm: string;
}
