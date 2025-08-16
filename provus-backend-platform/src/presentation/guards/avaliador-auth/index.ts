import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/domain/services';

@Injectable()
export class AvaliadorAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const bearerToken = request.headers['authorization'];

    if (!bearerToken) throw new UnauthorizedException('Token não fornecido');

    const token = bearerToken.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token não fornecido');

    const avaliador = await this.authService.validateToken(token);
    if (!avaliador) throw new UnauthorizedException('Token inválido');

    request.avaliador = avaliador;

    return true;
  }
}
