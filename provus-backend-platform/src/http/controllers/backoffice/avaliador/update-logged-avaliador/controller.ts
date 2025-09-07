import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateAvaliadorDecorators } from './decorators';
import { AvaliadorService } from 'src/services/avaliador.service';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { UpdateAvaliadorRequest } from './request';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorResponse } from 'src/http/models/response/avaliador.response';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/avaliador')
@ApiTags('Backoffice - Avaliador')
export class UpdateLoggedAvaliadorController {
  constructor(private readonly avaliadorService: AvaliadorService) {}

  @Put('me')
  @UseGuards(AvaliadorAuthGuard)
  @UpdateAvaliadorDecorators()
  async handle(
    @Body() body: UpdateAvaliadorRequest,
    @LoggedAvaliador() avaliador: AvaliadorModel,
  ): Promise<AvaliadorResponse> {
    const updatedAvaliador = await this.avaliadorService.update(
      avaliador.id,
      body,
    );

    return AvaliadorModel.fromModel(updatedAvaliador);
  }
}
