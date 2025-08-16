import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAvaliadorRequest {
  @ApiProperty({
    description: 'Nome do avaliador',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({
    description: 'Email do avaliador',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  senha: string;

  @ApiProperty({
    description: 'Nova senha do avaliador',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  novaSenha: string;
}
