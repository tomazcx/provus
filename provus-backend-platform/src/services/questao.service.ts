import { Injectable, NotFoundException } from '@nestjs/common';
import { AlternativaModel } from 'src/database/config/models/alternativa.model';
import {
  QuestaoRepository,
  RawQuestaoWithPath,
} from 'src/database/repositories/questao.repository';
import { AlternativaResultDto } from 'src/dto/result/alternativa/alternativa.result';
import { QuestaoResultDto } from 'src/dto/result/questao/questao.result';

@Injectable()
export class QuestaoService {
  constructor(private readonly questaoRepository: QuestaoRepository) {}

  private mapRawToDto(
    raw: RawQuestaoWithPath & { alternativas: AlternativaModel[] },
  ): QuestaoResultDto {
    const dto = new QuestaoResultDto();

    dto.id = raw.id;
    dto.titulo = raw.titulo;
    dto.path = raw.path;
    dto.criadoEm = raw.criado_em.toISOString();
    dto.atualizadoEm = raw.atualizado_em.toISOString();
    dto.descricao = raw.descricao;
    dto.dificuldade = raw.dificuldade;
    dto.exemploRespostaIa = raw.exemploRespostaIa;
    dto.pontuacao = raw.pontuacao;
    dto.isModelo = raw.isModelo;
    dto.tipoQuestao = raw.tipo_questao;
    dto.textoRevisao = raw.textoRevisao;

    dto.alternativas = (raw.alternativas || []).map((altModel) => {
      const altDto = new AlternativaResultDto();
      altDto.id = altModel.id;
      altDto.descricao = altModel.descricao;
      altDto.isCorreto = altModel.isCorreto;
      return altDto;
    });

    return dto;
  }

  async findById(id: number): Promise<QuestaoResultDto> {
    const questaoComAlternativas =
      await this.questaoRepository.findByIdComPath(id);

    if (!questaoComAlternativas) {
      throw new NotFoundException('Questão não encontrada');
    }
    return this.mapRawToDto(questaoComAlternativas);
  }
}
