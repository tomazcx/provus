<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold text-primary mb-6">Bem vindo de volta!</h2>
    <UForm
      :schema="loginSchema"
      :state="form"
      class="space-y-6"
      @submit="onSubmit"
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

      <UFormField label="Senha" name="password" required>
        <UInput
          v-model="form.password"
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
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { loginSchema, type LoginFormData } from '../../utils/authValidation';

withDefaults(
  defineProps<{
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  }
);

const emit = defineEmits<{
  (e: 'submit', payload: LoginFormData): void;
}>();

const show = ref(false);

const form = reactive({
  email: '',
  password: '',
});

function onSubmit(event: { data: LoginFormData }) {
  emit('submit', event.data);
}
</script>
