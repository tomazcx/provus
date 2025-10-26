import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';
import { AlternativaRevisaoResultDto } from './alternativa-revisao.result.dto';
import { SubmissaoRespostasModel } from 'src/database/config/models/submissao-respostas.model';
import { DadosRespostaType } from 'src/shared/types/dados-resposta.type';

export class QuestaoRevisaoResultDto {
  id: number;
  titulo: string;
  descricao: string | null;
  pontuacaoMaxima: number;
  dificuldade: DificuldadeQuestaoEnum;
  tipo: TipoQuestaoEnum;
  alternativas: AlternativaRevisaoResultDto[];
  dadosResposta: DadosRespostaType | null;
  pontuacaoObtida: number | null;
  estadoCorrecao: EstadoQuestaoCorrigida | null;
  textoRevisao: string | null;
  exemploRespostaIa: string | null;

  constructor(respostaModel: SubmissaoRespostasModel) {
    const questaoModel = respostaModel.questao;
    this.id = questaoModel.id;
    this.titulo = questaoModel.item.titulo;
    this.descricao = questaoModel.descricao ?? null;
    this.pontuacaoMaxima = questaoModel.pontuacao;
    this.dificuldade = questaoModel.dificuldade;
    this.tipo = questaoModel.tipoQuestao;
    this.alternativas = questaoModel.alternativas.map(
      (alt) => new AlternativaRevisaoResultDto(alt),
    );
    this.dadosResposta = respostaModel.dadosResposta;
    this.pontuacaoObtida = respostaModel.pontuacao;
    this.estadoCorrecao = respostaModel.estadoCorrecao;
    this.textoRevisao = respostaModel.textoRevisao ?? null;
    this.exemploRespostaIa = questaoModel.exemploRespostaIa ?? null;
  }
}
