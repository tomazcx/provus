<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold text-primary mb-6">Bem vindo de volta!</h2>
    <form
      class="space-y-6"
      @submit.prevent="$emit('submit', { email, password })"
    >
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
        :disabled="isLoading"
      >
        <Icon
          v-if="isLoading"
          name="i-lucide-loader-2"
          class="animate-spin h-8 w-8"
        />
        <template v-else>
          <span>Entrar</span>

          <Icon name="i-heroicons-arrow-right-20-solid" class="h-5 w-5" />
        </template>
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  }
);

defineEmits(["submit"]);

const show = ref(false);
const email = ref("");
const password = ref("");
</script>
