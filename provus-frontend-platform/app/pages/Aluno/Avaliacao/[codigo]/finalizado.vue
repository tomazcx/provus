<script setup lang="ts">
import { useStudentAssessmentStore } from '~/store/studentAssessmentStore';

const studentAssessmentStore = useStudentAssessmentStore();
const router = useRouter();

const submission = computed(() => studentAssessmentStore.currentSubmission);
const assessment = computed(() => studentAssessmentStore.assessment);

if (!submission.value || !assessment.value) {
  router.push('/aluno/entrar');
}

const scorePercent = computed(() => {
  if (!submission.value || !assessment.value?.pontuacao) return 0;
  return (submission.value.pontuacaoTotal / assessment.value.pontuacao) * 100;
});

const confirmationCode = computed(() => `SUB-${submission.value?.id}`);

function reviewAnswers() {
  alert("Navegando para a página de revisão de respostas...");
}

function backToHome() {
  router.push('/aluno/entrar');
}
</script>

<template>
  <div v-if="submission && assessment" class="font-sans bg-gradient-to-br from-primary/10 to-secondary/10 min-h-screen flex items-center justify-center p-4">
    <UCard>
      <div class="text-center mb-4">
        <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="i-lucide-check" class="text-white text-4xl" />
        </div>
        <h1 class="text-2xl font-bold text-primary mb-4">
          Avaliação Enviada com Sucesso!
        </h1>
      </div>

      <UCard>
        <h2 class="text-xl font-semibold text-primary mb-4">Resumo da Avaliação</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <UCard>
            <p class="text-sm text-gray-600 mb-1">Nome da Avaliação</p>
            <p class="font-semibold text-gray-900">{{ assessment.titulo }}</p>
          </UCard>
          <UCard>
            <p class="text-sm text-gray-600 mb-1">Professor</p>
            <p class="font-semibold text-gray-900">Prof. Responsável</p>
          </UCard>
          <UCard>
            <p class="text-sm text-gray-600 mb-1">Data de Envio</p>
            <p class="font-semibold text-gray-900">{{ new Date(submission.finalizadoEm!).toLocaleString('pt-BR') }}</p>
          </UCard>
          <UCard>
            <p class="text-sm text-gray-600 mb-1">Tempo Utilizado</p>
            <p class="font-semibold text-gray-900">Não calculado</p>
          </UCard>
        </div>

        <template v-if="assessment.configuracoes.exibirPontuacaDaSubmissao">
          <UCard>
            <div class="text-center">
              <p class="text-sm text-gray-600 mb-2">Sua Pontuação</p>
              <p class="text-3xl font-bold text-secondary mb-2">
                {{ submission.pontuacaoTotal }}/{{ assessment.pontuacao }}
              </p>
              <UProgress :value="scorePercent" class="mt-4" />
            </div>
          </UCard>
        </template>
        <template v-else>
           <UAlert
            icon="i-lucide-lock"
            title="Pontuação Oculta"
            description="A pontuação desta avaliação será divulgada pelo professor posteriormente."
          />
        </template>
      </UCard>

      <div class="bg-primary rounded-xl p-6 mb-5 mt-5">
        <h3 class="text-white font-semibold mb-4 flex items-center">
          <Icon name="i-lucide-shield-check" class="mr-2" />
          Código de Confirmação de Envio
        </h3>
        <div class="bg-white rounded-lg p-4 mb-4 text-center">
          <p class="text-sm text-gray-600 mb-2">Apresente este código ao seu professor</p>
          <p class="text-2xl font-mono font-bold text-primary tracking-wider">{{ confirmationCode }}</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4">
        <UButton
          v-if="assessment.configuracoes.permitirRevisao"
          block
          color="primary"
          size="lg"
          icon="i-lucide-eye"
          @click="reviewAnswers"
        >
          Revisar Respostas
        </UButton>
        <UButton
          block
          color="primary"
          variant="outline"
          size="lg"
          icon="i-lucide-home"
          :class="{ 'w-full': !assessment.configuracoes.permitirRevisao }"
          @click="backToHome"
        >
          Voltar para o Início
        </UButton>
      </div>
    </UCard>
  </div>
</template>