import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';

export class EvaluateByAiResultDto {
  pontuacao: number;
  estadoCorrecao: EstadoQuestaoCorrigida;
  textoRevisao: string;
}
