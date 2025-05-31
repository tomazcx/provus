import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/domain/services';
import { SignUpRequest } from './request';
import { ProctorResponse } from 'src/presentation/models/proctor';
import { SignUpDecorators } from './decorators';

@Controller('auth')
@ApiTags('Auth')
export class SignUpController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @SignUpDecorators()
  async signUp(@Body() body: SignUpRequest): Promise<ProctorResponse> {
    const proctor = await this.authService.signUp(body);

    return ProctorResponse.fromEntity(proctor);
  }
}
