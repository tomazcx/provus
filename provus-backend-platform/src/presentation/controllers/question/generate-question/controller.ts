import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { QuestionService } from 'src/domain/services/question';
import { GenerateQuestionRequest } from './request';
import { GenerateQuestionResponse } from './response';
import { ApiTags } from '@nestjs/swagger';
import { GenerateQuestionDecorators } from './decorators';

@Controller('question')
@ApiTags('Question')
export class GenerateQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @GenerateQuestionDecorators()
  async generateQuestion(
    @Body() dto: GenerateQuestionRequest,
  ): Promise<GenerateQuestionResponse> {
    return this.questionService.generateQuestion(dto);
  }
}
