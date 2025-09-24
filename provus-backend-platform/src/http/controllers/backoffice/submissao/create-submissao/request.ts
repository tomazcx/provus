import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubmissaoRequest {
  @ApiProperty({
    description: 'Nome do aluno.',
    example: 'Jarvis Vieira da Silva',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'Email do aluno.',
    example: 'jarvis.vieira@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Código da acesso.',
    example: 'ABCR132',
  })
  @IsString()
  @IsNotEmpty()
  codigoAcesso: string;
}
