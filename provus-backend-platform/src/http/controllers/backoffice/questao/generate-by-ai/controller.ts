import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { GenerateDiscursiveByAiDecorators } from './decorators';
import { QuestaoService } from 'src/services/questao.service';
import { GenerateAiQuestaoRequestDto } from './request';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { GeneratedQuestaoDto } from 'src/dto/result/questao/generated-questao.result';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { GenerateQuestaoFromFileRequestDto } from 'src/http/models/request/generate-questao-from-file.request';

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
    uploadedContent: { files?: Express.Multer.File[] },
  ): Promise<GeneratedQuestaoDto[]> {
    return this.questaoService.createByFile(
      dto,
      uploadedContent.files || [],
      user,
    );
  }
}
