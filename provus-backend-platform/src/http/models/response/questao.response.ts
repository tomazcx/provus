import { ApiProperty } from '@nestjs/swagger';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { AlternativaResponse } from './alternativa.response';
import { QuestaoResultDto } from 'src/dto/result/questao/questao.result';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import TipoItemEnum from 'src/enums/tipo-item.enum';

export class QuestaoResponse {
  @ApiProperty({
    description: 'ID da questão',
    example: 42,
  })
  id: number;

  @ApiProperty({
    description: 'Título da questão',
    example: 'Qual o sentido da vida?',
  })
  titulo: string;

  @ApiProperty({
    description:
      'Caminho completo da questão no sistema de arquivos do avaliador',
    example: '/Filosofia/Questões Discursivas/Qual o sentido da vida?',
  })
  path?: string;

  @ApiProperty({
    description: 'Data de criação da questão no formato ISO 8601',
    example: '2025-08-20T02:30:00.000Z',
  })
  criadoEm: string;

  @ApiProperty({
    description: 'Data da última atualização da questão no formato ISO 8601',
    example: '2025-08-20T02:30:00.000Z',
  })
  atualizadoEm: string;

  @ApiProperty({
    description: 'Descrição ou enunciado completo da questão',
    example: 'Discorra sobre o sentido da vida, do universo e tudo mais.',
    required: false,
  })
  descricao?: string;

  @ApiProperty({
    description: 'Nível de dificuldade da questão',
    enum: DificuldadeQuestaoEnum,
    example: DificuldadeQuestaoEnum.DIFICIL,
  })
  dificuldade: DificuldadeQuestaoEnum;

  @ApiProperty({
    description: 'Exemplo de resposta para correção (usado pela IA)',
    example: '42',
    required: false,
  })
  exemploRespostaIa?: string;

  @ApiProperty({
    description: 'Pontuação atribuída a esta questão na avaliação',
    example: 10,
  })
  pontuacao: number;

  @ApiProperty({
    description: 'Indica se a questão é um modelo reutilizável',
    example: true,
  })
  isModelo: boolean;

  @ApiProperty({
    description: 'Tipo da questão (objetiva, discursiva, etc.)',
    enum: TipoQuestaoEnum,
    example: TipoQuestaoEnum.DISCURSIVA,
  })
  tipoQuestao: TipoQuestaoEnum;

  @ApiProperty({
    description: 'Texto de apoio para a revisão da questão',
    example: 'Verificar se o aluno mencionou a toalha.',
    required: false,
  })
  textoRevisao?: string;

  @ApiProperty({
    description: 'Lista de alternativas para a questão (se aplicável)',
    type: [AlternativaResponse],
  })
  alternativas: AlternativaResponse[];

  static fromDto(dto: QuestaoResultDto): QuestaoResponse {
    const response = new QuestaoResponse();

    response.id = dto.id;
    response.titulo = dto.titulo;
    response.path = dto.path;
    response.criadoEm = dto.criadoEm;
    response.atualizadoEm = dto.atualizadoEm;
    response.descricao = dto.descricao;
    response.dificuldade = dto.dificuldade;
    response.exemploRespostaIa = dto.exemploRespostaIa;
    response.pontuacao = dto.pontuacao;
    response.isModelo = dto.isModelo;
    response.tipoQuestao = dto.tipoQuestao;
    response.textoRevisao = dto.textoRevisao;

    response.alternativas = (dto.alternativas || []).map((altDto) => {
      const altResponse = new AlternativaResponse();
      altResponse.id = altDto.id;
      altResponse.descricao = altDto.descricao;
      altResponse.isCorreto = altDto.isCorreto;
      return altResponse;
    });

    return response;
  }

  static fromModel(model: ItemSistemaArquivosModel): QuestaoResponse {
    if (model.tipo !== TipoItemEnum.QUESTAO || !model.questao) {
      throw new Error(
        `Item com ID ${model.id} não é uma questão ou não teve os dados da questão carregados.`,
      );
    }

    const response = new QuestaoResponse();

    response.id = model.id;
    response.titulo = model.titulo;
    response.criadoEm = model.criadoEm.toISOString();
    response.atualizadoEm = model.atualizadoEm.toISOString();

    response.dificuldade = model.questao.dificuldade;
    response.tipoQuestao = model.questao.tipoQuestao;
    response.descricao = model.questao.descricao;
    response.exemploRespostaIa = model.questao.exemploRespostaIa;
    response.pontuacao = model.questao.pontuacao;
    response.isModelo = model.questao.isModelo;
    response.textoRevisao = model.questao.textoRevisao;

    response.alternativas = (model.questao.alternativas || []).map((alt) =>
      AlternativaResponse.fromModel(alt),
    );

    return response;
  }
}
