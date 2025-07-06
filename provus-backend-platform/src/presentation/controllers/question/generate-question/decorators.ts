import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GenerateQuestionResponse } from './response';

export const GenerateQuestionDecorators = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Generate a question' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'The question has been successfully generated',
      type: GenerateQuestionResponse,
    }),
  );
};
