import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { AlternativaResultDto } from '../alternativa/alternativa.result';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import TipoItemEnum from 'src/enums/tipo-item.enum';

export class QuestaoResultDto {
  id: number;
  titulo: string;
  paiId: number | null;
  path?: string;
  criadoEm: string;
  atualizadoEm: string;
  descricao?: string;
  dificuldade: DificuldadeQuestaoEnum;
  exemploRespostaIa: string;
  pontuacao: number;
  isModelo: boolean;
  tipoQuestao: TipoQuestaoEnum;
  textoRevisao?: string;
  alternativas: AlternativaResultDto[];
  tipo: TipoItemEnum;

  constructor(questaoModel: QuestaoModel, path?: string) {
    this.id = questaoModel.id;
    this.titulo = questaoModel.item.titulo;
    this.criadoEm = questaoModel.item.criadoEm.toISOString();
    this.atualizadoEm = questaoModel.item.atualizadoEm.toISOString();
    this.descricao = questaoModel.descricao;
    this.dificuldade = questaoModel.dificuldade;
    this.exemploRespostaIa = questaoModel.exemploRespostaIa;
    this.pontuacao = questaoModel.pontuacao;
    this.isModelo = questaoModel.isModelo;
    this.tipoQuestao = questaoModel.tipoQuestao;
    this.textoRevisao = questaoModel.textoRevisao;
    this.path = path;
    this.paiId = questaoModel.item.paiId;
    this.tipo = questaoModel.item.tipo;

    this.alternativas = (questaoModel.alternativas || []).map(
      (altModel) => new AlternativaResultDto(altModel),
    );
  }
}
