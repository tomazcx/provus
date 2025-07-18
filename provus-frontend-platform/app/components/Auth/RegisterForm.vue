<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold text-primary mb-6">Crie sua conta!</h2>
    <form class="space-y-5" @submit.prevent>
      <UFormField label="Nome completo" name="name" required>
        <UInput
          v-model="name"
          placeholder="John Doe"
          icon="i-heroicons-user"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField label="E-mail" name="email" required>
        <UInput
          v-model="email"
          placeholder="seu@email.com"
          icon="i-heroicons-envelope"
          size="xl"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Senha" name="password" required>
        <UInput
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
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
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="showPassword = !showPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UFormField label="Confirme sua senha" name="confirmPassword" required>
        <UInput
          v-model="confirmPassword"
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
              :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        size="xl"
        block
        class="flex justify-center items-center gap-x-2"
      >
        <span>Criar Conta</span>
        <Icon name="i-heroicons-user-plus-20-solid" class="h-5 w-5" />
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);
</script>