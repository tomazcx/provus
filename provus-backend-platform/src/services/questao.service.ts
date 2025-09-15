import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
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
import { CreateAiQuestaoDto } from 'src/dto/request/questao/create-ai-questao.dto';
import { GeneratedQuestaoDto } from 'src/dto/result/questao/generated-questao.result';
import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/enums/tipo-questao.enum';
import { TextExtractorService } from 'src/providers/text-extractor.provider';
import { ArquivoService } from './arquivo.service';
import { GenerateQuestaoFromFileRequestDto } from 'src/http/models/request/generate-questao-from-file.request';
import { AbstractAiProvider } from 'src/providers/ai/interface/ai-provider.abstract';
import { AI_PROVIDER } from 'src/providers/providers.module';

@Injectable()
export class QuestaoService {
  constructor(
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
    private readonly questaoRepository: QuestaoRepository,
    private readonly dataSource: DataSource,
    private readonly arquivoService: ArquivoService,
    private readonly textExtractorService: TextExtractorService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AbstractAiProvider,
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

  async createByFile(
    dto: GenerateQuestaoFromFileRequestDto,
    uploadedFiles: Express.Multer.File[],
    user: AvaliadorModel,
  ): Promise<GeneratedQuestaoDto[]> {
    const MAX_CONTEXT_LENGTH = 70000;

    const contentSources: { buffer: Buffer; mimeType: string }[] = [];

    for (const file of uploadedFiles) {
      contentSources.push({ buffer: file.buffer, mimeType: file.mimetype });
    }

    if (dto.arquivoIds && dto.arquivoIds.length > 0) {
      const existingFiles = await this.arquivoService.findByIds(
        dto.arquivoIds,
        user.id,
      );
      for (const fileDto of existingFiles) {
        const response = await fetch(fileDto.url);
        const buffer = Buffer.from(await response.arrayBuffer());
        const mimeType = this._getMimeTypeFromUrl(fileDto.url);
        contentSources.push({ buffer, mimeType });
      }
    }

    if (contentSources.length === 0) {
      throw new BadRequestException(
        'Nenhum material foi fornecido para gerar as questões.',
      );
    }

    const rawExtractedTexts = await Promise.all(
      contentSources.map((source) =>
        this.textExtractorService.extractTextFromFile(
          source.buffer,
          source.mimeType,
        ),
      ),
    );

    const cleanedTexts = rawExtractedTexts.map((text) =>
      this._cleanExtractedText(text),
    );

    let contexto = cleanedTexts.join('\n\n---\n\n');

    if (contexto.length > MAX_CONTEXT_LENGTH) {
      console.warn(
        `Contexto muito longo (${contexto.length} caracteres). Truncando para ${MAX_CONTEXT_LENGTH}.`,
      );
      contexto =
        contexto.substring(0, MAX_CONTEXT_LENGTH) +
        '\n\n[...CONTEÚDO TRUNCADO...]';
    }

    let promptTemplate = '';
    if (dto.tipoQuestao === TipoQuestaoEnum.DISCURSIVA) {
      promptTemplate = this._getDiscursivePromptFromFile(contexto, dto);
    } else {
      promptTemplate = this._getAlternativesPromptFromFile(contexto, dto);
    }

    return this._callAiAndParseResponse(promptTemplate);
  }

  async createByAi(dto: CreateAiQuestaoDto): Promise<GeneratedQuestaoDto[]> {
    const { assunto, dificuldade, tipoQuestao, quantidade } = dto;

    let promptTemplate = '';

    if (tipoQuestao === TipoQuestaoEnum.DISCURSIVA) {
      promptTemplate = this._getDiscursivePrompt(
        assunto,
        dificuldade,
        quantidade,
      );
    } else {
      promptTemplate = this._getAlternativesPrompt(
        assunto,
        dificuldade,
        tipoQuestao,
        quantidade,
      );
    }

    return this._callAiAndParseResponse(promptTemplate);
  }

  private _getDiscursivePrompt(
    assunto: string,
    dificuldade: DificuldadeQuestaoEnum,
    quantidade: number,
  ): string {
    return `Aja como um especialista em criar questões para avaliações educacionais.

  Sua tarefa é criar ${quantidade} questão(ões) discursiva(s) sobre o assunto '${assunto}' com dificuldade '${dificuldade}'.

  A sua resposta deve ser APENAS um array JSON, mesmo que a quantidade seja 1. O array JSON deve conter ${quantidade} objeto(s), onde cada objeto segue estritamente a seguinte estrutura:

  [
    {
      "titulo": "Um título curto e informativo para a questão",
      "descricao": "O texto completo da questão discursiva, de forma clara e objetiva.",
      "dificuldade": "${dificuldade}",
      "exemplo_resposta": "Um exemplo detalhado de uma resposta que seria considerada 100% correta e bem fundamentada."
    }
  ]`;
  }

  private _getAlternativesPrompt(
    assunto: string,
    dificuldade: DificuldadeQuestaoEnum,
    tipoQuestao: TipoQuestaoEnum,
    quantidade: number,
  ): string {
    let instrucaoCorretas = '';
    if (tipoQuestao === TipoQuestaoEnum.OBJETIVA) {
      instrucaoCorretas =
        "Apenas UMA das alternativas deve ter o campo 'isCorreto' como true.";
    } else {
      instrucaoCorretas =
        "UMA OU MAIS alternativas podem ter o campo 'isCorreto' como true.";
    }

    return `Aja como um especialista em criar questões para avaliações educacionais.

  Sua tarefa é criar ${quantidade} questão(ões) do tipo '${tipoQuestao}' sobre o assunto '${assunto}' com dificuldade '${dificuldade}'.

  Regras importantes para as alternativas:
  - Crie um total de 5 alternativas para cada questão.
  - ${instrucaoCorretas}

  A sua resposta deve ser APENAS um array JSON, mesmo que a quantidade seja 1. O array JSON deve conter ${quantidade} objeto(s), onde cada objeto segue estritamente a seguinte estrutura, incluindo a chave "alternativas":

  [
    {
      "titulo": "Um título curto e informativo para a questão",
      "descricao": "O texto completo da questão, de forma clara e objetiva.",
      "dificuldade": "${dificuldade}",
      "exemplo_resposta": "Uma justificativa explicando qual(is) alternativa(s) está(ão) correta(s) e por quê. Priorizar objetividade para não ser longo. Priorizar objetividade para não ser longo.",
      "alternativas": [
        {
          "descricao": "Texto da primeira alternativa.",
          "isCorreto": true
        },
        {
          "descricao": "Texto da segunda alternativa.",
          "isCorreto": false
        }
      ]
    }
  ]`;
  }

  private _getDiscursivePromptFromFile(
    contexto: string,
    dto: GenerateQuestaoFromFileRequestDto,
  ): string {
    const { dificuldade, quantidade, assunto } = dto;
    const assuntoClause = assunto
      ? `A questão deve ser especificamente sobre '${assunto}'.`
      : 'A questão deve ser sobre o tema geral do conteúdo.';

    return `Com base exclusivamente no CONTEÚDO fornecido abaixo, sua tarefa é criar ${quantidade} questão(ões) discursiva(s) com dificuldade '${dificuldade}'.
  ${assuntoClause}
  A sua resposta deve ser APENAS um array JSON com ${quantidade} objeto(s), seguindo a estrutura:
  [
    {
      "titulo": "Um título curto e informativo para a questão",
      "descricao": "O texto completo da questão discursiva.",
      "dificuldade": "${dificuldade}",
      "exemplo_resposta": "Um exemplo detalhado de uma resposta que seria considerada 100% correta com base no conteúdo."
    }
  ]

  CONTEÚDO:
  """
  ${contexto}
  """`;
  }

  private _getAlternativesPromptFromFile(
    contexto: string,
    dto: GenerateQuestaoFromFileRequestDto,
  ): string {
    const { dificuldade, quantidade, tipoQuestao, assunto } = dto;
    let instrucaoCorretas = '';
    if (tipoQuestao === TipoQuestaoEnum.OBJETIVA) {
      instrucaoCorretas =
        "Apenas UMA das alternativas deve ter o campo 'isCorreto' como true.";
    } else {
      instrucaoCorretas =
        "UMA OU MAIS alternativas podem ter o campo 'isCorreto' como true.";
    }
    const assuntoClause = assunto
      ? `A questão deve ser especificamente sobre '${assunto}'.`
      : 'A questão deve ser sobre o tema geral do conteúdo.';

    return `Com base exclusivamente no CONTEÚDO fornecido abaixo, sua tarefa é criar ${quantidade} questão(ões) do tipo '${tipoQuestao}' com dificuldade '${dificuldade}'.
  ${assuntoClause}
  Regras para as alternativas:
  - Crie 5 alternativas.
  - ${instrucaoCorretas}
  A sua resposta deve ser APENAS um array JSON com ${quantidade} objeto(s), seguindo a estrutura, incluindo "alternativas":
  [
    {
      "titulo": "Um título curto e informativo para a questão",
      "descricao": "O texto completo da questão.",
      "dificuldade": "${dificuldade}",
      "exemplo_resposta": "Uma justificativa explicando qual(is) alternativa(s) está(ão) correta(s) e por quê. Priorizar objetividade para não ser longo.",
      "alternativas": [
        {
          "descricao": "Texto da primeira alternativa.",
          "isCorreto": true
        },
        {
          "descricao": "Texto da segunda alternativa.",
          "isCorreto": false
        }
      ]
    }
  ]

  CONTEÚDO:
  """
  ${contexto}
  """`;
  }

  private _getMimeTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  private async _callAiAndParseResponse(
    prompt: string,
  ): Promise<GeneratedQuestaoDto[]> {
    try {
      const rawResponse = await this.aiProvider.generateText(prompt);
      const jsonMatch = rawResponse.match(/(\[|\{)[\s\S]*(\]|\})/);
      if (!jsonMatch) {
        throw new Error('Resposta da IA não continha um JSON válido.');
      }
      const jsonString = jsonMatch[0];
      const generatedData = JSON.parse(jsonString) as
        | GeneratedQuestaoDto[]
        | GeneratedQuestaoDto;
      return Array.isArray(generatedData) ? generatedData : [generatedData];
    } catch (error) {
      console.error('Falha ao gerar ou parsear a questão da IA:', error);
      throw new UnprocessableEntityException(
        'A resposta da IA não pôde ser processada.',
      );
    }
  }

  private _cleanExtractedText(text: string): string {
    const cleanedText = text.replace(
      /[^\p{L}\p{N}\p{Z}\s.,;:?!()[\]{}'"+\-−*/=<>≤≥∆]/gu,
      '',
    );

    return cleanedText.replace(/\s+/g, ' ').trim();
  }
}
