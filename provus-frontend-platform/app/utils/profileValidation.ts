import z from "zod";

export const profileSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(50, "Nome deve ter no máximo 50 caracteres")
      .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras e espaços"),
    currentPassword: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasPassword = data.password && data.password.length > 0;
      const hasConfirmPassword =
        data.confirmPassword && data.confirmPassword.length > 0;

      if (!hasPassword && !hasConfirmPassword) return true;

      if (hasPassword && !hasConfirmPassword) {
        return false;
      }
      if (!hasPassword && hasConfirmPassword) {
        return false;
      }

      return data.password === data.confirmPassword;
    },
    {
      message: "As senhas devem ser preenchidas e coincidir",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Senha deve ter pelo menos 6 caracteres",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.confirmPassword && data.confirmPassword.length > 0) {
        return data.confirmPassword.length >= 6;
      }
      return true;
    },
    {
      message: "Senha deve ter pelo menos 6 caracteres",
      path: ["confirmPassword"],
    }
  );

export type ProfileFormData = z.infer<typeof profileSchema>;

export function validateProfileForm(data: unknown) {
  return profileSchema.safeParse(data);
}
