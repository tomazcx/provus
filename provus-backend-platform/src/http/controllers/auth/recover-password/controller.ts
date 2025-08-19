import { Body, Controller, Patch, Post } from '@nestjs/common';
import { RecoverPasswordRequest } from './request';
import { RecoverPasswordDecorators } from './decorators';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/services/auth.service';

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
