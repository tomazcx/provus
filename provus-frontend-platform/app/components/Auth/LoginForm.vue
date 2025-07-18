<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold text-primary mb-6">Bem vindo de volta!</h2>
    <form class="space-y-6" @submit.prevent>
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
          :type="show ? 'text' : 'password'"
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
              aria-controls="password"
              :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="show ? 'Hide password' : 'Show password'"
              :aria-pressed="show"
              :ui="{ icon: { base: 'flex-shrink-0 h-5 w-5 ml-2' } }"
              @click="show = !show"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton
        type="submit"
        color="primary"
        size="xl"
        block
        class="flex justify-center items-center gap-x-2"
      >
        <span>Entrar</span>

        <Icon name="i-heroicons-arrow-right-20-solid" class="h-5 w-5" />
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
const show = ref(false);
const email = ref("");
const password = ref("");
</script>
