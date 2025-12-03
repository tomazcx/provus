import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
  forwardRef,
  Inject,
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
import { EvaluateByAiResultDto } from 'src/dto/result/questao/evaluate-by-ai.result';
import { EvaluateByAiRequestDto } from 'src/dto/request/questao/evaluate-by-ai.dto';
import EstadoQuestaoCorrigida from 'src/enums/estado-questao-corrigida.enum';
import { QuestoesAvaliacoesModel } from 'src/database/config/models/questoes-avaliacoes.model';
import { AvaliadorGateway } from 'src/gateway/gateways/avaliador.gateway';

@Injectable()
export class QuestaoService {
  private readonly logger = new Logger(QuestaoService.name);

  constructor(
    private readonly itemSistemaArquivosRepository: ItemSistemaArquivosRepository,
    private readonly questaoRepository: QuestaoRepository,
    private readonly dataSource: DataSource,
    private readonly arquivoService: ArquivoService,
    private readonly textExtractorService: TextExtractorService,
    private readonly aiProvider: AbstractAiProvider,
    @Inject(forwardRef(() => AvaliadorGateway))
    private readonly avaliadorGateway: AvaliadorGateway,
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
    if (dto.paiId) {
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
        try {
          const response = await fetch(fileDto.url);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          let mimeType = response.headers.get('content-type');

          if (
            !mimeType ||
            mimeType === 'application/octet-stream' ||
            mimeType === 'application/x-www-form-urlencoded'
          ) {
            mimeType = this._getMimeTypeFromUrl(fileDto.url);
          }

          if (mimeType === 'application/octet-stream') {
            mimeType = this._detectMimeTypeFromBuffer(buffer);
            this.logger.debug(
              `Tipo detectado por Magic Bytes: ${mimeType} para ${fileDto.url}`,
            );
          }

          contentSources.push({ buffer, mimeType });
        } catch (error) {
          this.logger.error(
            `Erro ao baixar ou processar arquivo ${fileDto.url}:`,
            error,
          );
        }
      }
    }

    if (contentSources.length === 0) {
      throw new BadRequestException(
        'Nenhum material válido foi fornecido ou baixado para gerar as questões.',
      );
    }

    const rawExtractedTexts = await Promise.all(
      contentSources.map(async (source) => {
        try {
          return await this.textExtractorService.extractTextFromFile(
            source.buffer,
            source.mimeType,
          );
        } catch (error) {
          this.logger.warn(
            `Falha ao extrair texto de um arquivo (${source.mimeType}): ${error.message}`,
          );
          return '';
        }
      }),
    );

    const validTexts = rawExtractedTexts.filter((t) => t && t.trim() !== '');

    if (validTexts.length === 0) {
      throw new BadRequestException(
        'Não foi possível extrair texto legível dos arquivos fornecidos. Verifique se são PDFs de texto (não imagem) ou DOCX válidos.',
      );
    }

    const cleanedTexts = validTexts.map((text) =>
      this._cleanExtractedText(text),
    );

    let contexto = cleanedTexts.join('\n\n---\n\n');

    if (contexto.length > MAX_CONTEXT_LENGTH) {
      this.logger.warn(
        `Contexto muito longo (${contexto.length} caracteres). Truncando para ${MAX_CONTEXT_LENGTH}.`,
      );
      contexto =
        contexto.substring(0, MAX_CONTEXT_LENGTH) +
        '\n\n[...CONTEÚDO TRUNCADO...]';
    }

    const singleQuestionDto = { ...dto, quantidade: 1 };

    let promptTemplate = '';
    if (dto.tipoQuestao === TipoQuestaoEnum.DISCURSIVA) {
      promptTemplate = this._getDiscursivePromptFromFile(
        contexto,
        singleQuestionDto,
      );
    } else {
      promptTemplate = this._getAlternativesPromptFromFile(
        contexto,
        singleQuestionDto,
      );
    }

    const promises = Array.from({ length: dto.quantidade }).map(() =>
      this._callAiAndParseResponse<GeneratedQuestaoDto>(promptTemplate),
    );

    this.logger.log(
      `Disparando ${dto.quantidade} requisições paralelas para criação por arquivo...`,
    );

    const resultsArrays = await Promise.all(promises);

    return resultsArrays.flat();
  }

  async createByAi(dto: CreateAiQuestaoDto): Promise<GeneratedQuestaoDto[]> {
    const { assunto, dificuldade, tipoQuestao, quantidade } = dto;

    if (quantidade <= 1) {
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

    const promises = Array.from({ length: quantidade }).map(() => {
      let prompt = '';
      if (tipoQuestao === TipoQuestaoEnum.DISCURSIVA) {
        prompt = this._getDiscursivePrompt(assunto, dificuldade, 1);
      } else {
        prompt = this._getAlternativesPrompt(
          assunto,
          dificuldade,
          tipoQuestao,
          1,
        );
      }
      return this._callAiAndParseResponse<GeneratedQuestaoDto>(prompt);
    });

    this.logger.log(
      `Disparando ${quantidade} requisições paralelas para criação por tópico...`,
    );

    const resultsArrays = await Promise.all(promises);

    return resultsArrays.flat();
  }

  async generateAndSaveByAi(
    dto: CreateAiQuestaoDto,
    avaliador: AvaliadorModel,
  ): Promise<QuestaoResultDto[]> {
    const questoesGeradas = await this.createByAi(dto);

    const resultados: QuestaoResultDto[] = [];

    for (const qGerada of questoesGeradas) {
      const createDto: CreateQuestaoRequest = {
        titulo: qGerada.titulo,
        descricao: qGerada.descricao,
        dificuldade: qGerada.dificuldade,
        tipoQuestao: dto.tipoQuestao,
        paiId: dto.paiId,
        isModelo: true,
        exemploRespostaIa: qGerada.exemplo_resposta,
        alternativas: qGerada.alternativas?.map((a) => ({
          descricao: a.descricao,
          isCorreto: a.isCorreto,
        })),
        pontuacao: 1,
      };

      const novaQuestao = await this.create(createDto, avaliador);
      resultados.push(novaQuestao);
    }

    return resultados;
  }

  async generateAndSaveByFile(
    dto: GenerateQuestaoFromFileRequestDto,
    uploadedFiles: Express.Multer.File[],
    avaliador: AvaliadorModel,
  ): Promise<QuestaoResultDto[]> {
    const questoesGeradas = await this.createByFile(
      dto,
      uploadedFiles,
      avaliador,
    );

    const resultados: QuestaoResultDto[] = [];

    for (const qGerada of questoesGeradas) {
      const createDto: CreateQuestaoRequest = {
        titulo: qGerada.titulo,
        descricao: qGerada.descricao,
        dificuldade: qGerada.dificuldade,
        tipoQuestao: dto.tipoQuestao,
        paiId: dto.paiId,
        isModelo: true,
        exemploRespostaIa: qGerada.exemplo_resposta,
        alternativas: qGerada.alternativas?.map((a) => ({
          descricao: a.descricao,
          isCorreto: a.isCorreto,
        })),
        pontuacao: 1,
      };

      const novaQuestao = await this.create(createDto, avaliador);
      resultados.push(novaQuestao);
    }

    return resultados;
  }

  async evaluateByAi(
    dto: EvaluateByAiRequestDto,
  ): Promise<EvaluateByAiResultDto> {
    const { questaoId, resposta } = dto;

    const questao = await this.questaoRepository.findOne({
      where: { id: questaoId },
      relations: ['item'],
    });

    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    const prompt = this._getEvaluationPrompt(questao, resposta);
    const responseArray =
      await this._callAiAndParseResponse<EvaluateByAiResultDto>(prompt);

    if (!responseArray || responseArray.length === 0) {
      throw new UnprocessableEntityException(
        'A IA não retornou uma resposta de avaliação válida.',
      );
    }

    const result = responseArray[0];

    if (
      !result ||
      typeof result.pontuacao === 'undefined' ||
      !result.estadoCorrecao
    ) {
      throw new UnprocessableEntityException(
        'A IA retornou um objeto de avaliação malformado.',
      );
    }

    const mapPontuacao: Record<EstadoQuestaoCorrigida, number> = {
      [EstadoQuestaoCorrigida.INCORRETA]: 0,
      [EstadoQuestaoCorrigida.CORRETA]: questao.pontuacao,
      [EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA]: result.pontuacao,
      [EstadoQuestaoCorrigida.NAO_RESPONDIDA]: 0,
    };

    return {
      pontuacao: mapPontuacao[result.estadoCorrecao],
      estadoCorrecao: result.estadoCorrecao,
      textoRevisao: result.textoRevisao,
    };
  }

  private _detectMimeTypeFromBuffer(buffer: Buffer): string {
    if (
      buffer.length >= 4 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      return 'application/pdf';
    }
    if (
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    ) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    return 'application/octet-stream';
  }

  private _getMimeTypeFromUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const extension = pathname.split('.').pop()?.toLowerCase();
      if (!extension || extension === pathname || extension.includes('/')) {
        return 'application/octet-stream';
      }
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
    } catch (error) {
      this.logger.warn(
        `Falha ao analisar URL para mimetype: ${url} - Erro: ${error.message}`,
      );
      return 'application/octet-stream';
    }
  }

  private async _callAiAndParseResponse<T>(prompt: string): Promise<T[]> {
    try {
      this.logger.log('Enviando prompt para IA (Modo JSON)...');

      const rawResponse = await this.aiProvider.generateText(prompt, true);

      this.logger.log('Resposta bruta da IA:', rawResponse);

      const cleanResponse = rawResponse
        .replace(/```json/g, '')
        .replace(/```/g, '');

      const generatedData = JSON.parse(cleanResponse) as T[] | T;

      return Array.isArray(generatedData) ? generatedData : [generatedData];
    } catch (error) {
      this.logger.error('FALHA AO PROCESSAR RESPOSTA DA IA:', error);
      throw new UnprocessableEntityException(
        'A IA não retornou um formato válido. Tente novamente.',
      );
    }
  }

  private _getDiscursivePrompt(
    assunto: string,
    dificuldade: DificuldadeQuestaoEnum,
    quantidade: number,
  ): string {
    return `Crie ${quantidade} questão(ões) discursiva(s).
    Assunto: "${assunto}"
    Dificuldade: "${dificuldade}"
    
    Retorne um ARRAY JSON com esta estrutura exata:
    [
      {
        "titulo": "Título curto",
        "descricao": "Enunciado completo da questão",
        "dificuldade": "${dificuldade}",
        "exemplo_resposta": "Gabarito/Resposta esperada detalhada"
      }
    ]`;
  }

  private _getAlternativesPrompt(
    assunto: string,
    dificuldade: DificuldadeQuestaoEnum,
    tipoQuestao: TipoQuestaoEnum,
    quantidade: number,
  ): string {
    const isObjetiva = tipoQuestao === TipoQuestaoEnum.OBJETIVA;

    return `Crie ${quantidade} questão(ões) do tipo "${tipoQuestao}".
    Assunto: "${assunto}"
    Dificuldade: "${dificuldade}"
    
    Requisitos:
    - 5 alternativas por questão.
    - ${isObjetiva ? 'Apenas 1 correta (isCorreto: true).' : 'Pelo menos 1 correta.'}

    Retorne um ARRAY JSON com esta estrutura exata:
    [
      {
        "titulo": "Título curto",
        "descricao": "Enunciado completo",
        "dificuldade": "${dificuldade}",
        "exemplo_resposta": "Justificativa curta do gabarito",
        "alternativas": [
          { "descricao": "Texto da alternativa", "isCorreto": boolean }
        ]
      }
    ]`;
  }

  private _getDiscursivePromptFromFile(
    contexto: string,
    dto: GenerateQuestaoFromFileRequestDto,
  ): string {
    const { dificuldade, quantidade, assunto } = dto;
    const foco = assunto
      ? `Foco específico: "${assunto}"`
      : 'Foco: Tema geral do texto';

    return `Baseado no CONTEÚDO abaixo, crie ${quantidade} questão(ões) discursiva(s).
    Dificuldade: "${dificuldade}"
    ${foco}
    
    Regras de Estilo:
    - A questão deve ser autossuficiente (o aluno deve conseguir responder com base no conhecimento do tema, sem precisar ler o texto de apoio na hora).
    - NÃO faça referências diretas como "conforme o texto", "de acordo com o conteúdo" ou "na seção X".
    
    Retorne um ARRAY JSON:
    [
      {
        "titulo": "Título curto",
        "descricao": "Enunciado da questão (claro e sem citar 'o texto')",
        "dificuldade": "${dificuldade}",
        "exemplo_resposta": "Gabarito esperado baseado no conteúdo"
      }
    ]

    CONTEÚDO:
    ${contexto}`;
  }

  private _getAlternativesPromptFromFile(
    contexto: string,
    dto: GenerateQuestaoFromFileRequestDto,
  ): string {
    const { dificuldade, quantidade, tipoQuestao, assunto } = dto;
    const foco = assunto
      ? `Foco específico: "${assunto}"`
      : 'Foco: Tema geral do texto';
    const isObjetiva = tipoQuestao === TipoQuestaoEnum.OBJETIVA;

    return `Baseado no CONTEÚDO abaixo, crie ${quantidade} questão(ões) do tipo "${tipoQuestao}".
    Dificuldade: "${dificuldade}"
    ${foco}

    Regras de Estilo:
    - A questão deve ser autossuficiente.
    - NÃO faça referências diretas como "conforme o texto", "de acordo com o conteúdo" ou "na seção X".

    Requisitos Técnicos:
    - 5 alternativas por questão.
    - ${isObjetiva ? 'Apenas 1 correta.' : 'Pelo menos 1 correta.'}

    Retorne um ARRAY JSON:
    [
      {
        "titulo": "Título curto",
        "descricao": "Enunciado (claro e sem citar 'o texto')",
        "dificuldade": "${dificuldade}",
        "exemplo_resposta": "Justificativa do gabarito",
        "alternativas": [
          { "descricao": "Alternativa", "isCorreto": boolean }
        ]
      }
    ]

    CONTEÚDO:
    ${contexto}`;
  }

  private _getEvaluationPrompt(
    questao: QuestaoModel,
    resposta: string,
  ): string {
    return `Avalie a resposta do aluno para a questão discursiva.
    
    Questão: "${questao.item.titulo}"
    Enunciado: "${questao.descricao}"
    Gabarito Esperado: "${questao.exemploRespostaIa}"
    Pontuação Máxima: ${questao.pontuacao}
    
    Resposta do Aluno: "${resposta}"

    Retorne um OBJETO JSON único:
    {
      "estadoCorrecao": "${EstadoQuestaoCorrigida.CORRETA}" | "${EstadoQuestaoCorrigida.INCORRETA}" | "${EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA}",
      "pontuacao": number,
      "textoRevisao": "Feedback curto e direto para o aluno"
    }
    
    Regras:
    - Se "estadoCorrecao" for "${EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA}", "pontuacao" deve ser menor que a máxima e maior que 0.
    - Se for "${EstadoQuestaoCorrigida.CORRETA}", "pontuacao" deve ser igual a máxima.
    - Se for "${EstadoQuestaoCorrigida.INCORRETA}", "pontuacao" deve ser 0.`;
  }

  private _cleanExtractedText(text: string): string {
    const cleanedText = text.replace(
      /[^\p{L}\p{N}\p{Z}\s.,;:?!()[\]{}'"+\-−*/=<>≤≥∆%]/gu,
      '',
    );
    return cleanedText.replace(/\s+/g, ' ').trim();
  }

  generateAndStreamByAi(
    dto: CreateAiQuestaoDto,
    avaliador: AvaliadorModel,
    pastaId?: number | null,
    contextoAvaliacaoId?: number,
  ): void {
    const { quantidade } = dto;

    this.logger.log(
      `[Streaming] Iniciando geração de ${quantidade} questões para Avaliador ${avaliador.id}`,
    );

    this._processStreamGeneration(
      dto,
      avaliador,
      pastaId,
      contextoAvaliacaoId,
    ).catch((err) => this.logger.error(`Erro no streaming de questões`, err));
  }

  private async _processStreamGeneration(
    dto: CreateAiQuestaoDto,
    avaliador: AvaliadorModel,
    pastaId?: number | null,
    contextoAvaliacaoId?: number,
  ) {
    const tasks = Array.from({ length: dto.quantidade }).map(
      async (_, index) => {
        try {
          const [generatedDto] = await this.createByAi({
            ...dto,
            quantidade: 1,
          });

          const createDto: CreateQuestaoRequest = {
            titulo: generatedDto.titulo,
            descricao: generatedDto.descricao,
            dificuldade: generatedDto.dificuldade,
            tipoQuestao: dto.tipoQuestao,
            paiId: pastaId ?? undefined,
            isModelo: !contextoAvaliacaoId,
            exemploRespostaIa: generatedDto.exemplo_resposta,
            alternativas: generatedDto.alternativas?.map((a) => ({
              descricao: a.descricao,
              isCorreto: a.isCorreto,
            })),
            pontuacao: 1,
          };

          const questaoResult = await this.create(createDto, avaliador);

          if (contextoAvaliacaoId) {
            const qaRepo = this.dataSource.getRepository(
              QuestoesAvaliacoesModel,
            );

            const lastQ = await qaRepo.findOne({
              where: { avaliacaoId: contextoAvaliacaoId },
              order: { ordem: 'DESC' },
            });

            const novaOrdem = (lastQ?.ordem || 0) + 1 + index;

            const novoVinculo = qaRepo.create({
              avaliacaoId: contextoAvaliacaoId,
              questaoId: questaoResult.id,
              ordem: novaOrdem,
              pontuacao: createDto.pontuacao,
            });

            await qaRepo.save(novoVinculo);

            this.logger.log(
              `[Streaming] Questão ${questaoResult.id} vinculada à avaliação ${contextoAvaliacaoId}`,
            );
          }

          this.avaliadorGateway.sendMessageToAvaliador(
            avaliador.id,
            'nova-questao-ia-gerada',
            {
              questao: questaoResult,
              contextoAvaliacaoId,
              tempId: index,
            },
          );

          this.logger.log(
            `[Streaming] Questão ${questaoResult.id} gerada e enviada via socket.`,
          );
        } catch (error) {
          this.logger.error(
            `[Streaming] Erro ao gerar uma das questões: ${error.message}`,
          );
          this.avaliadorGateway.sendMessageToAvaliador(
            avaliador.id,
            'erro-geracao-ia',
            {
              message: 'Falha ao gerar uma questão.',
              tempId: index,
            },
          );
        }
      },
    );

    await Promise.all(tasks);
    this.logger.log('[Streaming] Processo de geração em lote finalizado.');
  }
}
