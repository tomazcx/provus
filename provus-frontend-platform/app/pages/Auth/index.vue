<template>
  <div
    class="font-sans bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div class="flex justify-center mb-8">
        <div class="bg-white p-4 rounded-full shadow-md">
          <div
            class="w-16 h-16 bg-primary rounded-full flex items-center justify-center"
          >
            <Icon name="fa6-solid:lock" class="text-white text-2xl" />
          </div>
        </div>
      </div>

      <UCard>
        <UTabs v-model="active" :items="tabItems" class="w-full">
          <template #login="{}">
            <LoginForm :is-loading="isLoading" @submit="handleLoginSubmit" />
          </template>

          <template #cadastro="{}">
            <RegisterForm
              :is-loading="isLoading"
              @submit="handleRegisterSubmit"
            />
          </template>
        </UTabs>
      </UCard>

      <div class="mt-8 text-center" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from "~/components/Auth/LoginForm.vue";
import RegisterForm from "~/components/Auth/RegisterForm.vue";
import type { LoginFormData, RegisterFormData } from '../../utils/authValidation';

definePageMeta({
  layout: false,
});

const toast = useToast();
const route = useRoute();
const router = useRouter();
const { $api } = useNuxtApp();
const isLoading = ref(false);

const tabItems = [
  { key: "login", label: "Login", slot: "login" },
  { key: "cadastro", label: "Cadastro", slot: "cadastro" },
];

const active = computed({
  get() {
    return (route.query.tab as string) || "0";
  },
  set(tab) {
    router.push({
      path: "/auth",
      query: { tab },
    });
  },
});

async function handleLoginSubmit(userData: LoginFormData) {
  try {
    isLoading.value = true;

    const response = await $api("/auth/sign-in", {
      method: "POST",
      body: {
        email: userData.email,
        senha: userData.password,
      },
    });

    useCookie("accessToken", {
      default: () => response.token,
      watch: false,
    });
  } catch (error) {
    toast.add({
      title: "Falha no login",
      description: error._data.message,
      icon: "i-lucide-x",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}

async function handleRegisterSubmit(userData: RegisterFormData) {
  try {
    isLoading.value = true;
    await $api("/auth/sign-up", {
      method: "POST",
      body: {
        nome: userData.name,
        email: userData.email,
        senha: userData.password,
      },
    });

    active.value = "0";

    toast.add({
      title: "Conta criada com sucesso!",
      description: "Verifique seu e-mail para ativar sua conta.",
      icon: "i-lucide-at-sign",
      color: "secondary",
    });
  } catch (error) {
    toast.add({
      title: "Falha no cadastro",
      description: error._data.message,
      icon: "i-lucide-x",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>
