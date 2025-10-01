import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { ArquivoModel } from '../config/models/arquivo.model';
import { CreateArquivoDto } from 'src/dto/request/arquivo/create-arquivo.dto';
import { TipoBancoEnum } from 'src/enums/tipo-banco';
import { InjectRepository } from '@nestjs/typeorm';
import { BancoDeConteudoModel } from '../config/models/banco-de-conteudo.model';

@Injectable()
export class ArquivoRepository extends Repository<ArquivoModel> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(BancoDeConteudoModel)
    private readonly bancoDeConteudoRepository: Repository<BancoDeConteudoModel>,
  ) {
    super(ArquivoModel, dataSource.createEntityManager());
  }

  async createArquivo(
    dto: CreateArquivoDto,
    avaliador: AvaliadorModel,
  ): Promise<number> {
    let paiIdParaSalvar: number | null = dto.paiId;

    if (!paiIdParaSalvar) {
      const banco = await this.bancoDeConteudoRepository.findOne({
        where: {
          avaliadorId: avaliador.id,
          tipoBanco: TipoBancoEnum.MATERIAIS,
        },
        relations: ['pastaRaiz'],
      });
      if (banco && banco.pastaRaiz) {
        paiIdParaSalvar = banco.pastaRaiz.id;
      }
    }

    const query = `
      WITH novo_arquivo AS (
        INSERT INTO "item_sistema_arquivos" ("titulo", "tipo", "avaliador_id", "pai_id")
        VALUES ($1, $2, $3, $4)
        RETURNING id
      )
      INSERT INTO "arquivo" ( "id", "url", "descricao", "tamanho_em_bytes" )
      SELECT id, $5, $6, $7 FROM novo_arquivo
      RETURNING id;
    `;

    const params = [
      dto.titulo,
      TipoItemEnum.ARQUIVO,
      avaliador.id,
      paiIdParaSalvar,
      dto.url,
      dto.descricao,
      dto.tamanhoEmBytes,
    ];

    const result: { id: number }[] = await this.dataSource.manager.query(
      query,
      params,
    );
    return result[0].id;
  }

  async findAllByPasta(
    pastaId: number | null,
    avaliadorId: number,
  ): Promise<ArquivoModel[]> {
    return this.find({
      where: {
        item: {
          tipo: TipoItemEnum.ARQUIVO,
          avaliador: { id: avaliadorId },
          pai: pastaId === null ? IsNull() : { id: pastaId },
        },
      },
      relations: ['item'],
    });
  }
}
