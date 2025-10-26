import { ApiProperty } from '@nestjs/swagger';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import TipoAtividadeEnum from 'src/enums/tipo-atividade.enum';

class ProgressoAlunoDto {
  @ApiProperty()
  submissaoId: number;

  @ApiProperty()
  aluno: { id?: number; nome: string; email: string };

  @ApiProperty({ enum: EstadoSubmissaoEnum })
  estado: EstadoSubmissaoEnum;

  @ApiProperty()
  progresso: number;

  @ApiProperty()
  questoesRespondidas: number;

  @ApiProperty()
  totalQuestoes: number;

  @ApiProperty()
  horaInicio: string;

  @ApiProperty()
  alertas: number;

  @ApiProperty({ nullable: true })
  tempoPenalidadeEmSegundos?: number;
}

class LogAtividadeDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: TipoAtividadeEnum })
  tipo: TipoAtividadeEnum;

  @ApiProperty()
  alunoNome: string;

  @ApiProperty()
  descricao: string;

  @ApiProperty()
  timestamp: string;
}

export class MonitoramentoInicialResponseDto {
  @ApiProperty({ type: [ProgressoAlunoDto] })
  alunos: ProgressoAlunoDto[];

  @ApiProperty({ type: [LogAtividadeDto] })
  atividadesRecentes: LogAtividadeDto[];
}
