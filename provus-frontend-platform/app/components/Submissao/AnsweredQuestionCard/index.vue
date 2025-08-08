<script setup lang="ts">
import type { IQuestao, IAlternativa } from "~/types/IQuestao";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import EstadoQuestaoCorrigida from "~/enums/EstadoQuestaoCorrigida";

const props = defineProps<{
  questao: IQuestao;
  numero: number;
}>();

const headerVisuals = computed(() => {
  const estado = props.questao.resposta?.estadoCorrecao;
  const pontuacaoObtida = props.questao.resposta?.pontuacao ?? 0;

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

function isAlternativeSelected(alternative: IAlternativa): boolean {
  const { questao } = props;
  if (!questao.resposta) return false;

  if (questao.tipo === TipoQuestaoEnum.OBJETIVA) {
    return questao.resposta.dados.alternativaId === alternative.id;
  }

  if (
    questao.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA ||
    questao.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO
  ) {
    return questao.resposta.dados.alternativasId.includes(alternative.id!);
  }

  return false;
}
</script>

<template>
  <UCard v-if="questao">
    <div class="flex items-start justify-between mb-4">
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
      <span class="text-sm text-gray-500">Questão {{ numero }}</span>
    </div>

    <h3 class="text-lg font-semibold text-gray-900 mb-3">
      {{ questao.titulo }}
    </h3>
    <p v-if="questao.descricao" class="text-sm text-gray-500 mb-4">
      {{ questao.descricao }}
    </p>

    <div class="space-y-3">
      <template
        v-if="questao.tipo === TipoQuestaoEnum.DISCURSIVA && questao.resposta"
      >
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div class="flex items-center space-x-2 mb-2">
            <Icon name="i-lucide-message-square" class="text-gray-500" />
            <span class="text-sm font-medium text-gray-600"
              >Resposta do Aluno</span
            >
          </div>
          <p class="text-gray-900">{{ questao.resposta.dados.texto }}</p>
        </div>
        <div
          v-if="questao.exemploDeResposta"
          class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex items-center space-x-2 mb-2">
            <Icon name="i-lucide-lightbulb" class="text-blue-600" />
            <span class="text-sm font-medium text-blue-600"
              >Resposta Esperada</span
            >
          </div>
          <p class="text-gray-700">{{ questao.exemploDeResposta }}</p>
        </div>
      </template>

      <template
        v-if="
          (questao.tipo === TipoQuestaoEnum.OBJETIVA ||
            questao.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA ||
            questao.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO) &&
          questao.alternativas
        "
      >
        <div
          v-for="alt in questao.alternativas"
          :key="alt.id"
          class="flex items-center space-x-3 p-3 border rounded-lg"
          :class="{
            'bg-green-50 border-green-200': alt.isCorreto,
            'bg-red-50 border-red-200':
              !alt.isCorreto && isAlternativeSelected(alt),
            'bg-gray-50 border-gray-200':
              !alt.isCorreto && !isAlternativeSelected(alt),
          }"
        >
          <Icon
            v-if="alt.isCorreto"
            name="i-lucide-check-circle-2"
            class="text-green-600"
          />
          <Icon
            v-else-if="!alt.isCorreto && isAlternativeSelected(alt)"
            name="i-lucide-x-circle"
            class="text-red-600"
          />
          <div v-else class="w-5 h-5" />
          <span class="text-gray-900 flex-1">{{ alt.descricao }}</span>

          <UBadge v-if="alt.isCorreto" color="secondary" variant="subtle"
            >Resposta Correta</UBadge
          >
          <UBadge
            v-if="isAlternativeSelected(alt)"
            color="error"
            variant="subtle"
            >Sua Resposta</UBadge
          >
        </div>
      </template>
    </div>

    <div
      v-if="questao.resposta?.textoRevisao"
      class="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400"
    >
      <h4 class="font-semibold text-sm text-amber-800">
        Feedback do Professor:
      </h4>
      <p class="text-sm text-amber-700 mt-1">
        {{ questao.resposta.textoRevisao }}
      </p>
    </div>
  </UCard>
</template>
