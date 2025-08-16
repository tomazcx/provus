import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/domain/services';
import { SignInRequest } from './request';
import { SignInDecorators } from './decorators';
import { SignInResponse } from './response';

@Controller('auth')
@ApiTags('Autenticação')
export class SignInController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @SignInDecorators()
  async handle(@Body() body: SignInRequest): Promise<SignInResponse> {
    return this.authService.signIn(body);
  }
}
