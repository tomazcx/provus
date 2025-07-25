<script setup lang="ts">
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { IAlternativa, IQuestao } from "~/types/IQuestao";

const model = defineModel<IQuestao>({ required: true });

defineProps<{ numero: number }>();

const emit = defineEmits(["remover"]);

function addAlternative() {
  if (model.value && "alternativas" in model.value) {
    model.value.alternativas?.push({
      descricao: "",
      isCorreto: false,
    });
  }
}

function removeAlternative(descricao: string) {
  if (model.value && "alternativas" in model.value) {
    model.value.alternativas = model.value.alternativas?.filter(
      (o) => o.descricao !== descricao
    );
  }
}

function toggleCorrect(alt: IAlternativa) {
  if (model.value && "alternativas" in model.value) {
    if (model.value.tipo === TipoQuestaoEnum.OBJETIVA) {
      model.value.alternativas?.forEach((o) => (o.isCorreto = false));
    }
    alt.isCorreto = !alt.isCorreto;
  }
}

const dificuldade = [
  DificuldadeQuestaoEnum.DIFICIL,
  DificuldadeQuestaoEnum.FACIL,
  DificuldadeQuestaoEnum.MEDIO,
];

const tipos = [
  TipoQuestaoEnum.DISCURSIVA,
  TipoQuestaoEnum.MULTIPLA_ESCOLHA,
  TipoQuestaoEnum.OBJETIVA,
  TipoQuestaoEnum.VERDADEIRO_FALSO,
];
</script>

<template>
  <UCard v-if="model">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center flex-wrap gap-x-4 gap-y-2">
        <div
          class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
        >
          {{ numero }}
        </div>
        <UFormField label="Tipo" size="sm">
          <USelectMenu
            v-model="model.tipo"
            :items="tipos"
            by="value"
            option-attribute="label"
          />
        </UFormField>
        <UFormField label="Dificuldade" size="sm">
          <USelect v-model="model.dificuldade" :items="dificuldade" />
        </UFormField>
        <UFormField label="Pontos" size="sm">
          <UInputNumber v-model.number="model.pontuacao" class="w-20" />
        </UFormField>
      </div>

      <div class="flex items-center space-x-1">
        <UButton
          color="primary"
          variant="ghost"
          icon="i-heroicons-arrows-up-down"
          class="cursor-grab"
        />
        <UButton
          color="error"
          variant="ghost"
          icon="i-heroicons-trash"
          @click="emit('remover')"
        />
      </div>
    </div>

    <div class="space-y-4">
      <UFormField label="Título da Questão">
        <UInput
          v-model="model.titulo"
          placeholder="Digite o enunciado da questão aqui..."
          class="w-full"
          autoresize
        />
      </UFormField>

      <UFormField label="Descrição da Questão (opcional)">
        <UTextarea
          v-model="model.descricao"
          placeholder="Digite uma breve descrição da questão aqui..."
          class="w-full"
          autoresize
        />
      </UFormField>

      <template v-if="model.tipo === TipoQuestaoEnum.DISCURSIVA">
        <UFormField label="Modelo de Resposta para I.A">
          <UTextarea
            v-model="model.exemploDeResposta"
            placeholder="Digite a resposta esperada para esta questão..."
            class="w-full"
            autoresize
          />
        </UFormField>
      </template>

      <template v-else-if="model.alternativas">
        <UFormField label="Alternativas">
          <div class="space-y-3">
            <div
              v-for="alt in model.alternativas"
              :key="alt.descricao"
              class="flex items-center space-x-3 p-3 border rounded-lg transition-colors duration-200"
              :class="{
                'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700':
                  alt.isCorreto,
                'border-gray-200 dark:border-gray-700': !alt.isCorreto,
              }"
            >
              <UInput
                v-model="alt.descricao"
                class="flex-1"
                placeholder="Texto da alternativa..."
              />
              <UButton
                icon="i-heroicons-check-circle-20-solid"
                :color="alt.isCorreto ? 'primary' : 'neutral'"
                :variant="alt.isCorreto ? 'solid' : 'ghost'"
                @click="toggleCorrect(alt)"
              />
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                :disabled="model.alternativas.length <= 1"
                @click="removeAlternative(alt.descricao)"
              />
            </div>
            <UButton
              label="Adicionar Alternativa"
              variant="link"
              icon="i-heroicons-plus"
              @click="addAlternative"
            />
          </div>
        </UFormField>
      </template>

      <UFormField label="Explicação da Resposta (Opcional)">
        <UTextarea
          v-model="model.textoRevisao"
          :rows="2"
          class="w-full"
          placeholder="Explique por que a resposta correta é essa. Será exibido ao aluno após a correção."
          autoresize
        />
      </UFormField>
    </div>
  </UCard>
</template>
