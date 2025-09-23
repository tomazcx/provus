import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubmissaoDecorators } from './decorators';
import { CreateSubmissaoRequest } from './request';
import { SubmissaoService } from 'src/services/submissao.service';

@Controller('backoffice/encontrar-avaliacao')
@ApiTags('Backoffice - Submissao')
export class CreateSubmissaoController {
  constructor(private readonly submissaoService: SubmissaoService) {} //submissaoService

  @Post()
  @HttpCode(HttpStatus.OK)
  @CreateSubmissaoDecorators()
  async handle(@Body() body: CreateSubmissaoRequest): Promise<> {
    return await this.submissaoService.createSubmissao(body);
    // await this.aplicacaoService.delete(id, avaliador);
  }
}
