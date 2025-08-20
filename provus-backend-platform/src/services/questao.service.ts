import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestaoModel } from 'src/database/config/models/questao.model';
import { AlternativaResultDto } from 'src/dto/result/alternativa/alternativa.result';
import { QuestaoResultDto } from 'src/dto/result/questao/questao.result';
import { ItemSistemaArquivosRepository } from 'src/database/repositories/item-sistema-arquivos.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class QuestaoService {
  constructor(
    @InjectRepository(QuestaoModel)
    private readonly questaoRepository: Repository<QuestaoModel>,
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
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
}
