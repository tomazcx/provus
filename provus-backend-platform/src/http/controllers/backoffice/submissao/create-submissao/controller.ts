import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubmissaoDecorators } from './decorators';
import { CreateSubmissaoRequest } from './request';
import { SubmissaoService } from 'src/services/submissao.service';
import { FindSubmissaoByHashResponse } from '../find-submissao-by-hash/response';

@Controller('backoffice/encontrar-avaliacao')
@ApiTags('Backoffice - Submissao')
export class CreateSubmissaoController {
  constructor(private readonly submissaoService: SubmissaoService) {}

  @Post()
  @CreateSubmissaoDecorators()
  async handle(
    @Body() body: CreateSubmissaoRequest,
  ): Promise<FindSubmissaoByHashResponse> {
    return await this.submissaoService.createSubmissao(body);
  }
}
