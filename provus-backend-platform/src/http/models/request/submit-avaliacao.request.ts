import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { SubmitRespostaRequest } from './submit-respostas.request';

export class SubmitAvaliacaoRequest {
  @ApiProperty({
    description: 'Lista das respostas fornecidas pelo aluno.',
    type: [SubmitRespostaRequest],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitRespostaRequest)
  respostas: SubmitRespostaRequest[];
}
