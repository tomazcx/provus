<script setup lang="ts">
const route = useRoute();
const examId = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!examId.value);
</script>

<template>
  <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <UButton
            to="/home"
            color="primary"
            variant="ghost"
            icon="i-lucide-arrow-left"
            size="xl"
          />
          <span class="ml-3 text-xl font-bold text-primary">{{
            isEditing ? "Editar Prova" : "Criar Prova"
          }}</span>
        </div>

        <div class="flex items-center space-x-2">
          <UButton color="primary" variant="ghost" icon="i-heroicons-eye"
            >Ver como Aluno</UButton
          >
          <UButton
            color="primary"
            variant="ghost"
            icon="i-heroicons-cog-6-tooth"
            >Configurações</UButton
          >
          <UButton
            color="secondary"
            icon="i-heroicons-arrow-down-tray"
            @click="$emit('salvar')"
          >
            {{ isEditing ? "Salvar Alterações" : "Salvar Prova" }}
          </UButton>
          <UButton
            color="primary"
            icon="i-heroicons-calendar"
            @click="$emit('salvar')"
          >
            Agendar Prova
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>
