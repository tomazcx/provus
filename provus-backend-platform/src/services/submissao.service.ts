import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, In } from 'typeorm';
import * as crypto from 'crypto';

import { CreateSubmissaoRequest } from 'src/http/controllers/backoffice/submissao/create-submissao/request';
import { AplicacaoService } from './aplicacao.service';
import { SubmissaoModel } from 'src/database/config/models/submissao.model';
import EstadoSubmissaoEnum from 'src/enums/estado-submissao.enum';
import { EstudanteService } from './estudante.service';
import { SubmissaoResultDto } from 'src/dto/result/submissao/submissao.result';

@Injectable()
export class SubmissaoService {
  constructor(
    private readonly aplicacaoService: AplicacaoService,
    private readonly estudanteService: EstudanteService,
    private readonly dataSource: DataSource,
    @InjectRepository(SubmissaoModel)
    private readonly submissaoRepository: Repository<SubmissaoModel>,
  ) {}

  async createSubmissao(
    body: CreateSubmissaoRequest,
  ): Promise<SubmissaoResultDto> {
    try {
      const aplicacao = await this.aplicacaoService.findByCode(
        body.codigoAcesso,
      );

      const submissaoSalva = await this.dataSource.transaction(
        async (manager) => {
          const estudanteInstance = this.estudanteService.createInstance({
            nome: body.nome,
            email: body.email,
          });

          const codigoEntrega =
            await this._generateUniqueSubmissionCode(manager);
          const hash = this._createShortHash(body.codigoAcesso);

          const novaSubmissao = this.submissaoRepository.create({
            aplicacao: aplicacao,
            codigoEntrega: codigoEntrega,
            estudante: estudanteInstance,
            hash: hash,
            estado: EstadoSubmissaoEnum.INICIADA,
            pontuacaoTotal: 0,
          });
          return manager.save(novaSubmissao);
        },
      );
      return new SubmissaoResultDto(submissaoSalva);
    } catch (error) {
      console.log('Falha ao criar a submissão', error);
      throw error;
    }
  }

  private async _generateUniqueSubmissionCode(
    manager: EntityManager,
  ): Promise<number> {
    let attempts = 0;
    const maxAttempts = 10;

    const activeStates = [
      EstadoSubmissaoEnum.INICIADA,
      EstadoSubmissaoEnum.ENVIADA,
      EstadoSubmissaoEnum.REABERTA,
      EstadoSubmissaoEnum.PAUSADA,
    ];

    while (attempts < maxAttempts) {
      const code = Math.floor(100000 + Math.random() * 900000);

      const existingSubmissao = await manager.findOne(SubmissaoModel, {
        where: { codigoEntrega: code, estado: In(activeStates) },
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

  private _createShortHash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 16);
  }
}
