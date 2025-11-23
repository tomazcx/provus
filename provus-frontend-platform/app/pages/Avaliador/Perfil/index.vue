<script setup lang="ts">
import { useUserStore } from "~/store/userStore";
import Breadcrumbs from "@/components/Breadcrumbs/index.vue"; 

definePageMeta({
  layout: "default",
});

const userStore = useUserStore();
const toast = useToast();
const breadcrumbs = [
  { label: "Home", to: "/home" },
  { label: "Perfil", disabled: true },
];
const form = reactive({
  nome: "",
  email: "",
});

const passwords = reactive({
  current: "",
  new: "",
  confirm: "",
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

onMounted(async () => {
  if (!userStore.user) {
    await userStore.fetchCurrentUser();
  }
  if (userStore.user) {
    form.nome = userStore.user.nome;
    form.email = userStore.user.email;
  }
});

const canSave = computed(() => {
  return (
    form.nome.length >= 3 &&
    passwords.current.length >= 6 &&
    (!passwords.new || passwords.new === passwords.confirm)
  );
});

async function handleSaveChanges() {
  if (!canSave.value) {
    toast.add({
      title: "Dados incompletos",
      description:
        "Verifique o nome e certifique-se de digitar sua senha atual para confirmar as alterações.",
      color: "warning",
    });
    return;
  }

  if (passwords.new && passwords.new.length < 6) {
    toast.add({
      title: "Nova senha inválida",
      description: "A nova senha deve ter no mínimo 6 caracteres.",
      color: "warning",
    });
    return;
  }

  const success = await userStore.updateProfile({
    nome: form.nome,
    senha: passwords.current,
    novaSenha: passwords.new,
  });

  if (success) {
    toast.add({
      title: "Perfil Atualizado!",
      description: "Suas informações foram salvas com sucesso.",
      icon: "i-lucide-check-circle",
      color: "secondary",
    });
    passwords.current = "";
    passwords.new = "";
    passwords.confirm = "";
  }
}

async function handleSendResetEmail() {
  if (!form.email) return;

  const success = await userStore.requestPasswordReset(form.email);
  if (success) {
    toast.add({
      title: "E-mail enviado",
      description: "Verifique sua caixa de entrada para redefinir a senha.",
      icon: "i-lucide-mail",
      color: "info",
    });
  } else {
    toast.add({
      title: "Erro",
      description: "Não foi possível processar a solicitação.",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <Breadcrumbs :items="breadcrumbs" />
    <div class="flex items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-primary">Configurações do Perfil</h1>
        <p class="text-gray-600 mt-1">
          Gerencie suas informações de conta e preferências
        </p>
      </div>
    </div>

    <div class="mx-auto">
      <UCard>
        <form class="space-y-8" @submit.prevent="handleSaveChanges">
          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon name="i-lucide-user" class="mr-2 text-primary" />
              Informações Pessoais
            </h3>

            <div class="grid grid-cols-1 gap-4">
              <UFormField label="Nome Completo" class="w-full" required>
                <UInput
                  v-model="form.nome"
                  size="lg"
                  class="w-full"
                  placeholder="Seu nome"
                />
              </UFormField>

              <UFormField
                label="E-mail (Login)"
                help="O e-mail não pode ser alterado diretamente."
              >
                <UInput
                  v-model="form.email"
                  type="email"
                  size="lg"
                  icon="i-lucide-mail"
                  class="w-full"
                  disabled
                />
              </UFormField>
            </div>
          </div>

          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <Icon name="i-lucide-shield-check" class="mr-2 text-primary" />
                Segurança e Senha
              </h3>
              <UButton
                variant="link"
                color="primary"
                label="Esqueci minha senha atual"
                @click="handleSendResetEmail"
              />
            </div>

            <div class="space-y-4">
              <UAlert
                icon="i-lucide-info"
                color="primary"
                variant="subtle"
                title="Confirmação Necessária"
                description="Para alterar seu nome ou definir uma nova senha, você deve digitar sua senha atual abaixo."
              />

              <UFormField
                label="Senha Atual (Obrigatório para salvar)"
                required
              >
                <UInput
                  v-model="passwords.current"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Digite sua senha atual para confirmar alterações"
                  size="lg"
                  class="w-full"
                >
                  <template #trailing>
                    <UButton
                      color="primary"
                      variant="link"
                      :icon="
                        showCurrentPassword
                          ? 'i-lucide-eye-off'
                          : 'i-lucide-eye'
                      "
                      @click="showCurrentPassword = !showCurrentPassword"
                    />
                  </template>
                </UInput>
              </UFormField>

              <div
                class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100"
              >
                <UFormField label="Nova Senha (Opcional)">
                  <UInput
                    v-model="passwords.new"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="Deixe em branco para manter a atual"
                    size="lg"
                    class="w-full"
                  >
                    <template #trailing>
                      <UButton
                        color="primary"
                        variant="link"
                        :icon="
                          showNewPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                        "
                        @click="showNewPassword = !showNewPassword"
                      />
                    </template>
                  </UInput>
                </UFormField>

                <UFormField label="Confirme a Nova Senha">
                  <UInput
                    v-model="passwords.confirm"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Repita a nova senha"
                    size="lg"
                    class="w-full"
                    :color="
                      passwords.new && passwords.new !== passwords.confirm
                        ? 'error'
                        : 'primary'
                    "
                  >
                    <template #trailing>
                      <UButton
                        color="primary"
                        variant="link"
                        :icon="
                          showConfirmPassword
                            ? 'i-lucide-eye-off'
                            : 'i-lucide-eye'
                        "
                        @click="showConfirmPassword = !showConfirmPassword"
                      />
                    </template>
                  </UInput>
                </UFormField>
              </div>
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200"
          >
            <UButton
              type="button"
              block
              size="lg"
              color="error"
              variant="subtle"
              class="w-full"
              icon="i-lucide-x"
              to="/home"
            >
              Cancelar
            </UButton>

            <UButton
              type="submit"
              block
              size="lg"
              color="secondary"
              icon="i-lucide-save"
              :loading="userStore.isLoading"
              :disabled="!canSave"
            >
              Salvar Alterações
            </UButton>
          </div>
        </form>
      </UCard>
    </div>
  </div>
</template>
