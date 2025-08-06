import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';
import { AvaliadorService } from 'src/domain/services';
import { AvaliadorResponse } from 'src/presentation/models/avaliador';
import { UpdateAvaliadorRequest } from './request';
import { LoggedAvaliador } from 'src/presentation/decorators/logged-avaliador';
import { Avaliador } from 'src/domain/entities';
import { AvaliadorAuthGuard } from 'src/presentation/guards';
import { ApiTags } from '@nestjs/swagger';
import { UpdateAvaliadorDecorators } from './decorators';

@Controller('backoffice/avaliador')
@ApiTags('Backoffice - Avaliador')
export class UpdateLoggedAvaliadorController {
  constructor(private readonly avaliadorService: AvaliadorService) {}

  @Put('me')
  @UseGuards(AvaliadorAuthGuard)
  @UpdateAvaliadorDecorators()
  async handle(
    @Body() body: UpdateAvaliadorRequest,
    @LoggedAvaliador() avaliador: Avaliador,
  ): Promise<AvaliadorResponse> {
    const updatedAvaliador = await this.avaliadorService.update(
      avaliador.id,
      body,
    );

    return AvaliadorResponse.fromEntity(updatedAvaliador);
  }
}
