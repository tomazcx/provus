<script setup lang="ts">
import type {
  QuestaoRevisaoResponse,
  AlternativaRevisaoResponse,
} from "~/types/api/response/Revisao.response";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";

const props = defineProps<{
  questao: QuestaoRevisaoResponse;
  numero: number;
}>();

const status = computed(() => {
  const estado = props.questao.estadoCorrecao;
  const pontuacaoObtida = parseFloat(props.questao.pontuacaoObtida ?? "0");

  switch (estado) {
    case EstadoQuestaoCorrigida.CORRETA:
      return {
        text: "Correta",
        color: "secondary" as const,
        icon: "i-lucide-check",
      };
    case EstadoQuestaoCorrigida.INCORRETA:
      return {
        text: "Incorreta",
        color: "error" as const,
        icon: "i-lucide-x",
      };
    case EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA:
      return {
        text: `Parcial (${pontuacaoObtida.toFixed(1)} pontos)`,
        color: "warning" as const,
        icon: "i-lucide-alert-circle",
      };
    case EstadoQuestaoCorrigida.NAO_RESPONDIDA:
    default:
      return {
        text: "Não Respondida",
        color: "primary" as const,
        icon: "i-lucide-minus",
      };
  }
});

function isAlternativeSelected(alternativeId: number): boolean {
  const dados = props.questao.dadosResposta;
  if (!dados) return false;
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

type AlternativeStatus =
  | "correct-selected"
  | "incorrect-selected"
  | "correct-unselected"
  | "neutral";

function getAlternativeStatus(
  alt: AlternativaRevisaoResponse
): AlternativeStatus {
  const isSelected = isAlternativeSelected(alt.id);
  const isCorrect = alt.isCorreto;

  if (isSelected && isCorrect) return "correct-selected";
  if (isSelected && !isCorrect) return "incorrect-selected";
  if (!isSelected && isCorrect) return "correct-unselected";
  return "neutral";
}
</script>

<template>
  <UCard
    v-if="questao"
    :id="`question-${questao.id}`"
    class="shadow-sm border border-gray-200"
  >
    <div
      class="flex items-start sm:items-center justify-between mb-4 flex-wrap gap-2"
    >
      <h3 class="text-xl font-bold text-primary">Questão {{ numero }}</h3>
      <div class="flex items-center space-x-3 flex-wrap gap-2">
        <UBadge :color="status.color" variant="solid" size="md">
          <Icon :name="status.icon" class="mr-1 h-4 w-4" />
          {{ status.text }}
        </UBadge>
        <UBadge color="primary" variant="soft" size="md">
          {{ questao.pontuacaoObtida ?? 0 }}/{{ questao.pontuacaoMaxima }}
          pontos
        </UBadge>
      </div>
    </div>

    <p class="text-lg text-gray-800 mb-2 font-medium">{{ questao.titulo }}</p>
    <p
      v-if="questao.descricao"
      class="text-sm text-gray-600 mb-6 prose max-w-none"
    >
      {{ questao.descricao }}
    </p>

    <div class="space-y-4">
      <template v-if="questao.tipo === TipoQuestaoEnum.DISCURSIVA">
        <div class="mb-4">
          <h4
            class="font-semibold text-gray-700 mb-2 text-sm flex items-center gap-1.5"
          >
            <Icon name="i-lucide-user-round" class="h-4 w-4" /> Sua Resposta:
          </h4>
          <div
            class="bg-gray-100 border border-gray-200 rounded-lg p-4 text-gray-800 text-sm"
          >
            <p
              v-if="
                questao.dadosResposta &&
                'texto' in questao.dadosResposta &&
                questao.dadosResposta.texto
              "
              class="whitespace-pre-wrap"
            >
              {{ questao.dadosResposta.texto }}
            </p>
            <p v-else class="text-gray-500 italic">
              Você não respondeu a esta questão.
            </p>
          </div>
        </div>
        <div v-if="questao.exemploRespostaIa">
          <h4
            class="font-semibold text-gray-700 mb-2 text-sm flex items-center gap-1.5"
          >
            <Icon name="i-lucide-lightbulb" class="h-4 w-4" /> Resposta Esperada
            / Gabarito:
          </h4>
          <div
            class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm"
          >
            <p class="whitespace-pre-wrap">
              {{ questao.exemploRespostaIa }}
            </p>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="space-y-3">
          <div
            v-for="alt in questao.alternativas"
            :key="alt.id"
            class="flex items-center space-x-3 p-3 border-2 rounded-lg text-sm"
            :class="{
              'border-green-500 bg-green-50':
                getAlternativeStatus(alt) === 'correct-selected' ||
                getAlternativeStatus(alt) === 'correct-unselected',
              'border-red-500 bg-red-50':
                getAlternativeStatus(alt) === 'incorrect-selected',
              'border-gray-200 bg-gray-50':
                getAlternativeStatus(alt) === 'neutral',
            }"
          >
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
              :class="{
                'bg-green-500':
                  getAlternativeStatus(alt) === 'correct-selected',
                'bg-red-500':
                  getAlternativeStatus(alt) === 'incorrect-selected',
                'border-2 border-green-500 bg-white':
                  getAlternativeStatus(alt) === 'correct-unselected',
                'border-2 border-gray-300 bg-white':
                  getAlternativeStatus(alt) === 'neutral',
              }"
            >
              <Icon
                v-if="getAlternativeStatus(alt) === 'correct-selected'"
                name="i-lucide-check"
                class="w-3 h-3"
              />
              <Icon
                v-if="getAlternativeStatus(alt) === 'incorrect-selected'"
                name="i-lucide-x"
                class="w-3 h-3"
              />
              <Icon
                v-if="getAlternativeStatus(alt) === 'correct-unselected'"
                name="i-lucide-check"
                class="w-3 h-3 text-green-500"
              />
            </div>

            <span class="text-gray-800 flex-1">{{ alt.descricao }}</span>

            <span
              v-if="isAlternativeSelected(alt.id)"
              class="text-xs font-medium text-blue-600 ml-auto mr-2 shrink-0"
              >(Sua Resposta)</span
            >
            <span
              v-if="alt.isCorreto"
              class="text-xs font-semibold text-green-600 ml-auto shrink-0"
              >(Correta)</span
            >
          </div>
        </div>
        <div
          v-if="questao.exemploRespostaIa"
          class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
        >
          <h4
            class="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-1.5"
          >
            <Icon name="i-lucide-info" class="h-4 w-4" /> Explicação da Resposta
            Correta:
          </h4>
          <p class="text-blue-800 text-sm whitespace-pre-wrap">
            {{ questao.exemploRespostaIa }}
          </p>
        </div>
      </template>

      <div
        v-if="questao.textoRevisao"
        class="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6"
      >
        <h4
          class="font-semibold text-amber-900 mb-2 text-sm flex items-center gap-1.5"
        >
          <Icon name="i-lucide-message-square-quote" class="h-4 w-4" /> Feedback
          do Professor:
        </h4>
        <p class="text-amber-800 text-sm whitespace-pre-wrap">
          {{ questao.textoRevisao }}
        </p>
      </div>
    </div>
  </UCard>
</template>
