import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubmissaoRequest } from 'src/http/controllers/backoffice/submissao/create-submissao/request';
import { AplicacaoService } from './aplicacao.service';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import { EstudanteService } from './estudante.service';

@Injectable()
export class SubmissaoService {
  constructor(
    private readonly aplicacaoService: AplicacaoService,
    private readonly estudanteService: EstudanteService,
    private readonly dataSource: DataSource,
    @InjectRepository(SubmissaoModel)
    private readonly submissaoRepository: Repository<SubmissaoModel>,
  ) {}

  async createSubmissao(body: CreateSubmissaoRequest) {
    try {
      const aplicacao = await this.aplicacaoService.findByCode(
        body.codigoAcesso,
      );

      return this.dataSource.transaction(async (manager) => {
        const estudanteInstance = this.estudanteService.createInstance({
          nome: body.nome,
          email: body.email,
        });
        const codigoEntrega = await this._generateUniqueAccessCode(manager);
        const hash = this._createSHA256Hash(body.codigoAcesso);

        const submissao = this.submissaoRepository.create({
          aplicacao: aplicacao,
          codigoEntrega: codigoEntrega,
          estudante: estudanteInstance,
          hash: hash,
          estado: EstadoSubmissaoEnum.INICIADA,
          pontuacaoTotal: 0,
        });

        await this.submissaoRepository.save(submissao);

        await this.dataSource.destroy();
      });
    } catch (error) {
      console.log(error);
    }
  }

  private async _generateUniqueAccessCode(
    manager: EntityManager,
  ): Promise<number> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000);

      const existingSubmissao = await manager.findOne(SubmissaoModel, {
        where: { codigoEntrega: code },
      });

      if (!existingSubmissao) {
        return code;
      }

      attempts++;
    }
    throw new BadRequestException(
      'Não foi possível gerar um código de entrega após várias tentativas',
    );
  }

  private _createSHA256Hash(data: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }
}
