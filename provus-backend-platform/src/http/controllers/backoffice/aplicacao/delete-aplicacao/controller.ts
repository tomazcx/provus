import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AplicacaoService } from 'src/services/aplicacao.service';
import { DeleteAplicacaoDecorators } from './decorators';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/aplicacao')
@ApiTags('Backoffice - Aplicação')
export class DeleteAplicacaoController {
  constructor(private readonly aplicacaoService: AplicacaoService) {}

  @Delete(':id')
  @UseGuards(AvaliadorAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @DeleteAplicacaoDecorators()
  async handle(
    @Param('id', ParseIntPipe) id: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<void> {
    await this.aplicacaoService.delete(id, avaliador);
  }
}
