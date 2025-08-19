import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Env } from 'src/shared/env';

@Injectable()
export class JwtProvider {
  async sign(payload: any): Promise<string> {
    return jwt.sign(payload, Env.JWT_SECRET, {
      expiresIn: Env.JWT_EXPIRES_IN,
      audience: Env.JWT_AUDIENCE,
    });
  }

  async verify(token: string): Promise<any> {
    return jwt.verify(token, Env.JWT_SECRET, {
      audience: Env.JWT_AUDIENCE,
    });
  }
}
