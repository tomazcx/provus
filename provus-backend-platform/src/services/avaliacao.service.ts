import { Injectable, NotFoundException } from '@nestjs/common';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AvaliacaoRepository } from 'src/database/repositories/avaliacao.repository';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { CreateAvaliacaoDto } from 'src/dto/request/avaliacao/create-avaliacao.dto';
import { AvaliacaoDto } from 'src/dto/result/avaliacao/avaliacao.dto';

@Injectable()
export class AvaliacaoService {
  constructor(
    private readonly avaliacaoRepository: AvaliacaoRepository,
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
  ) {}

  async findById(id: number, avaliador: AvaliadorModel): Promise<AvaliacaoDto> {
    const avaliacao = await this.avaliacaoRepository.findOne({
      where: { id, item: { avaliador: { id: avaliador.id } } },
      relations: [
        'configuracaoAvaliacao',
        'configuracaoAvaliacao.configuracoesGerais',
        'configuracaoAvaliacao.configuracoesSeguranca',
        'configuracaoAvaliacao.configuracoesSeguranca.punicoes',
        'configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
        'configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
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

  async create(
    dto: CreateAvaliacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<AvaliacaoDto> {
    const avaliacaoId = await this.avaliacaoRepository.createAvaliacao(
      dto,
      avaliador,
    );

    return this.findById(avaliacaoId, avaliador);
  }
}
