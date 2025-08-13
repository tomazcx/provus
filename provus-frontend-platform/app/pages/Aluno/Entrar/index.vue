<script setup lang="ts">
import { reactive } from "vue";
import { z } from "zod";
import { useStudentAssessmentStore } from "~/store/studentAssessmentStore";

definePageMeta({
  layout: false,
});

const schema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Digite um e-mail válido"),
  examCode: z.string().length(6, "O código deve ter 6 dígitos"),
});

const formState = reactive({
  fullName: undefined,
  email: undefined,
  examCode: undefined,
});

const studentAssessmentStore = useStudentAssessmentStore();
const isLoading = computed(() => studentAssessmentStore.isLoading);
const toast = useToast();
const router = useRouter();

async function handleSubmit() {
  if (!formState.examCode) return;

  const application = await studentAssessmentStore.findApplicationByCode(
    formState.examCode
  );

  if (!application) {
    toast.add({
      title: "Erro de Verificação",
      description:
        studentAssessmentStore.error || "Ocorreu um erro inesperado.",
      icon: "i-lucide-alert-triangle",
      color: "error",
    });
    return;
  }

  toast.add({
    title: "Identidade Verificada!",
    description: "Você será redirecionado para a avaliação.",
    icon: "i-lucide-check-circle",
    color: "secondary",
  });

  localStorage.setItem("student_name", formState.fullName || "");
  localStorage.setItem("student_email", formState.email || "");

  router.push(`/aluno/avaliacao/${formState.examCode}`);
}
</script>
<template>
  <div
    class="bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen flex flex-col px-4 py-6 sm:py-8 font-sans"
  >
    <div class="flex-1 flex flex-col justify-center w-full max-w-md mx-auto">
      <div class="flex justify-center mb-6">
        <div class="bg-white p-3 sm:p-4 rounded-full shadow-lg">
          <div
            class="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center"
          >
            <Icon
              name="i-lucide-graduation-cap"
              class="text-white text-lg sm:text-2xl"
            />
          </div>
        </div>
      </div>

      <UCard class="p-4 rounded-2xl" shadow-lg>
        <div class="text-center mb-6">
          <h1 class="text-xl sm:text-3xl font-bold text-primary mb-2">
            Identificação
          </h1>
          <p class="text-gray-600 text-sm">
            Insira seus dados para acessar a avaliação
          </p>
        </div>

        <UForm
          :schema="schema"
          :state="formState"
          class="space-y-5"
          @submit="handleSubmit"
        >
          <UFormField label="Nome Completo" name="fullName" required>
            <UInput
              v-model="formState.fullName"
              placeholder="Digite seu nome completo"
              size="xl"
              icon="i-lucide-user"
              class="w-full"
            />
          </UFormField>

          <UFormField label="E-mail" name="email" required>
            <UInput
              v-model="formState.email"
              placeholder="seu.email@instituicao.edu"
              size="xl"
              icon="i-lucide-mail"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Código da Avaliação" name="examCode" required>
            <UInput
              v-model="formState.examCode"
              placeholder="000000"
              size="xl"
              icon="i-lucide-key-round"
              class="w-full"
            />
          </UFormField>

          <div class="pt-3">
            <UButton
              type="submit"
              block
              color="primary"
              size="xl"
              :loading="isLoading"
            >
              <Icon name="i-lucide-check-circle" class="mr-2" />
              Verificar Identidade
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>
