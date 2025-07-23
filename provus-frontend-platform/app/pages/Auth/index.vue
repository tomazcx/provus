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
        <UTabs :items="tabItems" class="w-full">
          <template #login="{}">
            <LoginForm />
          </template>

          <template #cadastro="{}">
            <RegisterForm />
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

definePageMeta({
  layout: false,
});

const tabItems = [
  { key: "login", label: "Login", slot: "login" },
  { key: "cadastro", label: "Cadastro", slot: "cadastro" },
];
</script>
