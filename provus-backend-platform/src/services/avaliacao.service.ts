import {
  BadRequestException,
  ForbiddenException,
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
        'arquivos',
        'questoes',
        'questoes.questao',
        'arquivos.arquivo',
        'configuracaoAvaliacao',
        'configuracaoAvaliacao.configuracoesGerais',
        'configuracaoAvaliacao.configuracoesSeguranca',
        'configuracaoAvaliacao.configuracoesSeguranca.punicoes',
        'configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
        'configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
        'configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.alternativas',
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

    for (const questao of dto.questoes) {
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
      !dto.configuracoesAvaliacao.configuracoesSeguranca.ativarControleIp &&
      dto.configuracoesAvaliacao.configuracoesSeguranca.ipsPermitidos.length > 0
    ) {
      throw new BadRequestException(
        'IPs permitidos não podem ser configurados sem ativar controle de IP',
      );
    }

    if (
      !dto.configuracoesAvaliacao.configuracoesSeguranca.proibirPrintScreen &&
      dto.configuracoesAvaliacao.configuracoesSeguranca.punicoes.find(
        (p) => p.tipoInfracao === TipoInfracaoEnum.PRINT_SCREEN,
      )
    ) {
      throw new BadRequestException(
        'Punições para print screen não podem ser configuradas sem proibir print screen',
      );
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
      !dto.configuracoesAvaliacao.configuracoesSeguranca.proibirDevtools &&
      dto.configuracoesAvaliacao.configuracoesSeguranca.punicoes.find(
        (p) => p.tipoInfracao === TipoInfracaoEnum.DEV_TOOLS,
      )
    ) {
      throw new BadRequestException(
        'Punições para devtools não podem ser configuradas sem proibir devtools',
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
