<template>
  <div
    class="font-sans bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <UCard class="shadow-md">
        <h3 class="text-lg text-center font-semibold mb-2">Recuperar senha!</h3>
        <p class="text-md text-center text-gray-600 mb-5">
          Digite seu e-mail para receber um link de recuperação de senha. Caso
          esteja cadastrado, você receberá um e-mail com um link de recuperação
          de senha.
        </p>
        <UForm
          :schema="recuperarSenhaSchema"
          :state="form"
          class="space-y-5"
          @submit="handleRecuperarSenha"
        >
          <UFormField label="E-mail" name="email" required>
            <UInput
              v-model="form.email"
              placeholder="seu@email.com"
              icon="i-heroicons-envelope"
              size="xl"
              class="w-full"
            />
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
            Recuperar senha
          </UButton>
        </UForm>
        <NuxtLink
          class="text-sm text-primary text-center w-full block mt-6"
          to="/auth"
        >
          Voltar para tela de login
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const isLoading = ref(false);
const form = reactive({
  email: "",
});

const isFormValid = computed(() => {
  return recuperarSenhaSchema.safeParse(form).success;
});

const route = useRoute();
console.log(route);
const { $api } = useNuxtApp();
const toast = useToast();

async function handleRecuperarSenha(event: { data: RecuperarSenhaFormData }) {
  if (!isFormValid.value || isLoading.value) return;

  try {
    isLoading.value = true;

    await $api("/auth/recuperar-senha", {
      method: "POST",
      body: {
        email: event.data.email,
      },
    });

    toast.add({
      title: "Recuperação de senha realizada com sucesso",
      description:
        "Verifique seu e-mail para receber um link de recuperação de senha.",
      icon: "i-lucide-check-circle",
      color: "secondary",
    });
  } catch (error: any) {
    const message =
      error.response?._data?.message ?? "Ocorreu um erro desconhecido.";

    toast.add({
      title: "Falha na recuperação de senha",
      description: message,
      icon: "i-lucide-x",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
