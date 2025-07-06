import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { EvaluateAnswerResponse } from './response';

export const EvaluateAnswerDecorators = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Evaluate answer' }),
    ApiResponse({ status: HttpStatus.OK, type: EvaluateAnswerResponse }),
  );
};
