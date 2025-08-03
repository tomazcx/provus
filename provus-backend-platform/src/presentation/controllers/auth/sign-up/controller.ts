import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/domain/services';
import { SignUpRequest } from './request';
import { SignUpDecorators } from './decorators';

@Controller('auth')
@ApiTags('Auth')
export class SignUpController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @SignUpDecorators()
  async signUp(@Body() body: SignUpRequest): Promise<void> {
    await this.authService.signUp(body);
  }
}
