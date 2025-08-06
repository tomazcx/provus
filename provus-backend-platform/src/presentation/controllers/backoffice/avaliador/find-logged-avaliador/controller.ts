import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FindAvaliadorByIdDecorators } from './decorators';
import { AvaliadorResponse } from 'src/presentation/models/avaliador';
import { ApiTags } from '@nestjs/swagger';
import { LoggedAvaliador } from 'src/presentation/decorators/logged-avaliador';
import { Avaliador } from 'src/domain/entities';
import { AvaliadorAuthGuard } from 'src/presentation/guards';

@Controller('backoffice/avaliador')
@ApiTags('Backoffice - Avaliador')
export class FindLoggedAvaliadorController {
  @Get('me')
  @UseGuards(AvaliadorAuthGuard)
  @FindAvaliadorByIdDecorators()
  async handle(
    @LoggedAvaliador() avaliador: Avaliador,
  ): Promise<AvaliadorResponse> {
    return AvaliadorResponse.fromEntity(avaliador);
  }
}
