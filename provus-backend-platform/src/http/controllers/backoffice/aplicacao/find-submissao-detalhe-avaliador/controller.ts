import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';
import { AvaliadorSubmissaoDetalheDto } from 'src/dto/result/submissao/avaliador-submissao-detalhe.dto';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { SubmissaoService } from 'src/services/submissao.service';

@Controller('backoffice/aplicacao/:appId/submissao/:subId')
@ApiTags('Backoffice - Aplicação')
export class FindSubmissionDetailsForEvaluatorController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AvaliadorAuthGuard)
  async handle(
    @Param('appId', ParseIntPipe) appId: number,
    @Param('subId', ParseIntPipe) subId: number,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AvaliadorSubmissaoDetalheDto> {
    return this.submissaoService.findSubmissionDetailsForEvaluator(
      appId,
      subId,
      avaliador.id,
    );
  }
}
