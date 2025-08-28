import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpandirQuestoesResponse } from './response';

export const ExpandirQuestoesDecorators = () => {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Expande questões',
      description: 'Expande questões',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Questões expandidas',
      type: ExpandirQuestoesResponse,
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Não autorizado',
    }),
  );
};
