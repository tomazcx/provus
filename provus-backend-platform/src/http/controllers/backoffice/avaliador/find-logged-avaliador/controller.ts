import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FindAvaliadorByIdDecorators } from './decorators';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorResponse } from 'src/http/models/avaliador.response';
import { Avaliador } from 'src/domain/entities/avaliador.entity';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';

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
