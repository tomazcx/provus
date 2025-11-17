import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { SubmissaoService } from 'src/services/submissao.service';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmarCodigoRequest {
  @ApiProperty({ description: 'Código de 6 dígitos fornecido pelo aluno' })
  @IsNumber()
  @IsNotEmpty()
  codigoEntrega: number;
}

@Controller('backoffice/aplicacao/:aplicacaoId/submissao/:submissaoId')
@ApiTags('Backoffice - Aplicação')
@UseGuards(AvaliadorAuthGuard)
@ApiBearerAuth()
export class ConfirmarCodigoEntregaController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Patch('confirmar-codigo')
  @ApiOperation({ summary: 'Confirma a entrega de uma submissão com o código' })
  @ApiResponse({ status: 200, description: 'Entrega confirmada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Código de entrega incorreto.' })
  @ApiResponse({ status: 404, description: 'Submissão não encontrada.' })
  async handle(
    @Param('aplicacaoId', ParseIntPipe) aplicacaoId: number,
    @Param('submissaoId', ParseIntPipe) submissaoId: number,
    @Body() body: ConfirmarCodigoRequest,
  ) {
    return this.submissaoService.confirmarCodigoEntrega(
      submissaoId,
      aplicacaoId,
      body.codigoEntrega,
    );
  }
}
