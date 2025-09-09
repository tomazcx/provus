<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold text-primary mb-6">Crie sua conta!</h2>
    <UForm
      :schema="registerSchema"
      :state="form"
      class="space-y-5"
      @submit="onSubmit"
    >
      <UFormField label="Nome completo" name="name" required>
        <UInput
          v-model="form.name"
          placeholder="John Doe"
          icon="i-heroicons-user"
          size="xl"
          class="w-full"
        />
      </UFormField>

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
          v-model="form.confirmPassword"
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
        :disabled="isLoading || !isFormValid"
      >
        <Icon
          v-if="isLoading"
          name="i-lucide-loader-2"
          class="animate-spin h-8 w-8"
        />
        <template v-else>
          <span>Criar Conta</span>
          <Icon name="i-heroicons-user-plus-20-solid" class="h-5 w-5" />
        </template>
      </UButton>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { registerSchema, type RegisterFormData } from '../../utils/authValidation';

withDefaults(
  defineProps<{
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  }
);

const emit = defineEmits<{
  (e: 'submit', payload: RegisterFormData): void;
}>();

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const isFormValid = computed(() => {
  const result = registerSchema.safeParse(form);
  return result.success;
});

function onSubmit(event: { data: RegisterFormData }) {
  emit('submit', event.data);
}
</script>
