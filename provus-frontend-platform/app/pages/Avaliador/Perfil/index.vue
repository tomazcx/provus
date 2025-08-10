<script setup lang="ts">
definePageMeta({
  layout: "default",
});

const user = reactive({
  firstName: "Michael",
  lastName: "Johnson",
  email: "m.johnson@university.edu",
  phone: "+1 (555) 123-4567",
  department: "Mathematics",
});

const passwords = reactive({
  current: "",
  new: "",
  confirm: "",
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const toast = useToast();
const router = useRouter();

function handleSaveChanges() {
  console.log("Saving data:", { user, passwords });

  toast.add({
    title: "Perfil Atualizado!",
    description: "Suas informações foram salvas com sucesso.",
    icon: "i-lucide-check-circle",
    color: "secondary",
  });
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center mb-8">
      <UButton
        variant="ghost"
        color="primary"
        icon="i-lucide-arrow-left"
        class="mr-4"
        size="xl"
        @click="goBack"
      />
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Nome" class="w-full">
                <UInput v-model="user.firstName" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Sobrenome" class="w-full">
                <UInput v-model="user.lastName" size="lg" class="w-full" />
              </UFormField>
              <UFormField label="Endereço de E-mail">
                <UInput
                  v-model="user.email"
                  type="email"
                  size="lg"
                  icon="i-lucide-mail"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Telefone">
                <UInput
                  v-model="user.phone"
                  size="lg"
                  icon="i-lucide-phone"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
              <Icon name="i-lucide-shield-check" class="mr-2 text-primary" />
              Configurações de Segurança
            </h3>
            <div class="space-y-4">
              <UFormField label="Senha Atual">
                <UInput
                  v-model="passwords.current"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Digite sua senha atual"
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
              <UFormField label="Nova Senha">
                <UInput
                  v-model="passwords.new"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Digite a nova senha"
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
                  placeholder="Confirme a nova senha"
                  size="lg"
                  class="w-full"
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
              @click="goBack"
            >
              Cancelar
            </UButton>
            <UButton
              type="submit"
              block
              size="lg"
              color="secondary"
              icon="i-lucide-save"
            >
              Salvar Alterações
            </UButton>
          </div>
        </form>
      </UCard>
    </div>
  </div>
</template>
