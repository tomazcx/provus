import { BadRequestException } from '@nestjs/common';
import { EntityManager, DataSource, In } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AplicacaoRepository } from 'src/database/repositories/aplicacao.repository';
import { CreateAplicacaoDto } from 'src/dto/request/aplicacao/create-aplicacao.dto';
import { AplicacaoDto } from 'src/dto/result/aplicacao/aplicacao.dto';
import { FindAllAplicacaoDto } from 'src/dto/result/aplicacao/find-all-aplicacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import { AplicacaoModel } from 'src/database/config/models/aplicacao.model';

@Injectable()
export class AplicacaoService {
  constructor(
    private readonly aplicacaoRepository: AplicacaoRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: number, avaliador: AvaliadorModel): Promise<AplicacaoDto> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
      relations: [
        'avaliacao',
        'avaliacao.item',
        'avaliacao.arquivos',
        'avaliacao.questoes',
        'avaliacao.questoes.questao',
        'avaliacao.arquivos.arquivo',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.punicoes',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
        'avaliacao.configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais.configuracoesRandomizacao.poolDeQuestoes.alternativas',
      ],
    });

    if (!aplicacao) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    return new AplicacaoDto(aplicacao);
  }

  async findByCode(codigoAcesso: string): Promise<AplicacaoModel> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { codigoAcesso },
    });

    if (!aplicacao) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    return aplicacao;
  }

  async findAll(avaliadorId: number): Promise<FindAllAplicacaoDto[]> {
    const aplicacoes = await this.aplicacaoRepository.findAll(avaliadorId);

    return aplicacoes.map((aplicacao) => new FindAllAplicacaoDto(aplicacao));
  }

  async createAplicacao(
    dto: CreateAplicacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<AplicacaoDto> {
    return this.dataSource.transaction(async (manager) => {
      const codigoAcesso = await this.generateUniqueAccessCode(manager);

      const aplicacaoId = await this.aplicacaoRepository.createAplicacao(
        dto,
        codigoAcesso,
        avaliador,
      );

      return this.findById(aplicacaoId, avaliador);
    });
  }

  async update(
    id: number,
    estado: EstadoAplicacaoEnum,
    avaliador: AvaliadorModel,
  ): Promise<AplicacaoDto> {
    const aplicacao = await this.aplicacaoRepository.findOne({
      where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
      relations: [
        'avaliacao',
        'avaliacao.configuracaoAvaliacao',
        'avaliacao.configuracaoAvaliacao.configuracoesGerais',
      ],
    });

    if (!aplicacao) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    const aplicacaoId = await this.aplicacaoRepository.updateAplicacao(
      id,
      aplicacao.avaliacao,
      estado,
      avaliador,
    );

    return this.findById(aplicacaoId, avaliador);
  }

  async delete(id: number, avaliador: AvaliadorModel): Promise<void> {
    await this.aplicacaoRepository.deleteAplicacao(id, avaliador);
  }

  private async generateUniqueAccessCode(
    manager: EntityManager,
  ): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    const activeStates = [
      EstadoAplicacaoEnum.CRIADA,
      EstadoAplicacaoEnum.EM_ANDAMENTO,
      EstadoAplicacaoEnum.AGENDADA,
      EstadoAplicacaoEnum.PAUSADA,
    ];

    while (attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const existingAplicacao = await manager.findOne(AplicacaoModel, {
        where: { codigoAcesso: code, estado: In(activeStates) },
      });

      if (!existingAplicacao) {
        return code;
      }

      attempts++;
    }

    throw new BadRequestException(
      'Não foi possível gerar um código de acesso único após várias tentativas',
    );
  }
}
