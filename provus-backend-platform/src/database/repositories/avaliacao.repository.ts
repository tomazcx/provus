import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { AvaliacaoModel } from '../config/models/avaliacao.model';
import { CreateAvaliacaoDto } from 'src/dto/request/avaliacao/create-avaliacao.dto';
import { ItemSistemaArquivosModel } from '../config/models/item-sistema-arquivos.model';
import { ConfiguracaoAvaliacaoModel } from '../config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from '../config/models/configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from '../config/models/configuracoes-seguranca.model';
import { PunicaoPorOcorrenciaModel } from '../config/models/punicao-por-ocorrencia.model';
import { IpsPermitidosModel } from '../config/models/ips-permitidos.model';
import { ConfiguracaoNotificacaoModel } from '../config/models/configuracao-notificacao.model';

@Injectable()
export class AvaliacaoRepository extends Repository<AvaliacaoModel> {
  constructor(private dataSource: DataSource) {
    super(AvaliacaoModel, dataSource.createEntityManager());
  }

  async createAvaliacao(
    dto: CreateAvaliacaoDto,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      const itemSistemaArquivos = new ItemSistemaArquivosModel();
      itemSistemaArquivos.titulo = dto.titulo;
      itemSistemaArquivos.tipo = TipoItemEnum.AVALIACAO;
      itemSistemaArquivos.avaliador = avaliador;

      if (dto.paiId) {
        const pai = await manager.findOne(ItemSistemaArquivosModel, {
          where: { id: dto.paiId },
        });
        itemSistemaArquivos.pai = pai;
      }

      const savedItem = await manager.save(itemSistemaArquivos);

      const configuracoesGerais = new ConfiguracoesGeraisModel();
      Object.assign(
        configuracoesGerais,
        dto.configuracoesAvaliacao.configuracoesGerais,
      );

      const savedConfigGerais = await manager.save(configuracoesGerais);

      const configuracoesSeguranca = new ConfiguracoesSegurancaModel();

      const {
        punicoes,
        ipsPermitidos,
        notificacoes,
        ...configSegurancaFields
      } = dto.configuracoesAvaliacao.configuracoesSeguranca;

      Object.assign(configuracoesSeguranca, configSegurancaFields);

      const savedConfigSeguranca = await manager.save(configuracoesSeguranca);

      if (punicoes && punicoes.length > 0) {
        const punicoesEntities = punicoes.map((punicaoDto) => {
          const punicao = new PunicaoPorOcorrenciaModel();
          Object.assign(punicao, punicaoDto);
          punicao.configuracaoSeguranca = savedConfigSeguranca;
          return punicao;
        });

        await manager.save(punicoesEntities);
      }

      if (ipsPermitidos && ipsPermitidos.length > 0) {
        const ipsPermitidosEntities = ipsPermitidos.map((ip) => {
          const ipPermitido = new IpsPermitidosModel();
          ipPermitido.ip = ip;
          ipPermitido.configuracaoSeguranca = savedConfigSeguranca;
          return ipPermitido;
        });

        await manager.save(ipsPermitidosEntities);
      }

      if (notificacoes && notificacoes.length > 0) {
        const notificacoesEntities = notificacoes.map((tipoNotificacao) => {
          const notificacao = new ConfiguracaoNotificacaoModel();
          notificacao.tipoNotificacao = tipoNotificacao;
          notificacao.configuracaoSeguranca = savedConfigSeguranca;
          return notificacao;
        });

        await manager.save(notificacoesEntities);
      }

      const avaliacao = new AvaliacaoModel();
      avaliacao.id = savedItem.id;
      avaliacao.item = savedItem;
      avaliacao.descricao = dto.descricao;
      avaliacao.isModelo = dto.isModelo;

      const savedAvaliacao = await manager.save(avaliacao);

      const configuracaoAvaliacao = new ConfiguracaoAvaliacaoModel();

      configuracaoAvaliacao.configuracoesGerais = savedConfigGerais;
      configuracaoAvaliacao.configuracoesSeguranca = savedConfigSeguranca;

      const savedConfiguracaoAvaliacao = await manager.save(
        configuracaoAvaliacao,
      );

      await manager.save(savedConfigGerais);
      await manager.save(savedConfigSeguranca);

      savedAvaliacao.configuracaoAvaliacao = savedConfiguracaoAvaliacao;
      await manager.save(savedAvaliacao);

      return savedAvaliacao.id;
    });
  }

  async findAllByPasta(
    pastaId: number | null,
    avaliadorId: number,
  ): Promise<AvaliacaoModel[]> {
    return this.find({
      where: {
        item: {
          tipo: TipoItemEnum.AVALIACAO,
          avaliador: { id: avaliadorId },
          pai: pastaId === null ? IsNull() : { id: pastaId },
        },
      },
      relations: [
        'item',
        'configuracaoAvaliacao',
        'configuracaoAvaliacao.configuracoesGerais',
        'configuracaoAvaliacao.configuracoesSeguranca',
        'configuracaoAvaliacao.configuracoesSeguranca.punicoes',
        'configuracaoAvaliacao.configuracoesSeguranca.ipsPermitidos',
        'configuracaoAvaliacao.configuracoesSeguranca.notificacoes',
      ],
    });
  }
}
