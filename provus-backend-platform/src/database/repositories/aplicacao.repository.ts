import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { AplicacaoModel } from '../config/models/aplicacao.model';
import { CreateAplicacaoDto } from 'src/dto/request/aplicacao/create-aplicacao.dto';
import EstadoAplicacaoEnum from 'src/enums/estado-aplicacao.enum';
import { AvaliacaoModel } from '../config/models/avaliacao.model';

@Injectable()
export class AplicacaoRepository extends Repository<AplicacaoModel> {
  constructor(private dataSource: DataSource) {
    super(AplicacaoModel, dataSource.createEntityManager());
  }

  async createAplicacao(dto: CreateAplicacaoDto): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const aplicacao = new AplicacaoModel();
      aplicacao.codigoAcesso = '123456'; // TODO - logica de novo código
      aplicacao.dataInicio = new Date(); // TODO - talvez se ela for do tipo instantanea, coocar um new Date()?;
      aplicacao.estado = dto.estado;

      const avaliacaoEntity = await manager.findOne(AvaliacaoModel, {
        where: { id: dto.avaliacaoId },
        relations: [
          'configuracaoAvaliacao',
          'configuracaoAvaliacao.configuracoesGerais',
        ],
      });

      if (!avaliacaoEntity) {
        throw new BadRequestException(
          `Avaliação com ID ${dto.avaliacaoId} não encontrada`,
        );
      }

      const tempoMaximoMs =
        avaliacaoEntity.configuracaoAvaliacao.configuracoesGerais.tempoMaximo *
        60 *
        1000;
      aplicacao.dataFim = new Date(
        aplicacao.dataInicio.getTime() + tempoMaximoMs,
      );

      aplicacao.avaliacao = avaliacaoEntity;

      const savedAplicacao = await manager.save(aplicacao);

      return savedAplicacao.id;
    });
  }

  async updateAplicacao(
    id: number,
    avaliacao: AvaliacaoModel,
    estado: EstadoAplicacaoEnum,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const aplicacao = await manager.findOne(AplicacaoModel, {
        where: { id, avaliacao: { item: { avaliador: { id: avaliador.id } } } },
      });

      aplicacao.estado = estado; // TODO: Veirifcar se essa é a lógica certa para dar update. O update deve ser feito na avaliação, então talvez aqui mude bastante a lógica
      const updatedAplicacao = await manager.save(aplicacao);

      return updatedAplicacao.id;
    });
  }

  async findAll(avaliadorId: number): Promise<AplicacaoModel[]> {
    return this.find({
      where: {
        avaliacao: {
          item: {
            avaliador: { id: avaliadorId },
          },
        },
      },
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
  }
}
