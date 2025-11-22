import { z } from "zod";

export const recuperarSenhaSchema = z.object({
  email: z.email("E-mail inválido").toLowerCase(),
});

export type RecuperarSenhaFormData = z.infer<typeof recuperarSenhaSchema>;

export function validateRecuperarSenhaForm(data: unknown) {
  return recuperarSenhaSchema.safeParse(data);
}

export const resetarSenhaSchema = z
  .object({
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type ResetarSenhaFormData = z.infer<typeof resetarSenhaSchema>;

export function validateResetarSenhaForm(data: unknown) {
  return resetarSenhaSchema.safeParse(data);
}
