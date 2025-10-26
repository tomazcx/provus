import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import { SubmissaoResultDto } from './submissao.result';

export class SubmissaoComEstudanteDto extends SubmissaoResultDto {
  estudante: {
    nome: string;
    email: string;
  };
  iniciadoEm: string;

  constructor(model: SubmissaoModel) {
    super(model);
    this.estudante = model.estudante
      ? { nome: model.estudante.nome, email: model.estudante.email }
      : { nome: 'Aluno Anônimo', email: '' };
    this.iniciadoEm = model.criadoEm.toISOString();
  }
}

export class FindSubmissoesResponseDto {
  applicationId: number;
  avaliacaoId: number;
  titulo: string;
  descricao?: string;
  pontuacaoTotal: number;
  dataAplicacao: string;
  submissoes: SubmissaoComEstudanteDto[];
}
