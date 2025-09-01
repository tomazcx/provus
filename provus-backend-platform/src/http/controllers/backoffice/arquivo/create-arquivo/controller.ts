import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ArquivoService } from 'src/services/arquivo.service';
import { CreateArquivoRequest } from './request';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { ArquivoResponse } from 'src/http/models/arquivo.response';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { CreateArquivoDecorators } from './decorators';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('backoffice/arquivo')
@ApiTags('Backoffice - Arquivo')
export class CreateArquivoController {
  constructor(private readonly arquivoService: ArquivoService) {}

  @Post()
  @UseGuards(AvaliadorAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @CreateArquivoDecorators()
  async create(
    @Body() dto: CreateArquivoRequest,
    @LoggedAvaliador() user: AvaliadorModel,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ArquivoResponse> {
    return this.arquivoService.create(
      { ...dto, file: file.buffer, contentType: file.mimetype },
      user,
    );
  }
}
