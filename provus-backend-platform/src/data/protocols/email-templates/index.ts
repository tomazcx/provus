export abstract class EmailTemplatesProvider {
  abstract recoverPassword(hash: string): string;
}
