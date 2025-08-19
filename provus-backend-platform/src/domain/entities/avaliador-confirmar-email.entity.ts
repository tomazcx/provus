export class AvaliadorConfirmarEmail {
  id: number;
  avaliadorId: number;
  hash: string;
  isConfirmado: boolean;
  expiraEm: Date;
  criadoEm: Date;
}
