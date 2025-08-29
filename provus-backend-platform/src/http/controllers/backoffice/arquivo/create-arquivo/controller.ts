import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ArquivoService } from 'src/services/arquivo.service';
import { CreateArquivoRequest } from './request';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { ArquivoResponse } from 'src/http/models/arquivo.response';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { CreateArquivoDecorators } from './decorators';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('backoffice/arquivo')
@ApiTags('Backoffice - Arquivo')
export class CreateArquivoController {
  constructor(private readonly arquivoService: ArquivoService) {}

  @Post()
  @UseGuards(AvaliadorAuthGuard)
  @CreateArquivoDecorators()
  async create(
    @Body() dto: CreateArquivoRequest,
    @LoggedAvaliador() user: AvaliadorModel,
  ): Promise<ArquivoResponse> {
    return this.arquivoService.create(dto, user);
  }
}
