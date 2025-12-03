import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { GenerateDiscursiveByAiDecorators } from './decorators';
import { QuestaoService } from 'src/services/questao.service';
import { GenerateAiQuestaoRequestDto } from './request';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { GeneratedQuestaoDto } from 'src/dto/result/questao/generated-questao.result';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { GenerateQuestaoFromFileRequestDto } from 'src/http/models/request/generate-questao-from-file.request';
import { QuestaoResultDto } from 'src/dto/result/questao/questao.result';

@Controller('backoffice/questao/generate-by-ai')
@ApiTags('Backoffice - Questão')
@UseGuards(AvaliadorAuthGuard)
@ApiBearerAuth()
export class GenerateByAiController {
  constructor(private readonly questaoService: QuestaoService) {}

  @Post()
  @GenerateDiscursiveByAiDecorators()
  handle(@Body() body: GenerateAiQuestaoRequestDto) {
    return this.questaoService.createByAi(body);
  }

  @Post('gerar-por-arquivo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 2 }]))
  createByFile(
    @Body() dto: GenerateQuestaoFromFileRequestDto,
    @LoggedAvaliador() user: AvaliadorModel,
    @UploadedFiles()
    uploadedContent?: { files?: Express.Multer.File[] },
  ): Promise<GeneratedQuestaoDto[]> {
    const files = uploadedContent?.files || [];
    return this.questaoService.createByFile(dto, files, user);
  }

  @Post('save')
  @ApiOperation({
    summary: 'Gera questões via IA e salva diretamente no banco de questões.',
    description:
      'Gera questões com base no tema e as persiste imediatamente na pasta indicada (paiId).',
  })
  async generateAndSave(
    @Body() body: GenerateAiQuestaoRequestDto,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<QuestaoResultDto[]> {
    return this.questaoService.generateAndSaveByAi(body, avaliador);
  }

  @Post('save-from-file')
  @ApiOperation({
    summary: 'Gera e salva questões via IA a partir de arquivos (PDF/DOCX).',
    description: 'Extrai texto de arquivos, gera questões e salva no banco.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 2 }]))
  async generateAndSaveFromFile(
    @Body() dto: GenerateQuestaoFromFileRequestDto,
    @LoggedAvaliador() avaliador: AvaliadorModel,
    @UploadedFiles()
    uploadedContent?: { files?: Express.Multer.File[] },
  ): Promise<QuestaoResultDto[]> {
    const files = uploadedContent?.files || [];
    if (typeof dto.paiId === 'string') {
      dto.paiId = parseInt(dto.paiId, 10);
    }
    return this.questaoService.generateAndSaveByFile(dto, files, avaliador);
  }

  @Post('stream')
  @ApiOperation({ summary: 'Inicia geração em background (Streaming via WS)' })
  @HttpCode(HttpStatus.ACCEPTED)
  generateAndStream(
    @Body() body: GenerateAiQuestaoRequestDto,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): { message: string; jobStarted: boolean } {
    this.questaoService.generateAndStreamByAi(
      body,
      avaliador,
      body.paiId,
      body.avaliacaoId || null,
    );

    return {
      message: `Iniciando geração de ${body.quantidade} questões...`,
      jobStarted: true,
    };
  }

  @Post('stream-from-file')
  @ApiOperation({ summary: 'Geração via Arquivo em background (Streaming)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 2 }]))
  @HttpCode(HttpStatus.ACCEPTED)
  generateAndStreamFromFile(
    @Body() dto: GenerateQuestaoFromFileRequestDto & { avaliacaoId?: string },
    @LoggedAvaliador() avaliador: AvaliadorModel,
    @UploadedFiles() uploadedContent?: { files?: Express.Multer.File[] },
  ): { message: string } {
    const files = uploadedContent?.files || [];

    let paiIdParsed: number | null = null;
    if (dto.paiId) paiIdParsed = Number(dto.paiId);

    let avaliacaoIdParsed: number | null = null;
    if (dto.avaliacaoId) avaliacaoIdParsed = Number(dto.avaliacaoId);

    const arquivoIdsParsed = dto.arquivoIds
      ? Array.isArray(dto.arquivoIds)
        ? dto.arquivoIds.map(Number)
        : [Number(dto.arquivoIds)]
      : [];

    const cleanDto = {
      ...dto,
      arquivoIds: arquivoIdsParsed,
      quantidade: Number(dto.quantidade),
    };

    this.questaoService.generateAndStreamByFile(
      cleanDto,
      files,
      avaliador,
      paiIdParsed,
      avaliacaoIdParsed,
    );

    return { message: 'Processamento de arquivo iniciado.' };
  }
}
