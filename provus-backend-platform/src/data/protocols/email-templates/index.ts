export abstract class EmailTemplatesProvider {
  abstract recoverPassword(hash: string): string;
  abstract confirmEmail(hash: string): string;
}
