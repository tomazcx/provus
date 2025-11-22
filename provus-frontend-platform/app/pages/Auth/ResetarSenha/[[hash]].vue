<template>
  <div
    class="font-sans bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <UCard v-if="!success" class="shadow-md">
        <h3 class="text-lg text-center font-semibold mb-2">Resetar senha!</h3>
        <p class="text-md text-center text-gray-600 mb-5">
          Digite sua nova senha para resetar a senha do seu cadastro.
        </p>
        <UForm
          :schema="resetarSenhaSchema"
          :state="form"
          class="space-y-5"
          @submit="handleResetarSenha"
        >
          <UFormField label="Senha" name="senha" required>
            <UInput
              v-model="form.senha"
              :type="showSenha ? 'text' : 'password'"
              :ui="{ trailing: 'pe-1' }"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
              size="xl"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="xl"
                  aria-controls="senha"
                  :icon="showSenha ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="showSenha ? 'Ocultar senha' : 'Mostrar senha'"
                  :aria-pressed="showSenha"
                  @click="showSenha = !showSenha"
                />
              </template>
            </UInput>
          </UFormField>
          <UFormField label="Confirmar senha" name="confirmarSenha" required>
            <UInput
              v-model="form.confirmarSenha"
              :type="showConfirmPassword ? 'text' : 'password'"
              :ui="{ trailing: 'pe-1' }"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
              size="xl"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="xl"
                  aria-controls="confirmarSenha"
                  :icon="
                    showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                  "
                  :aria-label="
                    showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
                  "
                  :aria-pressed="showConfirmPassword"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </UInput>
          </UFormField>
          <UButton
            type="submit"
            color="primary"
            size="xl"
            block
            :disabled="isLoading || !isFormValid"
          >
            <Icon
              v-if="isLoading"
              name="i-lucide-loader-2"
              class="animate-spin h-8 w-8"
            />
            Resetar senha
          </UButton>
        </UForm>
      </UCard>

      <UCard v-if="success" class="shadow-md">
        <div class="flex justify-center mb-2">
          <Icon name="i-lucide-circle-check" class="text-secondary text-5xl" />
        </div>

        <h3 class="text-lg text-center font-semibold mb-2">
          Senha resetada com sucesso!
        </h3>
        <p class="text-md text-center text-gray-600 mb-5">
          Você pode fazer o login com sua nova senha.
        </p>
        <NuxtLink to="/auth">
          <UButton color="primary" size="xl" block>
            Ir para tela de login
          </UButton>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  resetarSenhaSchema,
  type ResetarSenhaFormData,
} from "~/utils/recoverPasswordValidation";

definePageMeta({
  layout: false,
});

const isLoading = ref(false);
const showSenha = ref(false);
const showConfirmPassword = ref(false);
const success = ref(false);
const form = reactive({
  senha: "",
  confirmarSenha: "",
});

const isFormValid = computed(() => {
  return resetarSenhaSchema.safeParse(form).success;
});

const route = useRoute();
const { $api } = useNuxtApp();
const toast = useToast();

async function handleResetarSenha(event: { data: ResetarSenhaFormData }) {
  if (!isFormValid.value || isLoading.value) return;

  try {
    isLoading.value = true;

    await $api("/auth/resetar-senha", {
      method: "PATCH",
      body: {
        hash: route.params.hash,
        senha: event.data.senha,
      },
    });

    toast.add({
      title: "Senha resetada com sucesso",
      description: "Você pode fazer o login com sua nova senha.",
      icon: "i-lucide-check-circle",
      color: "secondary",
    });
    success.value = true;
  } catch (error: any) {
    const message =
      error.response?._data?.message ?? "Ocorreu um erro desconhecido.";

    toast.add({
      title: "Falha no reset da senha",
      description: message,
      icon: "i-lucide-x",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
