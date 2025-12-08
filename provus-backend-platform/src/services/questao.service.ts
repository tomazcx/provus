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

const PERSPECTIVAS_VARIABILIDADE = [
  'MODO: DEFINIÇÃO. Pergunte sobre o conceito central ou ideia principal. Objetivo: Verificar compreensão básica.',
  'MODO: CENÁRIO PRÁTICO. Crie uma situação hipotética ou exemplo de uso onde o conceito é aplicado. PROIBIDO: Não pergunte "o que é" ou definições teóricas.',
  'MODO: EXCEÇÃO/FALSO. A pergunta deve focar no que NÃO é verdade, ou em uma limitação/exceção do conceito. Ex: "Qual das opções está INCORRETA...".',
  'MODO: DETALHE TÉCNICO. Encontre um detalhe específico, uma classificação, uma data ou um sub-tópico mencionado no texto e pergunte sobre ele. Evite o tema macro.',
  'MODO: ANALÍTICO. Pergunte sobre a consequência de uma ação descrita no texto ou a causa de um fenômeno. Foco no "Porquê" e não no "O quê".',
  'MODO: COMPARAÇÃO. Peça para distinguir entre dois conceitos mencionados ou diferenciar o tema principal de outra ideia similar.',
];
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

    const promises = Array.from({ length: dto.quantidade }).map((_, index) => {
      const singleQuestionDto = { ...dto, quantidade: 1 };
      const focoIndex = index % PERSPECTIVAS_VARIABILIDADE.length;
      const focoDaVez = PERSPECTIVAS_VARIABILIDADE[focoIndex];

      let promptTemplate = '';
      if (dto.tipoQuestao === TipoQuestaoEnum.DISCURSIVA) {
        promptTemplate = this._getDiscursivePromptFromFile(
          contexto,
          singleQuestionDto,
          focoDaVez,
        );
      } else {
        promptTemplate = this._getAlternativesPromptFromFile(
          contexto,
          singleQuestionDto,
          focoDaVez,
        );
      }
      return this._callAiAndParseResponse<GeneratedQuestaoDto>(promptTemplate);
    });

    this.logger.log(
      `Disparando ${dto.quantidade} requisições paralelas para criação por arquivo com variabilidade...`,
    );

    const resultsArrays = await Promise.all(promises);

    return resultsArrays.flat();
  }

  async createByAi(dto: CreateAiQuestaoDto): Promise<GeneratedQuestaoDto[]> {
    const { assunto, dificuldade, tipoQuestao, quantidade } = dto;

    const promises = Array.from({ length: quantidade }).map((_, index) => {
      const focoIndex = index % PERSPECTIVAS_VARIABILIDADE.length;
      const focoDaVez = PERSPECTIVAS_VARIABILIDADE[focoIndex];

      let prompt = '';
      if (tipoQuestao === TipoQuestaoEnum.DISCURSIVA) {
        prompt = this._getDiscursivePrompt(assunto, dificuldade, 1, focoDaVez);
      } else {
        prompt = this._getAlternativesPrompt(
          assunto,
          dificuldade,
          tipoQuestao,
          1,
          focoDaVez,
        );
      }
      return this._callAiAndParseResponse<GeneratedQuestaoDto>(prompt);
    });

    this.logger.log(
      `Disparando ${quantidade} requisições paralelas para criação por tópico com variabilidade...`,
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

      let generatedData: any;
      try {
        generatedData = JSON.parse(cleanResponse);
      } catch (e) {
        const jsonMatch = cleanResponse.match(/(\[|\{)[\s\S]*(\]|\})/);
        if (!jsonMatch) throw new Error('JSON não encontrado na resposta.');
        generatedData = JSON.parse(jsonMatch[0]);
      }

      if (Array.isArray(generatedData)) {
        return generatedData as T[];
      }

      if (typeof generatedData === 'object' && generatedData !== null) {
        if ('titulo' in generatedData || 'estadoCorrecao' in generatedData) {
          return [generatedData as T];
        }

        const keys = Object.keys(generatedData);
        for (const key of keys) {
          if (Array.isArray(generatedData[key])) {
            this.logger.log(
              `Array encontrado dentro da chave wrapper '${key}'. Extraindo...`,
            );
            return generatedData[key] as T[];
          }
        }
      }

      return [generatedData as T];
    } catch (error) {
      this.logger.error('FALHA AO PROCESSAR RESPOSTA DA IA:', error);
      throw new UnprocessableEntityException(
        'A IA não retornou um formato válido. Tente novamente.',
      );
    }
  }
  private _cleanExtractedText(text: string): string {
    const cleanedText = text.replace(
      /[^\p{L}\p{N}\p{Z}\s.,;:?!()[\]{}'"+\-−*/=<>≤≥∆%]/gu,
      '',
    );
    return cleanedText.replace(/\s+/g, ' ').trim();
  }

  generateAndStreamByFile(
    dto: GenerateQuestaoFromFileRequestDto,
    uploadedFiles: Express.Multer.File[],
    avaliador: AvaliadorModel,
    paiId?: number | null,
    avaliacaoId?: number | null,
  ): void {
    const { quantidade } = dto;

    this.logger.log(
      `[Streaming/File] Iniciando job para ${quantidade} questões.`,
    );

    this._processFileStreamGeneration(
      dto,
      uploadedFiles,
      avaliador,
      paiId,
      avaliacaoId,
    ).catch((err) =>
      this.logger.error(`[Streaming/File] Erro crítico no job:`, err),
    );
  }

  private async _processFileStreamGeneration(
    dto: GenerateQuestaoFromFileRequestDto,
    uploadedFiles: Express.Multer.File[],
    avaliador: AvaliadorModel,
    paiId?: number | null,
    avaliacaoId?: number | null,
  ) {
    try {
      const contentSources: { buffer: Buffer; mimeType: string }[] = [];
      for (const file of uploadedFiles) {
        contentSources.push({ buffer: file.buffer, mimeType: file.mimetype });
      }

      if (dto.arquivoIds && dto.arquivoIds.length > 0) {
        const existingFiles = await this.arquivoService.findByIds(
          dto.arquivoIds,
          avaliador.id,
        );
        for (const fileDto of existingFiles) {
          try {
            const response = await fetch(fileDto.url);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            let mimeType =
              response.headers.get('content-type') ||
              'application/octet-stream';
            if (mimeType === 'application/octet-stream') {
              mimeType = this._detectMimeTypeFromBuffer(buffer);
            }
            contentSources.push({ buffer, mimeType });
          } catch (e) {
            this.logger.error(`Erro ao baixar arquivo ${fileDto.id}`, e);
          }
        }
      }

      const rawTexts = await Promise.all(
        contentSources.map((src) =>
          this.textExtractorService.extractTextFromFile(
            src.buffer,
            src.mimeType,
          ),
        ),
      );

      const validTexts = rawTexts.filter((t) => t && t.trim() !== '');
      if (validTexts.length === 0) {
        throw new BadRequestException(
          'Não foi possível extrair texto dos arquivos.',
        );
      }

      const fullContext = validTexts
        .map((t) => this._cleanExtractedText(t))
        .join('\n\n---\n\n');

      const totalLength = fullContext.length;
      const quantidade = dto.quantidade;

      this.logger.log(
        '[Streaming/File] Planejando tópicos baseados no texto...',
      );
      let topicosPlanejados: string[] = [];
      try {
        const contextoPlanejamento =
          totalLength > 20000 ? fullContext.substring(0, 20000) : fullContext;

        const promptPlanejamento = this._getTopicsExtractionPrompt(
          contextoPlanejamento,
          quantidade,
          true,
        );
        topicosPlanejados =
          await this._callAiAndParseResponse<string>(promptPlanejamento);
        if (
          !Array.isArray(topicosPlanejados) ||
          topicosPlanejados.length === 0
        ) {
          topicosPlanejados = [];
        }
        this.logger.log(
          `[Streaming/File] Tópicos extraídos: ${topicosPlanejados.join(', ')}`,
        );
      } catch {
        this.logger.warn(
          '[Streaming/File] Falha no planejamento. Seguindo apenas com fatiamento.',
        );
        topicosPlanejados = [];
      }

      let startOffset = 0;
      if (totalLength > 30000) {
        startOffset = Math.min(Math.floor(totalLength * 0.03), 3000);
      }
      const usefulLength = totalLength - startOffset;
      const chunkSize = Math.ceil(usefulLength / quantidade);

      const tasks = Array.from({ length: quantidade }).map(async (_, index) => {
        try {
          const start = startOffset + index * chunkSize;
          const end = Math.min(start + chunkSize, totalLength);
          let sliceText = fullContext.substring(start, end);

          if (sliceText.length < 500 && totalLength > 1000) {
            const expandStart = Math.max(startOffset, start - 1500);
            sliceText = fullContext.substring(expandStart, end);
          }

          const topicoEspecifico = topicosPlanejados[index];
          const focoIndex = index % PERSPECTIVAS_VARIABILIDADE.length;
          const perspectivaPadrao = PERSPECTIVAS_VARIABILIDADE[focoIndex];
          const seed = `[SEED: ${Date.now()}-${index}-${Math.random()}]`;

          const contextoParaPrompt = `
            === TEXTO PRINCIPAL (FONTE DA VERDADE) ===
            "${sliceText}"
            === FIM DO TEXTO PRINCIPAL ===
            `;

          let instrucaoFocada = '';

          if (topicoEspecifico) {
            instrucaoFocada = `
                FOCO OBRIGATÓRIO: Sua questão deve abordar o tópico "${topicoEspecifico}".
                Tente encontrar informações sobre este tópico no fragmento acima.
                Se o fragmento não contiver informações sobre "${topicoEspecifico}", ignore este tópico e crie uma questão relevante sobre qualquer conteúdo presente no texto.
                
                Lente Adicional: ${perspectivaPadrao}`;
          } else {
            instrucaoFocada = `${perspectivaPadrao}
                
                REGRA DE OURO: Se o texto acima for apenas um SUMÁRIO, ÍNDICE ou REFERÊNCIAS:
                1. IGNORE a estrutura de lista.
                2. Escolha um tema mencionado e crie uma questão conceitual sobre ele.`;
          }

          const singleDto = { ...dto, quantidade: 1 };
          let prompt = '';

          if (singleDto.tipoQuestao === TipoQuestaoEnum.DISCURSIVA) {
            prompt =
              this._getDiscursivePromptFromFile(
                contextoParaPrompt,
                singleDto,
                instrucaoFocada,
              ) + `\n\n${seed}`;
          } else {
            prompt =
              this._getAlternativesPromptFromFile(
                contextoParaPrompt,
                singleDto,
                instrucaoFocada,
              ) + `\n\n${seed}`;
          }

          const [generated] =
            await this._callAiAndParseResponse<GeneratedQuestaoDto>(prompt);

          const questaoVolatil = {
            id: Date.now() + Math.random(),
            titulo: generated.titulo,
            descricao: generated.descricao,
            dificuldade: generated.dificuldade,
            tipoQuestao: dto.tipoQuestao,
            paiId: paiId,
            isModelo: false,
            pontuacao: 1,
            exemploRespostaIa: generated.exemplo_resposta,
            textoRevisao: '',
            alternativas: generated.alternativas?.map((a) => ({
              id: Date.now() + Math.random(),
              descricao: a.descricao,
              isCorreto: a.isCorreto,
            })),
            tipo: TipoItemEnum.QUESTAO,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
          };

          this.avaliadorGateway.sendMessageToAvaliador(
            avaliador.id,
            'nova-questao-ia-gerada',
            {
              questao: questaoVolatil,
              contextoAvaliacaoId: avaliacaoId,
              tempId: index,
            },
          );
          this.logger.log(
            `[Streaming/File] Questão ${questaoVolatil.id} gerada (Tópico: ${topicoEspecifico || 'Slice'}).`,
          );
        } catch (err) {
          this.logger.error(`[Streaming/File] Falha na questão ${index}`, err);
          this.avaliadorGateway.sendMessageToAvaliador(
            avaliador.id,
            'erro-geracao-ia',
            {
              message: 'Falha ao gerar uma questão.',
              tempId: index,
            },
          );
        }
      });

      await Promise.all(tasks);
      this.logger.log('[Streaming/File] Job finalizado.');
    } catch (error) {
      this.logger.error('[Streaming/File] Falha geral no job:', error);
      this.avaliadorGateway.sendMessageToAvaliador(
        avaliador.id,
        'erro-geracao-ia',
        { message: 'Falha crítica ao processar arquivo: ' + error.message },
      );
    }
  }

  private _getTopicsExtractionPrompt(
    contextoOuAssunto: string,
    quantidade: number,
    isArquivo: boolean,
  ): string {
    const base = isArquivo
      ? `Analise o TEXTO abaixo`
      : `Analise o assunto "${contextoOuAssunto}"`;

    return `${base} e liste EXATAMENTE ${quantidade} sub-temas ou ângulos COMPLETAMENTE DISTINTOS para criar questões.
    
    REGRAS DE NÃO-REPETIÇÃO (CRÍTICO):
    1. É PROIBIDO retornar tópicos sinônimos (ex: "O que é X" e "Definição de X").
    2. Se o texto for curto, explore: 1 Conceito, 1 Exemplo Prático, 1 Exceção à regra.
    3. Varie o nível cognitivo: Uma de memória, uma de análise, uma de aplicação.
    
    Retorne APENAS um Array JSON de strings.
    Exemplo: ["Origem histórica", "Fórmula matemática", "Aplicação na engenharia"]

    ${isArquivo ? 'TEXTO:' : ''}
    ${isArquivo ? `"""${contextoOuAssunto}"""` : ''}`;
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
    this.logger.log('[Streaming/Topic] Planejando tópicos distintos...');
    let subTemas: string[] = [];

    try {
      const promptPlanejamento = this._getTopicsExtractionPrompt(
        dto.assunto,
        dto.quantidade,
        false,
      );
      subTemas = await this._callAiAndParseResponse<string>(promptPlanejamento);

      if (!Array.isArray(subTemas) || subTemas.length === 0) {
        subTemas = [];
      }
      this.logger.log(
        `[Streaming/Topic] Tópicos definidos: ${subTemas.join(', ')}`,
      );
    } catch {
      this.logger.warn(
        '[Streaming/Topic] Falha no planejamento. Usando estratégia padrão de focos.',
      );
      subTemas = [];
    }

    const tasks = Array.from({ length: dto.quantidade }).map(
      async (_, index) => {
        try {
          const topicoEspecifico = subTemas[index];

          const focoIndex = index % PERSPECTIVAS_VARIABILIDADE.length;
          const perspectivaPadrao = PERSPECTIVAS_VARIABILIDADE[focoIndex];

          let instrucaoFoco = '';

          if (topicoEspecifico) {
            instrucaoFoco = `FOCO OBRIGATÓRIO: A questão deve ser EXCLUSIVAMENTE sobre o sub-tema "${topicoEspecifico}".\nAdicionalmente, tente aplicar esta lente: ${perspectivaPadrao}`;
          } else {
            instrucaoFoco = perspectivaPadrao;
          }

          const seed = `[SEED: ${Date.now()}-${index}-${Math.random()}]`;
          let prompt = '';

          if (dto.tipoQuestao === TipoQuestaoEnum.DISCURSIVA) {
            prompt =
              this._getDiscursivePrompt(
                dto.assunto,
                dto.dificuldade,
                1,
                instrucaoFoco,
              ) + `\n\n${seed}`;
          } else {
            prompt =
              this._getAlternativesPrompt(
                dto.assunto,
                dto.dificuldade,
                dto.tipoQuestao,
                1,
                instrucaoFoco,
              ) + `\n\n${seed}`;
          }

          const resultDocs: GeneratedQuestaoDto[] =
            await this._callAiAndParseResponse<GeneratedQuestaoDto>(prompt);
          const generated = resultDocs[0];

          const questaoVolatil = {
            id: Date.now() + Math.random(),
            titulo: generated.titulo,
            descricao: generated.descricao,
            dificuldade: generated.dificuldade,
            tipoQuestao: dto.tipoQuestao,
            pontuacao: 1,
            isModelo: false,
            tipo: TipoItemEnum.QUESTAO,
            paiId: pastaId,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
            exemploRespostaIa: generated.exemplo_resposta,
            textoRevisao: '',
            alternativas: generated.alternativas?.map((a) => ({
              id: Date.now() + Math.random(),
              descricao: a.descricao,
              isCorreto: a.isCorreto,
            })),
          };

          this.avaliadorGateway.sendMessageToAvaliador(
            avaliador.id,
            'nova-questao-ia-gerada',
            {
              questao: questaoVolatil,
              contextoAvaliacaoId,
              tempId: index,
            },
          );

          this.logger.log(
            `[Streaming] Questão ${questaoVolatil.id} gerada (Tópico: ${topicoEspecifico || 'Genérico'}).`,
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

  private _getDiscursivePrompt(
    assunto: string,
    dificuldade: DificuldadeQuestaoEnum,
    quantidade: number,
    focoExtra: string = '',
  ): string {
    return `TAREFA CRÍTICA: Crie ${quantidade} questão(ões) discursiva(s) com ALTA VARIABILIDADE.
    
    >>> DIRETRIZ OBRIGATÓRIA DE FOCO <<<
    ${focoExtra}
    (Se você ignorar esta diretriz e criar uma questão genérica, a resposta será considerada falha).

    METADADOS:
    - Assunto: "${assunto}"
    - Dificuldade: "${dificuldade}"
    
    FORMATO DE SAÍDA (JSON PURO):
    Retorne APENAS um Array JSON. Não use markdown.
    Estrutura:
    [
      {
        "titulo": "Título curto e temático",
        "descricao": "Enunciado da questão seguindo estritamente o FOCO",
        "dificuldade": "${dificuldade}",
        "exemplo_resposta": "Gabarito detalhado"
      }
    ]`;
  }

  private _getAlternativesPrompt(
    assunto: string,
    dificuldade: DificuldadeQuestaoEnum,
    tipoQuestao: TipoQuestaoEnum,
    quantidade: number,
    focoExtra: string = '',
  ): string {
    const isObjetiva = tipoQuestao === TipoQuestaoEnum.OBJETIVA;

    const regraCorretas = isObjetiva
      ? 'EXATAMENTE UMA alternativa deve ser correta (isCorreto: true).'
      : 'PELO MENOS DUAS alternativas devem ser corretas (isCorreto: true). Se não houver duas verdades óbvias, crie "distratores plausíveis" que sejam parcialmente verdadeiros mas tecnicamente falsos.';

    return `TAREFA: Crie ${quantidade} questão(ões) do tipo "${tipoQuestao}" sobre "${assunto}".

    >>> DIRETRIZ DE FOCO (OBRIGATÓRIA) <<<
    ${focoExtra}
    (A questão deve ser ÚNICA e não repetir conceitos de questões anteriores geradas).

    METADADOS:
    - Dificuldade: "${dificuldade}"

    REGRAS TÉCNICAS RÍGIDAS:
    1. Crie exatamente 5 alternativas.
    2. ${regraCorretas}
    3. As alternativas incorretas devem ser plausíveis (não use absurdos óbvios).

    FORMATO DE SAÍDA (JSON PURO):
    Retorne APENAS um Array JSON.
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

  private _getAlternativesPromptFromFile(
    contexto: string,
    dto: GenerateQuestaoFromFileRequestDto,
    focoExtra: string = '',
  ): string {
    const { dificuldade, quantidade, tipoQuestao, assunto } = dto;
    const focoAssunto = assunto ? `Foco Temático: "${assunto}"` : '';
    const isObjetiva = tipoQuestao === TipoQuestaoEnum.OBJETIVA;

    const regraCorretas = isObjetiva
      ? 'EXATAMENTE UMA alternativa deve ser correta.'
      : 'PELO MENOS DUAS alternativas devem ser corretas. Questões de múltipla escolha com apenas uma resposta certa serão consideradas ERRO.';

    return `ATENÇÃO: Crie ${quantidade} questão(ões) do tipo "${tipoQuestao}" baseada(s) no texto abaixo.

    >>> DIRETRIZ DE FOCO <<<
    ${focoExtra}

    CONFIGURAÇÃO:
    - Dificuldade: "${dificuldade}"
    - ${focoAssunto}

    REGRAS DE ENGENHARIA:
    1. 5 alternativas obrigatórias.
    2. ${regraCorretas}
    3. A questão deve ser autossuficiente (sem citar "o texto").
    4. EVITE criar questões sobre o mesmo tópico central repetidamente. Busque detalhes periféricos se necessário.

    FORMATO JSON (Obrigatório):
    Retorne APENAS um Array JSON puro no nível raiz.
    [
      {
        "titulo": "Título",
        "descricao": "Enunciado",
        "dificuldade": "${dificuldade}",
        "exemplo_resposta": "Justificativa",
        "alternativas": [
          { "descricao": "Texto", "isCorreto": boolean }
        ]
      }
    ]

    TEXTO BASE:
    """
    ${contexto}
    """`;
  }

  private _getDiscursivePromptFromFile(
    contexto: string,
    dto: GenerateQuestaoFromFileRequestDto,
    focoExtra: string = '',
  ): string {
    const { dificuldade, quantidade, assunto } = dto;
    const focoAssunto = assunto ? `Foco Temático: "${assunto}"` : '';

    return `ATENÇÃO: Você deve criar ${quantidade} questão(ões) baseada(s) no texto abaixo, mas seguindo UMA LENTE ESPECÍFICA.

    >>> SUA LENTE DE FOCO <<<
    ${focoExtra}
    (Siga isso estritamente. Se o foco for "Detalhe", não pergunte sobre o conceito geral. Se for "Aplicação", não pergunte definição).

    CONFIGURAÇÃO:
    - Dificuldade: "${dificuldade}"
    - Tipo: Discursiva
    - ${focoAssunto}

    REGRAS DE ESTILO:
    - A questão deve ser autossuficiente (respondível sem ler o texto na hora).
    - JAMAIS escreva "segundo o texto", "no fragmento acima" ou similar.

    FORMATO JSON (Obrigatório):
    [
      {
        "titulo": "Título",
        "descricao": "Enunciado",
        "dificuldade": "${dificuldade}",
        "exemplo_resposta": "Gabarito"
      }
    ]

    TEXTO BASE:
    """
    ${contexto}
    """`;
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
}
