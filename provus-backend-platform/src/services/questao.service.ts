import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import { QuestaoResultDto } from 'src/dto/result/questao/questao.result';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { CreateQuestaoRequest } from 'src/http/controllers/backoffice/questao/create-questao/request';
import { QuestaoRepository } from 'src/database/repositories/questao.repository';
import { UpdateQuestaoRequest } from 'src/http/controllers/backoffice/questao/update-questao/request';
import { AlternativaModel } from 'src/database/config/models/alternativa.model';
import { ItemSistemaArquivosModel } from 'src/database/config/models/item-sistema-arquivos.model';
import { DataSource, In } from 'typeorm';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import TipoItemEnum from 'src/enums/tipo-item.enum';

@Injectable()
export class QuestaoService {
  constructor(
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
    private readonly questaoRepository: QuestaoRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findById(
    id: number,
    avaliador: AvaliadorModel,
  ): Promise<QuestaoResultDto> {
    const questaoModel = await this.questaoRepository.findOne({
      where: { id, item: { avaliador: { id: avaliador.id } } },
      relations: ['alternativas', 'item'],
    });

    if (!questaoModel) {
      throw new NotFoundException('Questão não encontrada');
    }

    const path = await this.itemSistemaArquivosRepository.findPathById(id);

    return new QuestaoResultDto(questaoModel, path);
  }

  async findAllByPasta(
    pastaId: number | null,
    avaliadorId: number,
  ): Promise<QuestaoResultDto[]> {
    const questoesModels = await this.questaoRepository.findAllByPasta(
      pastaId,
      avaliadorId,
    );

    const dtosPromises = questoesModels.map(async (questaoModel) => {
      const path = await this.itemSistemaArquivosRepository.findPathById(
        questaoModel.id,
      );

      return new QuestaoResultDto(questaoModel, path);
    });

    return Promise.all(dtosPromises);
  }

  async create(
    dto: CreateQuestaoRequest,
    avaliador: AvaliadorModel,
  ): Promise<QuestaoResultDto> {
    const pai = await this.itemSistemaArquivosRepository.findOne({
      where: {
        id: dto.paiId,
        tipo: TipoItemEnum.PASTA,
        avaliador: { id: avaliador.id },
      },
    });

    if (!pai) {
      throw new BadRequestException(
        `Pasta com id ${dto.paiId} não encontrada.`,
      );
    }

    const newQuestaoId = await this.questaoRepository.createQuestao(
      dto,
      avaliador,
    );

    return this.findById(newQuestaoId, avaliador);
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

      return new QuestaoResultDto(questaoAtualizada, path);
    });

    return resultDto;
  }

  async findByIds(
    questionIds: number[],
    avaliadorId: number,
  ): Promise<QuestaoResultDto[]> {
    if (questionIds.length === 0) {
      return [];
    }

    const questoesModels = await this.questaoRepository.find({
      where: {
        id: In(questionIds),
        item: { avaliador: { id: avaliadorId } },
      },
      relations: ['item', 'alternativas'],
    });

    const dtosPromises = questoesModels.map(async (questaoModel) => {
      const path = await this.itemSistemaArquivosRepository.findPathById(
        questaoModel.id,
      );

      return new QuestaoResultDto(questaoModel, path);
    });

    return Promise.all(dtosPromises);
  }
}
