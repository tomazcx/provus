import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MonitoramentoInicialResponseDto } from './response';

export const GetMonitoramentoInicialDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Busca dados iniciais para monitoramento' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Dados iniciais do monitoramento carregados.',
      type: MonitoramentoInicialResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Aplicação não encontrada.',
    }),
  );
};
