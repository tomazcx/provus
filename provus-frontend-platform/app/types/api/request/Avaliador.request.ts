export interface UpdateAvaliadorRequest {
  nome: string;
  senha: string;
  novaSenha: string;
}

export interface RecoverPasswordRequest {
  email: string;
}
