import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/domain/services/auth';
import { RecoverPasswordRequest } from './request';
import { RecoverPasswordDecorators } from './decorators';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Autenticação')
export class RecoverPasswordController {
  constructor(private readonly authService: AuthService) {}

  @Post('recuperar-senha')
  @RecoverPasswordDecorators()
  async handle(@Body() dto: RecoverPasswordRequest): Promise<void> {
    return this.authService.recoverPassword(dto);
  }
}
