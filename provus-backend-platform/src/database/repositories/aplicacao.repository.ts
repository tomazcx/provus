import { Injectable } from '@nestjs/common';
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
      });
      if (!avaliacaoEntity) {
        throw new Error(`Avaliacao base ${dto.avaliacaoId} não encontrada`);
      }
      aplicacao.avaliacao = avaliacaoEntity;

      const savedAplicacao = await manager.save(aplicacao);

      //   if (dto.avaliacao.questoes && dto.avaliacao.questoes.length > 0) {
      //     const questoesAplicacoes = dto.avaliacao.questoes.map((questaoDto) => {
      //       const questaoAplicacao = new QuestoesAvaliacoesModel();
      //       questaoAplicacao.questaoId = questaoDto.id;
      //       questaoAplicacao.avaliacaoId = savedAplicacao.avaliacao.id;
      //       questaoAplicacao.ordem = questaoDto.;
      //       questaoAplicacao.pontuacao = questaoDto.pontuacao;
      //       return questaoAplicacao;
      //     });

      //     await manager.save(questoesAplicacoes);
      //   }

      //   if (dto.avaliacao.arquivos && dto.avaliacao.arquivos.length > 0) {
      //     const arquivosAplicacoes = dto.avaliacao.arquivos.map((arquivoDto) => {
      //       const arquivoAplicacao = new ArquivosAvaliacoesModel();
      //       arquivoAplicacao.arquivoId = arquivoDto.arquivoId;
      //       arquivoAplicacao.avaliacaoId = savedAplicacao.avaliacao.id;
      //       arquivoAplicacao.permitirConsultaPorEstudante =
      //         arquivoDto.permitirConsultaPorEstudante;
      //       return arquivoAplicacao;
      //     });

      //     await manager.save(arquivosAplicacoes);
      //   }

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
      relations: ['avaliacao', 'avaliacao.item'],
    });
  }
}
