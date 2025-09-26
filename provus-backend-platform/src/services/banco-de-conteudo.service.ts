import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BancoDeConteudoModel } from 'src/database/config/models/banco-de-conteudo.model';
import { TipoBancoEnum } from 'src/enums/tipo-banco';
import { BancoDeConteudoResponse } from 'src/http/models/response/banco-de-conteudo.response';
import { ItemSistemaArquivosResponse } from 'src/http/models/response/item-sitema-arquivos.response';
import { Repository } from 'typeorm';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import TipoItemEnum from 'src/enums/tipo-item.enum';
import { QuestaoResponse } from 'src/http/models/response/questao.response';

type ConteudoBancoResponse = ItemSistemaArquivosResponse | QuestaoResponse;

@Injectable()
export class BancoDeConteudoService {
  constructor(
    @InjectRepository(BancoDeConteudoModel)
    private readonly bancoRepository: Repository<BancoDeConteudoModel>,
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
  ) {}

  async findAllForAvaliador(
    avaliadorId: number,
  ): Promise<BancoDeConteudoResponse[]> {
    const bancos = await this.bancoRepository.find({
      where: { avaliadorId },
      relations: ['pastaRaiz'],
    });

    return bancos.map((banco) => BancoDeConteudoResponse.fromModel(banco));
  }

  async findConteudoByTipo(
    avaliadorId: number,
    tipoBanco: TipoBancoEnum,
  ): Promise<ConteudoBancoResponse[]> {
    const banco = await this.bancoRepository.findOne({
      where: { avaliadorId, tipoBanco },
      relations: ['pastaRaiz'],
    });

    if (!banco || !banco.pastaRaiz) {
      throw new NotFoundException(
        `Banco do tipo "${tipoBanco}" não encontrado.`,
      );
    }

    const pastaRaizId = banco.pastaRaiz.id;

    const items = await this.itemSistemaArquivosRepository.findByParent(
      pastaRaizId,
      avaliadorId,
    );

    return items.map((item) => {
      if (item.tipo === TipoItemEnum.QUESTAO && item.questao) {
        return QuestaoResponse.fromModel(item);
      }

      return ItemSistemaArquivosResponse.fromModel(item);
    });
  }
}
