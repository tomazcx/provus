import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAvaliadorRequest {
  @ApiProperty({
    description: 'Nome do avaliador',
    example: 'João da Silva',
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({
    description: 'Senha do avaliador',
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
  @IsOptional()
  novaSenha?: string;
}
