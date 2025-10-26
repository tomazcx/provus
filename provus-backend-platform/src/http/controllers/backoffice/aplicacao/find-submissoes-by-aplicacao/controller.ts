import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { FindSubmissoesResponseDto } from 'src/dto/result/submissao/find-submissoes.response.dto';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { SubmissaoService } from 'src/services/submissao.service';
import { FindSubmissoesByAplicacaoDecorators } from './decorators';

@Controller('backoffice/aplicacao/:id/submissoes')
@ApiTags('Backoffice - Aplicação')
export class FindSubmissoesByAplicacaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get()
  @UseGuards(AvaliadorAuthGuard)
  @FindSubmissoesByAplicacaoDecorators()
  async handle(
    @Param('id', ParseIntPipe) aplicacaoId: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<FindSubmissoesResponseDto> {
    return this.submissaoService.findSubmissionsByApplication(
      aplicacaoId,
      avaliador.id,
    );
  }
}
