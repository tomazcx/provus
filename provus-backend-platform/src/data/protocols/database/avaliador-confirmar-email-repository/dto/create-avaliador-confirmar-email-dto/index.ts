export interface CreateAvaliadorConfirmarEmailDto {
  avaliadorId: number;
  hash: string;
  isConfirmado: boolean;
  expiraEm: Date;
}
