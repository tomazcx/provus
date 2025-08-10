import { Body, Controller, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { AuthService } from 'src/domain/services/auth';
import { ResetPasswordRequest } from './request';
import { ResetPasswordDecorators } from './decorators';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Autenticação')
export class ResetPasswordController {
  constructor(private readonly authService: AuthService) {}

  @Patch('resetar-senha')
  @HttpCode(HttpStatus.OK)
  @ResetPasswordDecorators()
  async handle(@Body() dto: ResetPasswordRequest): Promise<void> {
    return this.authService.resetPassword(dto);
  }
}
