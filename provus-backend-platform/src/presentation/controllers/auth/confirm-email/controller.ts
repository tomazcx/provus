import { Body, Controller, Patch } from '@nestjs/common';
import { AuthService } from 'src/domain/services/auth';
import { ConfirmEmailRequest } from './request';
import { ConfirmEmailDecorators } from './decorators';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Autenticação')
export class ConfirmEmailController {
  constructor(private readonly authService: AuthService) {}

  @Patch('confirmar-email')
  @ConfirmEmailDecorators()
  async handle(@Body() dto: ConfirmEmailRequest): Promise<void> {
    return this.authService.confirmEmail(dto);
  }
}
