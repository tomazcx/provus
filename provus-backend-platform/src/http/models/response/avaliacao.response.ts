import { ApiProperty } from '@nestjs/swagger';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { AvaliacaoDto } from 'src/dto/result/avaliacao/avaliacao.dto';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { ConfiguracaoAvaliacaoResponse } from './configuracao-avaliacao.response';
import { QuestaoResponse } from './questao.response';
import { ArquivoResponse } from './arquivo.response';
import { ArquivosAvaliacoesModel } from 'src/database/config/models/arquivos-avaliacoes.model';

class ArquivoAvaliacaoResponse {
  @ApiProperty({ type: () => ArquivoResponse })
  arquivo: ArquivoResponse;

  @ApiProperty()
  permitirConsultaPorEstudante: boolean;

  static fromModel(model: ArquivosAvaliacoesModel): ArquivoAvaliacaoResponse {
    if (!model.arquivo || !model.arquivo.item) {
      throw new Error(
        'A relação Arquivo e/ou ItemSistemaArquivos não foi carregada.',
      );
    }
    const response = new ArquivoAvaliacaoResponse();
    response.permitirConsultaPorEstudante = model.permitirConsultaPorEstudante;
    response.arquivo = ArquivoResponse.fromModel(model.arquivo.item);
    return response;
  }
}

export class AvaliacaoResponse {
  @ApiProperty({ description: 'ID da Avaliação' })
  id: number;

  @ApiProperty({ description: 'Título da Avaliação' })
  titulo: string;

  @ApiProperty({ description: 'Descrição da Avaliação' })
  descricao: string;

  @ApiProperty({ description: 'Indica se é um modelo reutilizável' })
  isModelo: boolean;

  @ApiProperty({
    enum: TipoItemEnum,
    description: 'Tipo do item, sempre AVALIACAO',
  })
  tipo: TipoItemEnum;

  @ApiProperty({
    type: 'number',
    nullable: true,
    description: 'ID da pasta pai',
  })
  paiId: number | null;

  @ApiProperty({ description: 'Caminho de pastas do item', required: false })
  path?: string;

  @ApiProperty({ description: 'Data de criação' })
  criadoEm: string;

  @ApiProperty({ description: 'Data da última atualização' })
  atualizadoEm: string;

  @ApiProperty({
    type: () => ConfiguracaoAvaliacaoResponse,
    description: 'Configurações detalhadas da avaliação',
  })
  configuracaoAvaliacao: ConfiguracaoAvaliacaoResponse;

  @ApiProperty({
    type: [QuestaoResponse],
    description: 'Lista de questões da avaliação',
  })
  questoes: QuestaoResponse[];

  @ApiProperty({ type: [ArquivoAvaliacaoResponse] })
  arquivos: ArquivoAvaliacaoResponse[];

  static fromModel(model: ItemSistemaArquivosModel): AvaliacaoResponse {
    if (model.tipo !== TipoItemEnum.AVALIACAO || !model.avaliacao) {
      throw new Error(
        `Item ${model.id} não é uma avaliação ou não teve os dados carregados.`,
      );
    }

    const response = new AvaliacaoResponse();
    response.id = model.id;
    response.titulo = model.titulo;
    response.tipo = model.tipo;

    response.paiId = model.paiId;

    response.criadoEm = model.criadoEm.toISOString();
    response.atualizadoEm = model.atualizadoEm.toISOString();

    response.descricao = model.avaliacao.descricao;
    response.isModelo = model.avaliacao.isModelo;

    response.path = '';

    if (model.avaliacao.configuracaoAvaliacao) {
      response.configuracaoAvaliacao = ConfiguracaoAvaliacaoResponse.fromModel(
        model.avaliacao.configuracaoAvaliacao,
      );
    }

    response.questoes =
      model.avaliacao.questoes?.map((qa) =>
        QuestaoResponse.fromModel(qa.questao.item),
      ) || [];
    response.arquivos =
      model.avaliacao.arquivos?.map((aa) =>
        ArquivoAvaliacaoResponse.fromModel(aa),
      ) || [];

    return response;
  }

  static fromDto(dto: AvaliacaoDto): AvaliacaoResponse {
    const response = new AvaliacaoResponse();
    response.id = dto.id;
    response.titulo = dto.titulo;
    response.descricao = dto.descricao;
    response.isModelo = dto.isModelo;
    response.path = dto.path;
    response.criadoEm = dto.criadoEm;
    response.atualizadoEm = dto.atualizadoEm;
    response.tipo = dto.tipo;
    response.paiId = dto.paiId;
    response.configuracaoAvaliacao = dto.configuracaoAvaliacao;

    response.arquivos = dto.arquivos.map((arquivoDto) => ({
      permitirConsultaPorEstudante: arquivoDto.permitirConsultaPorEstudante,
      arquivo: ArquivoResponse.fromDto(arquivoDto.arquivo),
    }));

    response.questoes = dto.questoes.map((qDto) =>
      QuestaoResponse.fromDto(qDto),
    );

    return response;
  }
}
