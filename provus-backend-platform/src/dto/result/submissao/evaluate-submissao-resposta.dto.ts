import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';

export class EvaluateSubmissaoRespostaDto {
  pontuacao: number;
  estadoCorrecao: EstadoQuestaoCorrigida;
  textoRevisao: string;
}
