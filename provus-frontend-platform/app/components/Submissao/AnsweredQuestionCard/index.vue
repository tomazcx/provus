<script setup lang="ts">
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";
import type { AvaliadorQuestaoDetalheApiResponse } from "~/types/api/response/AvaliadorQuestaoDetalhe.response";
import { z } from "zod";

const props = defineProps<{
  questao: AvaliadorQuestaoDetalheApiResponse;
  numero: number;
  // isPending: boolean;
}>();

const emit = defineEmits<{
  (
    e: "save-correction",
    payload: { pontuacao: number; textoRevisao: string }
  ): void;
}>();

const correctionSchema = z.object({
  pontuacao: z
    .number()
    .min(0, "Pontuação não pode ser negativa")
    .max(
      props.questao.pontuacaoMaxima,
      `Pontuação não pode ser maior que ${props.questao.pontuacaoMaxima}`
    ),
  textoRevisao: z.string().optional(),
});

const formCorrecao = reactive({
  pontuacao: props.questao.pontuacaoObtida ?? 0,
  textoRevisao: props.questao.textoRevisao ?? "",
});

const headerVisuals = computed(() => {
  const estado = props.questao.estadoCorrecao;
  const pontuacaoObtida = props.questao.pontuacaoObtida ?? 0;
  switch (estado) {
    case EstadoQuestaoCorrigida.CORRETA:
      return {
        text: `Correta • ${pontuacaoObtida} ponto(s)`,
        icon: "i-lucide-check",
        colorClasses: "bg-green-100 text-green-600",
      };
    case EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA:
      return {
        text: `Parcialmente Correta • ${pontuacaoObtida} ponto(s)`,
        icon: "i-lucide-check-circle",
        colorClasses: "bg-yellow-100 text-yellow-600",
      };
    case EstadoQuestaoCorrigida.INCORRETA:
      return {
        text: `Incorreta • ${pontuacaoObtida} ponto(s)`,
        icon: "i-lucide-x",
        colorClasses: "bg-red-100 text-red-600",
      };
    case EstadoQuestaoCorrigida.NAO_RESPONDIDA:
    default:
      return {
        text: `Não Respondida • 0 pontos`,
        icon: "i-lucide-minus-circle",
        colorClasses: "bg-gray-100 text-gray-600",
      };
  }
});

function isAlternativeSelected(alternativeId: number): boolean {
  const dados = props.questao.dadosResposta;
  if (!dados || typeof dados !== "object" || Object.keys(dados).length === 0)
    return false;
  if (
    "alternativa_id" in dados &&
    (typeof dados.alternativa_id === "number" || dados.alternativa_id === null)
  ) {
    return dados.alternativa_id === alternativeId;
  }
  if ("alternativas_id" in dados && Array.isArray(dados.alternativas_id)) {
    return dados.alternativas_id.includes(alternativeId);
  }
  return false;
}

const getStudentDiscursiveAnswer = computed(() => {
  const dados = props.questao.dadosResposta;
  if (
    dados &&
    typeof dados === "object" &&
    "texto" in dados &&
    typeof dados.texto === "string"
  ) {
    return dados.texto;
  }
  return null;
});
</script>

<template>
  <UCard v-if="questao" :id="`question-${questao.id}`">
    <div class="flex items-start justify-between mb-4 flex-wrap gap-2">
      <div class="flex items-center space-x-3">
        <div
          :class="headerVisuals.colorClasses"
          class="w-8 h-8 rounded-full flex items-center justify-center"
        >
          <Icon :name="headerVisuals.icon" class="text-sm" />
        </div>
        <span class="text-sm font-medium" :class="headerVisuals.colorClasses">
          {{ headerVisuals.text }}
        </span>
      </div>
      <span class="text-sm text-gray-500"
        >Questão {{ numero }} • {{ questao.pontuacaoMaxima }} Ponto(s)</span
      >
    </div>

    <h3 class="text-lg font-semibold text-gray-900 mb-3">
      {{ questao.titulo }}
    </h3>
    <p v-if="questao.descricao" class="text-sm text-gray-500 mb-4">
      {{ questao.descricao }}
    </p>

    <div class="space-y-3">
      <template v-if="questao.tipo === TipoQuestaoEnum.DISCURSIVA">
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div class="flex items-center space-x-2 mb-2">
            <Icon name="i-lucide-message-square" class="text-gray-500" />
            <span class="text-sm font-medium text-gray-600"
              >Resposta do Aluno</span
            >
          </div>
          <p
            v-if="getStudentDiscursiveAnswer"
            class="text-gray-900 whitespace-pre-wrap"
          >
            {{ getStudentDiscursiveAnswer }}
          </p>
          <p v-else class="text-gray-500 italic">Aluno não respondeu.</p>
        </div>
        <div
          v-if="questao.exemploRespostaIa"
          class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex items-center space-x-2 mb-2">
            <Icon name="i-lucide-lightbulb" class="text-blue-600" />
            <span class="text-sm font-medium text-blue-600"
              >Resposta Esperada / Gabarito</span
            >
          </div>
          <p class="text-gray-700 whitespace-pre-wrap">
            {{ questao.exemploRespostaIa }}
          </p>
        </div>
      </template>

      <template
        v-else-if="questao.alternativas && questao.alternativas.length > 0"
      >
        <div
          v-for="alt in questao.alternativas"
          :key="alt.id"
          class="flex items-center space-x-3 p-3 border rounded-lg"
          :class="{
            'bg-green-50 border-green-200': alt.isCorreto,
            'bg-red-50 border-red-200':
              !alt.isCorreto && isAlternativeSelected(alt.id),
            'bg-gray-50 border-gray-200':
              !alt.isCorreto && !isAlternativeSelected(alt.id),
          }"
        >
          <Icon
            v-if="alt.isCorreto"
            name="i-lucide-check-circle-2"
            class="text-green-600 shrink-0"
          />
          <Icon
            v-else-if="!alt.isCorreto && isAlternativeSelected(alt.id)"
            name="i-lucide-x-circle"
            class="text-red-600 shrink-0"
          />
          <Icon v-else name="i-lucide-circle" class="text-gray-400 shrink-0" />
          <span class="text-gray-900 flex-1">{{ alt.descricao }}</span>
          <UBadge
            v-if="isAlternativeSelected(alt.id)"
            color="info"
            variant="subtle"
            size="xs"
            class="ml-auto shrink-0"
            >Sua Resposta</UBadge
          >
          <UBadge
            v-if="alt.isCorreto"
            color="secondary"
            variant="subtle"
            size="xs"
            class="ml-2 shrink-0"
            >Gabarito</UBadge
          >
        </div>
        <div
          v-if="questao.exemploRespostaIa"
          class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h4
            class="font-semibold text-sm text-blue-800 mb-1 flex items-center gap-1.5"
          >
            <Icon name="i-lucide-info" class="h-4 w-4" /> Explicação do
            Gabarito:
          </h4>
          <p class="text-sm text-blue-700 whitespace-pre-wrap">
            {{ questao.exemploRespostaIa }}
          </p>
        </div>
      </template>
    </div>

    <template v-if="questao.tipo === TipoQuestaoEnum.DISCURSIVA">
      <UForm
        :schema="correctionSchema"
        :state="formCorrecao"
        class="mt-6 pt-6 border-t border-gray-200 space-y-4"
        @submit="emit('save-correction', formCorrecao)"
      >
        <h4 class="text-md font-semibold text-primary">
          Formulário de Correção Manual
        </h4>
        <UFormField
          label="Pontuação Atribuída"
          name="pontuacao"
          required
          :hint="`Valor máximo: ${questao.pontuacaoMaxima} pontos`"
        >
          <UInputNumber
            v-model="formCorrecao.pontuacao"
            :min="0"
            :max="questao.pontuacaoMaxima"
            :step="0.5"
          />
        </UFormField>
        <UFormField
          label="Feedback para o Aluno (Opcional)"
          name="textoRevisao"
        >
          <UTextarea
            v-model="formCorrecao.textoRevisao"
            placeholder="Digite seu feedback aqui..."
            class="flex"
            :rows="3"
          />
        </UFormField>
        <UButton
          type="submit"
          label="Salvar Correção"
          color="secondary"
          icon="i-lucide-check"
        />
      </UForm>
    </template>
  </UCard>
</template>
