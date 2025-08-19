import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SignUpRequest } from './request';
import { SignUpDecorators } from './decorators';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
@ApiTags('Autenticação')
export class SignUpController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @SignUpDecorators()
  async handle(@Body() body: SignUpRequest): Promise<void> {
    await this.authService.signUp(body);
  }
}
