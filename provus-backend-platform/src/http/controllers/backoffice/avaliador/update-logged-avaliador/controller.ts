import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateAvaliadorDecorators } from './decorators';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador';
import { AvaliadorResponse } from 'src/http/models/avaliador';
import { Avaliador } from 'src/domain/entities/avaliador.entity';
import { UpdateAvaliadorRequest } from './request';
import { AvaliadorService } from 'src/services/avaliador.service';
import { AvaliadorAuthGuard } from 'src/http/guards';

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
