import { Body, Controller, Patch } from '@nestjs/common';
import { ConfirmEmailRequest } from './request';
import { ConfirmEmailDecorators } from './decorators';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/services/auth.service';

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
