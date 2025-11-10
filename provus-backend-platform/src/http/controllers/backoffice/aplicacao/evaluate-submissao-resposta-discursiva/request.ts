import { ApiProperty } from '@nestjs/swagger';
import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';
import { IsNumber } from 'class-validator';
import { IsEnum } from 'class-validator';
import { IsString } from 'class-validator';

export class EvaluateSubmissaoRespostaDiscursivaRequest {
  @ApiProperty({ description: 'Pontuação obtida pelo aluno' })
  @IsNumber()
  pontuacao: number;

  @ApiProperty({ description: 'Estado da correção' })
  @IsEnum(EstadoQuestaoCorrigida)
  estadoCorrecao: EstadoQuestaoCorrigida;

  @ApiProperty({ description: 'Feedback do professor' })
  @IsString()
  textoRevisao: string;
}
