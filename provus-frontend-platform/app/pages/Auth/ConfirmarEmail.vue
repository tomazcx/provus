<template>
  <div
    class="font-sans bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div class="flex justify-center mb-8">
        <Icon
          v-if="isLoading"
          name="i-lucide-loader-2"
          class="animate-spin text-5xl"
        />
        <Icon
          v-else
          name="i-lucide-circle-check"
          class="text-secondary text-5xl"
        />
      </div>

      <UCard v-if="!isLoading" class="shadow-md">
        <h3 class="text-lg text-center font-semibold mb-2">
          E-mail confirmado!
        </h3>
        <p class="text-md text-center text-gray-600 mb-5">
          Você já pode fazer o login!
        </p>
        <NuxtLink to="/auth">
          <UButton color="primary" size="xl" block>
            Ir para tela de login
          </UButton>
        </NuxtLink>
      </UCard>

      <div class="mt-8 text-center" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const isLoading = ref(false);

const route = useRoute();
console.log(route);
const { $api } = useNuxtApp();
const toast = useToast();

onMounted(async () => {
  try {
    isLoading.value = true;

    const response = await $api("/auth/confirmar-email", {
      method: "PATCH",
      body: {
        hash: route.params.hash,
      },
    });
    console.log("Login bem-sucedido:", response);
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
});
</script>
