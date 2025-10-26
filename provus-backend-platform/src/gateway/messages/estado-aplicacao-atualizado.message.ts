import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';

export interface EstadoAplicacaoAtualizadoPayload {
  aplicacaoId: number;
  novoEstado: EstadoSubmissaoEnum;
  novaDataFimISO: string;
}
