import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FindAvaliadorByIdDecorators } from './decorators';
import { LoggedAvaliador } from 'src/http/decorators/logged-avaliador.decorator';
import { AvaliadorAuthGuard } from 'src/http/guards/avaliador-auth.guard';
import { AvaliadorModel } from 'src/database/config/models/avaliador.model';

@Controller('backoffice/avaliador')
@ApiTags('Backoffice - Avaliador')
export class FindLoggedAvaliadorController {
  @Get('me')
  @UseGuards(AvaliadorAuthGuard)
  @FindAvaliadorByIdDecorators()
  handle(@LoggedAvaliador() avaliador: AvaliadorModel) {
    return AvaliadorModel.fromModel(avaliador);
  }
}
