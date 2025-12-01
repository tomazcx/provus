import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AvaliacaoRepository } from 'src/database/repositories/avaliacao.repository';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { QuestaoRepository } from 'src/database/repositories/questao.repository';
import { CreateAvaliacaoDto } from 'src/dto/request/avaliacao/create-avaliacao.dto';
import { AvaliacaoDto } from 'src/dto/result/avaliacao/avaliacao.dto';
import { ArquivoRepository } from 'src/database/repositories/arquivo.repository';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import TipoInfracaoEnum from 'src/enums/tipo-infracao.enum';
import { FindAllAvaliacaoDto } from 'src/dto/result/avaliacao/find-all-avaliacao.dto';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';

@Injectable()
export class AvaliacaoService {
  constructor(
    private readonly avaliacaoRepository: AvaliacaoRepository,
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
    private readonly questaoRepository: QuestaoRepository,
    private readonly arquivoRepository: ArquivoRepository,
  ) {}

  async findById(id: number, avaliador: AvaliadorModel): Promise<AvaliacaoDto> {
    const avaliacao = await this.avaliacaoRepository.findOne({
      where: { id, item: { avaliador: { id: avaliador.id } } },
      relations: [
        'item',
        'arquivos',
        'arquivos.arquivo',
        'arquivos.arquivo.item',
        'questoes',
        'questoes.questao',
        'questoes.questao.item',
        'questoes.questao.alternativas',
        'configuracaoAvaliacao',
        'configuracaoAvaliacao.configuracoesGerais',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.item',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.alternativas',
        'configuracaoAvaliacao.configuracoesSeguranca',
        'configuracaoAvaliacao.configuracoesSeguranca.punicoes',
      ],
    });

    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    const path = await this.itemSistemaArquivosRepository.findPathById(
      avaliacao.id,
    );

    return new AvaliacaoDto(avaliacao, path);
  }

  async findAllByPasta(
    pastaId: number,
    avaliadorId: number,
  ): Promise<FindAllAvaliacaoDto[]> {
    const avaliacoes = await this.avaliacaoRepository.findAllByPasta(
      pastaId,
      avaliadorId,
    );

    return avaliacoes.map((avaliacao) => new FindAllAvaliacaoDto(avaliacao));
  }

  async create(
    dto: CreateAvaliacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<AvaliacaoDto> {
    await this._validateAvaliacao(dto, avaliador);

    const avaliacaoId = await this.avaliacaoRepository.createAvaliacao(
      dto,
      avaliador,
    );

    return this.findById(avaliacaoId, avaliador);
  }

  async update(
    id: number,
    dto: CreateAvaliacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<AvaliacaoDto> {
    const avaliacao = await this.avaliacaoRepository.findOne({
      where: { id, item: { avaliador: { id: avaliador.id } } },
      relations: [
        'item',
        'arquivos',
        'arquivos.arquivo',
        'arquivos.arquivo.item',
        'questoes',
        'questoes.questao',
        'questoes.questao.item',
        'questoes.questao.alternativas',
        'configuracaoAvaliacao',
        'configuracaoAvaliacao.configuracoesGerais',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.item',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.alternativas',
        'configuracaoAvaliacao.configuracoesSeguranca',
        'configuracaoAvaliacao.configuracoesSeguranca.punicoes',
      ],
    });

    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    await this._validateAvaliacao(dto, avaliador);

    const avaliacaoId = await this.avaliacaoRepository.updateAvaliacao(
      id,
      dto,
      avaliador,
    );

    return this.findById(avaliacaoId, avaliador);
  }

  private async _validateAvaliacao(
    dto: CreateAvaliacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<void> {
    if (dto.isModelo) {
      const pai = await this.itemSistemaArquivosRepository.findOne({
        where: {
          id: dto.paiId,
          tipo: TipoItemEnum.PASTA,
          avaliador: { id: avaliador.id },
        },
      });

      if (!pai) {
        throw new BadRequestException(
          `Pasta com id ${dto.paiId} não encontrada.`,
        );
      }
    }

    for (const questao of dto.questoes) {
      if (questao.questaoId) {
        const questaoModel = await this.questaoRepository.findOne({
          where: {
            id: questao.questaoId,
            item: { avaliador: { id: avaliador.id } },
          },
        });

        if (!questaoModel) {
          throw new BadRequestException(
            `Questão com id ${questao.questaoId} não encontrada`,
          );
        }
      }
    }

    for (const arquivo of dto.arquivos) {
      const arquivoModel = await this.arquivoRepository.findOne({
        where: {
          id: arquivo.arquivoId,
          item: { avaliador: { id: avaliador.id } },
        },
      });

      if (!arquivoModel) {
        throw new BadRequestException(
          `Arquivo com id ${arquivo.arquivoId} não encontrado`,
        );
      }
    }

    if (
      dto.configuracoesAvaliacao.configuracoesSeguranca
        .ativarCorrecaoDiscursivaViaIa
    ) {
      for (const questao of dto.questoes) {
        if (
          !questao.questaoId &&
          questao.tipoQuestao === TipoQuestaoEnum.DISCURSIVA &&
          !questao.exemploRespostaIa
        ) {
          throw new BadRequestException(
            `A questão "${questao.titulo || 'Nova Questão'}" é discursiva e requer um exemplo de resposta para a correção por I.A.`,
          );
        }
      }
    }

    if (
      !dto.configuracoesAvaliacao.configuracoesSeguranca.proibirCopiarColar &&
      dto.configuracoesAvaliacao.configuracoesSeguranca.punicoes.find(
        (p) => p.tipoInfracao === TipoInfracaoEnum.COPIAR_COLAR,
      )
    ) {
      throw new BadRequestException(
        'Punições para copiar colar não podem ser configuradas sem proibir copiar colar',
      );
    }

    if (
      !dto.configuracoesAvaliacao.configuracoesSeguranca.proibirTrocarAbas &&
      dto.configuracoesAvaliacao.configuracoesSeguranca.punicoes.find(
        (p) => p.tipoInfracao === TipoInfracaoEnum.TROCA_ABAS,
      )
    ) {
      throw new BadRequestException(
        'Punições para troca de abas não podem ser configuradas sem proibir troca de abas',
      );
    }

    for (const configuracaoRandomizacao of dto.configuracoesAvaliacao
      .configuracoesGerais.configuracoesRandomizacao) {
      for (const questaoId of configuracaoRandomizacao.questoes) {
        const questaoModel = await this.questaoRepository.findOne({
          where: { id: questaoId, item: { avaliador: { id: avaliador.id } } },
        });

        if (!questaoModel) {
          throw new BadRequestException(
            `Questão com id ${questaoId} não encontrada`,
          );
        }
      }
    }
  }
}
