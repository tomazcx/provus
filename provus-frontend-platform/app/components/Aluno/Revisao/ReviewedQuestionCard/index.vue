<script setup lang="ts">
import type { IQuestao, IAlternativa } from "~/types/IQuestao";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";

const props = defineProps<{
  questao: IQuestao;
  numero: number;
}>();

function getAlternativeStatus(alt: IAlternativa) {
  const resposta = props.questao.resposta;
  if (!resposta) return "neutral";

  const isCorrect = alt.isCorreto;
  let isSelected = false;

  if ("alternativaId" in resposta.dados) {
    isSelected = resposta.dados.alternativaId === alt.id;
  } else if ("alternativasId" in resposta.dados) {
    isSelected = resposta.dados.alternativasId.includes(alt.id!);
  }

  if (isSelected && isCorrect) return "correct-selected";
  if (isSelected && !isCorrect) return "incorrect-selected";
  if (!isSelected && isCorrect) return "correct-unselected";

  return "neutral";
}

const status = computed<{
  text: string;
  color: "secondary" | "error" | "warning" | "primary";
}>(() => {
  const estado = props.questao.resposta?.estadoCorrecao;
  if (estado === EstadoQuestaoCorrigida.CORRETA)
    return { text: "Correta", color: "secondary" };
  if (estado === EstadoQuestaoCorrigida.INCORRETA)
    return { text: "Incorreta", color: "error" };
  if (estado === EstadoQuestaoCorrigida.PARCIALMENTE_CORRETA)
    return { text: "Parcial", color: "warning" };
  return { text: "Não Respondida", color: "primary" };
});
</script>

<template>
  <UCard :id="`question-${questao.id}`">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-primary">Questão {{ numero }}</h3>
      <div class="flex items-center space-x-3">
        <UBadge :color="status.color" variant="solid">
          <Icon
            v-if="status.text === 'Correta'"
            name="i-lucide-check"
            class="mr-1"
          />
          <Icon
            v-if="status.text === 'Incorreta'"
            name="i-lucide-x"
            class="mr-1"
          />
          <Icon
            v-if="status.text === 'Parcial'"
            name="i-lucide-alert-circle"
            class="mr-1"
          />
          {{ status.text }}
        </UBadge>
        <UBadge color="primary" variant="soft">
          {{ questao.resposta?.pontuacao ?? 0 }}/{{ questao.pontuacao }} pontos
        </UBadge>
      </div>
    </div>

    <p class="text-lg text-gray-800 mb-6">{{ questao.titulo }}</p>

    <div class="space-y-4">
      <template v-if="questao.tipo === TipoQuestaoEnum.DISCURSIVA">
        <div>
          <h4 class="font-semibold text-gray-900 mb-2">Sua Resposta:</h4>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p class="text-gray-800 whitespace-pre-wrap">
              {{
                questao.resposta?.dados.texto ||
                "Você não respondeu a esta questão."
              }}
            </p>
          </div>
        </div>
        <div v-if="questao.exemploDeResposta">
          <h4 class="font-semibold text-gray-900 mb-2">Resposta Esperada:</h4>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-gray-800 whitespace-pre-wrap">
              {{ questao.exemploDeResposta }}
            </p>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="space-y-3">
          <div
            v-for="alt in questao.alternativas"
            :key="alt.id"
            class="flex items-center space-x-3 p-3 border-2 rounded-lg"
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
              class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
              :class="{
                'bg-green-500':
                  getAlternativeStatus(alt) === 'correct-selected',
                'bg-red-500':
                  getAlternativeStatus(alt) === 'incorrect-selected',
                'border-2 border-gray-300':
                  getAlternativeStatus(alt) === 'neutral' ||
                  getAlternativeStatus(alt) === 'correct-unselected',
              }"
            >
              <Icon
                v-if="getAlternativeStatus(alt) === 'correct-selected'"
                name="i-lucide-check"
              />
              <Icon
                v-if="getAlternativeStatus(alt) === 'incorrect-selected'"
                name="i-lucide-x"
              />
            </div>

            <span
              class="text-gray-800"
              :class="{
                'font-medium': getAlternativeStatus(alt) !== 'neutral',
              }"
            >
              {{ alt.descricao }}
              <span
                v-if="getAlternativeStatus(alt) === 'incorrect-selected'"
                class="text-red-600 font-normal"
                >- (Sua resposta)</span
              >
              <span
                v-else-if="getAlternativeStatus(alt) === 'correct-selected'"
                class="text-green-700 font-normal"
                >- (Sua resposta)</span
              >
            </span>

            <span
              v-if="
                getAlternativeStatus(alt) === 'correct-unselected' ||
                getAlternativeStatus(alt) === 'correct-selected'
              "
              class="ml-auto text-green-600 text-sm font-semibold"
            >
              Resposta Correta
            </span>
          </div>
        </div>
      </template>

      <div
        v-if="questao.resposta?.textoRevisao"
        class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
      >
        <h4 class="font-semibold text-blue-900 mb-2">Feedback do Professor:</h4>
        <p class="text-blue-800 text-sm">{{ questao.resposta.textoRevisao }}</p>
      </div>
    </div>
  </UCard>
</template>
