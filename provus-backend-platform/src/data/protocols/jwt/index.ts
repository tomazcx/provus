export abstract class JwtProvider {
  abstract sign(payload: any): Promise<string>;
  abstract verify(token: string): Promise<any>;
}
