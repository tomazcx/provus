<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

const config = useRuntimeConfig();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const isLoading = ref(false);

const registeredUser = ref(false);

async function onSubmit() {
  error.value = "";

  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  if (password.value !== confirmPassword.value) {
    error.value = "As senhas não coincidem";
    return;
  }

  try {
    await axios.post(`${config.public.provusApiUrl}/api/auth/sign-up`, {
      name: name.value,
      email: email.value,
      password: password.value,
    });

    error.value = "";
    registeredUser.value = true;
  } catch (err) {
    console.log(err);
    error.value = err.response.data.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <main
    v-if="!registeredUser"
    class="bg-blue-200 h-screen flex items-center justify-center"
  >
    <form
      @submit.prevent="onSubmit"
      class="bg-white p-10 w-10/12 max-w-md rounded-lg shadow-md"
    >
      <h1 class="text-2xl font-bold text-center">Provus - Cadastro</h1>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="name" class="text-sm font-medium">Nome</label>
          <input
            required
            type="text"
            id="name"
            v-model="name"
            class="w-full p-2 rounded-md border border-gray-300"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-medium">Email</label>
          <input
            required
            type="email"
            id="email"
            v-model="email"
            class="w-full p-2 rounded-md border border-gray-300"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="password" class="text-sm font-medium">Senha</label>
          <input
            required
            type="password"
            id="password"
            v-model="password"
            class="w-full p-2 rounded-md border border-gray-300"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="confirmPassword" class="text-sm font-medium"
            >Confirmar Senha</label
          >
          <input
            required
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            class="w-full p-2 rounded-md border border-gray-300"
          />
        </div>

        <p class="text-red-500 text-sm">{{ error }}</p>
        <button
          :disabled="isLoading"
          type="submit"
          class="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
        >
          {{ isLoading ? "Carregando..." : "Cadastrar" }}
        </button>
      </div>
    </form>
  </main>
  <main v-else class="bg-blue-200 h-screen flex items-center justify-center">
    <section class="bg-white p-10 w-10/12 max-w-md rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center">
        Cadastro realizado com sucesso!
      </h1>
      <p class="text-center mt-4 text-gray-700 text-sm">
        Obrigado por se cadastrar! Agora você pode fazer login no sistema.
      </p>
    </section>
  </main>
</template>
