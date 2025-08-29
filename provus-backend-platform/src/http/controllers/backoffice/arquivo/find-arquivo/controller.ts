import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { ArquivoResponse } from 'src/http/models/arquivo.response';
import { ArquivoService } from 'src/services/arquivo.service';
import { ApiTags } from '@nestjs/swagger';
import { FindArquivoDecorators } from './decorators';

@Controller('backoffice/arquivo')
@ApiTags('Backoffice - Arquivo')
export class FindArquivoController {
  constructor(private readonly arquivoService: ArquivoService) {}

  @Get(':id')
  @UseGuards(AvaliadorAuthGuard)
  @FindArquivoDecorators()
  async find(@Param('id', ParseIntPipe) id: number): Promise<ArquivoResponse> {
    return this.arquivoService.findById(id);
  }
}
