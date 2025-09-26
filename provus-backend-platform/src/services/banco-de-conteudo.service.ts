import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BancoDeConteudoModel } from 'src/database/config/models/banco-de-conteudo.model';
import { TipoBancoEnum } from 'src/enums/tipo-banco';
import { BancoDeConteudoResponse } from 'src/http/models/response/banco-de-conteudo.response';
import { Repository } from 'typeorm';
import { ItemSistemaArquivosService } from './item-sistema-arquivos.service';

@Injectable()
export class BancoDeConteudoService {
  constructor(
    @InjectRepository(BancoDeConteudoModel)
    private readonly bancoRepository: Repository<BancoDeConteudoModel>,
    private readonly itemSistemaArquivosService: ItemSistemaArquivosService,
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
  ): Promise<any[]> {
    const banco = await this.bancoRepository.findOne({
      where: { avaliadorId, tipoBanco },
      relations: ['pastaRaiz'],
    });

    if (!banco || !banco.pastaRaiz) {
      throw new NotFoundException(
        `Banco do tipo "${tipoBanco}" não encontrado.`,
      );
    }

    return this.itemSistemaArquivosService.findByFolder(
      banco.pastaRaiz.id,
      avaliadorId,
    );
  }
}
