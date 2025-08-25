import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import { AlternativaResultDto } from 'src/dto/result/alternativa/alternativa.result';
import { QuestaoResultDto } from 'src/dto/result/questao/questao.result';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { CreateQuestaoRequest } from 'src/http/controllers/backoffice/questao/create-questao/request';
import { QuestaoRepository } from 'src/database/repositories/questao.repository';
import { UpdateQuestaoRequest } from 'src/http/controllers/backoffice/questao/update-questao/request';
import { AlternativaModel } from 'src/database/config/models/alternativa.model';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { DataSource } from 'typeorm';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Injectable()
export class QuestaoService {
  constructor(
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
    private readonly questaoRepository: QuestaoRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findById(id: number): Promise<QuestaoResultDto> {
    const questaoModel = await this.questaoRepository.findOne({
      where: { id },
      relations: ['alternativas', 'item'],
    });

    if (!questaoModel) {
      throw new NotFoundException('Questão não encontrada');
    }

    const path = await this.itemSistemaArquivosRepository.findPathById(id);

    const dto = new QuestaoResultDto();
    dto.id = questaoModel.id;
    dto.titulo = questaoModel.item.titulo;
    dto.path = path;
    dto.criadoEm = questaoModel.item.criadoEm.toISOString();
    dto.atualizadoEm = questaoModel.item.atualizadoEm.toISOString();
    dto.descricao = questaoModel.descricao;
    dto.dificuldade = questaoModel.dificuldade;
    dto.exemploRespostaIa = questaoModel.exemploRespostaIa;
    dto.pontuacao = questaoModel.pontuacao;
    dto.isModelo = questaoModel.isModelo;
    dto.tipoQuestao = questaoModel.tipoQuestao;
    dto.textoRevisao = questaoModel.textoRevisao;

    dto.alternativas = (questaoModel.alternativas || []).map((altModel) => {
      const altDto = new AlternativaResultDto();
      altDto.id = altModel.id;
      altDto.descricao = altModel.descricao;
      altDto.isCorreto = altModel.isCorreto;
      return altDto;
    });

    return dto;
  }

  async create(
    dto: CreateQuestaoRequest,
    avaliador: AvaliadorModel,
  ): Promise<QuestaoResultDto> {
    const newQuestaoId = await this.questaoRepository.createQuestao(
      dto,
      avaliador,
    );

    return this.findById(newQuestaoId);
  }

  async update(
    id: number,
    avaliadorId: number,
    dto: UpdateQuestaoRequest,
  ): Promise<QuestaoResultDto> {
    const resultDto = await this.dataSource.transaction(async (manager) => {
      const questaoRepo = manager.getRepository(QuestaoModel);
      const itemRepo = manager.getRepository(ItemSistemaArquivosModel);

      const questao = await questaoRepo.findOne({
        where: { id, item: { avaliador: { id: avaliadorId } } },
        relations: ['item'],
      });

      if (!questao) {
        throw new NotFoundException(
          `Questão com id ${id} não encontrada ou não pertence a você.`,
        );
      }

      if (dto.titulo !== undefined) {
        questao.item.titulo = dto.titulo;
        await itemRepo.save(questao.item);
      }

      if (dto.dificuldade !== undefined) questao.dificuldade = dto.dificuldade;
      if (dto.tipoQuestao !== undefined) questao.tipoQuestao = dto.tipoQuestao;
      if (dto.descricao !== undefined) questao.descricao = dto.descricao;
      if (dto.exemploRespostaIa !== undefined)
        questao.exemploRespostaIa = dto.exemploRespostaIa;
      if (dto.textoRevisao !== undefined)
        questao.textoRevisao = dto.textoRevisao;
      if (dto.pontuacao !== undefined) questao.pontuacao = dto.pontuacao;

      await questaoRepo.save(questao);

      if (dto.alternativas !== undefined) {
        const alternativaRepo = manager.getRepository(AlternativaModel);
        await alternativaRepo.delete({ questao: { id: id } });

        if (dto.alternativas.length > 0) {
          const novasAlternativas = dto.alternativas.map((altDto) =>
            alternativaRepo.create({ ...altDto, questao }),
          );
          await alternativaRepo.save(novasAlternativas);
        }
      }

      const questaoAtualizada = await manager.findOne(QuestaoModel, {
        where: { id },
        relations: ['alternativas', 'item'],
      });

      const path = await this.itemSistemaArquivosRepository.findPathById(id);

      const responseDto = new QuestaoResultDto();
      responseDto.id = questaoAtualizada.id;
      responseDto.titulo = questaoAtualizada.item.titulo;
      responseDto.path = path;
      responseDto.criadoEm = questaoAtualizada.item.criadoEm.toISOString();
      responseDto.atualizadoEm =
        questaoAtualizada.item.atualizadoEm.toISOString();
      responseDto.descricao = questaoAtualizada.descricao;
      responseDto.dificuldade = questaoAtualizada.dificuldade;
      responseDto.exemploRespostaIa = questaoAtualizada.exemploRespostaIa;
      responseDto.pontuacao = questaoAtualizada.pontuacao;
      responseDto.isModelo = questaoAtualizada.isModelo;
      responseDto.tipoQuestao = questaoAtualizada.tipoQuestao;
      responseDto.textoRevisao = questaoAtualizada.textoRevisao;
      responseDto.alternativas = (questaoAtualizada.alternativas || []).map(
        (altModel) => {
          const altDto = new AlternativaResultDto();
          altDto.id = altModel.id;
          altDto.descricao = altModel.descricao;
          altDto.isCorreto = altModel.isCorreto;
          return altDto;
        },
      );

      return responseDto;
    });

    return resultDto;
  }
}
