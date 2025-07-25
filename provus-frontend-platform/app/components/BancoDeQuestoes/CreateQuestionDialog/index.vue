<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { IAlternativa, TQuestionForm } from "~/types/IQuestao";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "create", payload: TQuestionForm): void;
}>();

const questionTypeItems: RadioGroupItem[] = [
  {
    label: "Objetiva",
    value: TipoQuestaoEnum.OBJETIVA,
  },
  {
    label: "Múltipla Escolha",
    value: TipoQuestaoEnum.MULTIPLA_ESCOLHA,
  },
  { label: "Verdadeiro ou Falso", value: TipoQuestaoEnum.VERDADEIRO_FALSO },
  { label: "Discursiva", value: TipoQuestaoEnum.DISCURSIVA },
];

const questionDifficultyItems: RadioGroupItem[] = [
  { label: "Fácil", value: "Fácil" },
  { label: "Médio", value: "Médio" },
  { label: "Difícil", value: "Difícil" },
];

const form = reactive<TQuestionForm>({
  titulo: "",
  descricao: "",
  tipo: TipoQuestaoEnum.OBJETIVA,
  dificuldade: DificuldadeQuestaoEnum.FACIL,
  pontuacao: 5,
  alternativas: [
    {
      descricao: "",
      isCorreto: true,
    },
  ],
  exemploDeResposta: "",
  explicacao: "",
});

const isFreeText = computed(() => form.tipo === TipoQuestaoEnum.DISCURSIVA);
const isTrueFalse = computed(
  () => form.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO
);
const isSingleCorrect = computed(() => form.tipo === TipoQuestaoEnum.OBJETIVA);

watch(
  () => form.tipo,
  (newType) => {
    if (
      newType === TipoQuestaoEnum.OBJETIVA ||
      newType === TipoQuestaoEnum.MULTIPLA_ESCOLHA
    ) {
      form.alternativas = [];
    } else if (newType === TipoQuestaoEnum.VERDADEIRO_FALSO) {
      form.alternativas = [];
    } else if (newType === TipoQuestaoEnum.DISCURSIVA) {
      form.alternativas = [];
    }
  }
);

function addAlternative() {
  form.alternativas.push({
    descricao: "",
    isCorreto: false,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });
}

function removeAlternative(descricao: string) {
  form.alternativas = form.alternativas.filter(
    (a) => a.descricao !== descricao
  );
}

function toggleCorrect(alternative: IAlternativa) {
  if (isSingleCorrect.value) {
    form.alternativas.forEach((alt) => {
      alt.isCorreto = false;
    });
    alternative.isCorreto = true;
  } else {
    alternative.isCorreto = !alternative.isCorreto;
  }
}

async function onSubmit() {
  emit("create", form);
  emit("update:modelValue", false);
}
</script>

<template>
  <UModal
    class="min-w-6xl"
    title="Criar Questão"
    description="Preencha os detalhes da nova questão"
    :open="modelValue"
    :closeable="true"
    :keyboard="true"
    :closable="true"
    :ui="{ body: 'flex flex-col' }"
    @update:open="$emit('update:modelValue', $event)"
  >
    <template #body>
      <UForm
        id="question-form"
        :state="form"
        class="flex-1 flex flex-col overflow-hidden"
        @submit="onSubmit"
      >
        <div class="flex-1 flex overflow-hidden">
          <div
            class="w-1/2 overflow-y-auto space-y-6 pr-6 border-r border-gray-200 dark:border-gray-700"
          >
            <UFormField
              class="w-full"
              label="Título da Questão"
              name="titulo"
              required
            >
              <UInput
                v-model="form.titulo"
                class="w-full"
                placeholder="Digite o título da questão..."
              />
            </UFormField>

            <UFormField
              class="w-full"
              label="Descrição (Opcional)"
              name="descricao"
            >
              <UTextarea
                v-model="form.descricao"
                class="w-full"
                :rows="4"
                placeholder="Digite o enunciado ou uma descrição detalhada..."
              />
            </UFormField>

            <UFormField class="w-full" label="Tipo da Questão" name="type">
              <URadioGroup
                v-model="form.tipo"
                :items="questionTypeItems"
                color="primary"
                variant="table"
              />
            </UFormField>

            <UFormField
              class="w-full"
              label="Nível de Dificuldade"
              name="difficulty"
            >
              <URadioGroup
                v-model="form.dificuldade"
                :items="questionDifficultyItems"
                color="primary"
                variant="table"
              />
            </UFormField>

            <UFormField
              v-if="!isFreeText"
              class="w-full"
              label="Alternativas de Resposta"
              name="alternativas"
            >
              <div class="space-y-3">
                <div
                  v-for="(alt, index) in form.alternativas"
                  :key="alt.id"
                  class="flex items-center space-x-3 p-3 border rounded-lg transition-colors duration-200"
                  :class="{
                    'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700':
                      alt.isCorreto,
                    'border-gray-200 dark:border-gray-700': !alt.isCorreto,
                  }"
                >
                  <UInput
                    v-model="alt.descricao"
                    :placeholder="
                      isTrueFalse
                        ? `Afirmativa ${index + 1}...`
                        : `Texto da alternativa ${index + 1}...`
                    "
                    class="flex-1"
                  />
                  <UButton
                    icon="i-heroicons-check-circle-20-solid"
                    :color="alt.isCorreto ? 'primary' : 'neutral'"
                    :variant="alt.isCorreto ? 'solid' : 'ghost'"
                    @click="toggleCorrect(alt)"
                  />
                  <UButton
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    size="xl"
                    color="error"
                    :disabled="
                      form.alternativas.length <= (isTrueFalse ? 1 : 2)
                    "
                    @click="removeAlternative(alt.descricao)"
                  />
                </div>
                <UButton
                  variant="link"
                  icon="i-lucide-plus"
                  @click="addAlternative"
                >
                  {{
                    isTrueFalse
                      ? "Adicionar Afirmativa"
                      : "Adicionar Alternativa"
                  }}
                </UButton>
              </div>
            </UFormField>

            <div v-if="isFreeText" class="space-y-6">
              <UFormField
                class="w-full"
                label="Resposta Modelo para I.A"
                name="exemploDeResposta"
              >
                <UTextarea
                  v-model="form.exemploDeResposta"
                  class="w-full"
                  :rows="3"
                  placeholder="Digite a resposta ideal..."
                />
              </UFormField>
            </div>

            <UFormField
              class="w-full"
              label="Explicação da Resposta"
              name="explicacao"
            >
              <UTextarea
                v-model="form.explicacao"
                class="w-full"
                :rows="3"
                placeholder="Explique por que a resposta está correta..."
              />
            </UFormField>
          </div>

          <div class="w-1/2 p-6 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
            <h3 class="text-lg font-semibold mb-4">Preview</h3>
            <div
              class="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm space-y-4"
            >
              <h4 class="text-xl font-semibold">
                {{ form.titulo || "Título da Questão" }}
              </h4>
              <p class="text-gray-600 dark:text-gray-300">
                {{
                  form.descricao || "A descrição da questão aparecerá aqui..."
                }}
              </p>
              <div v-if="isFreeText">
                <UTextarea
                  class="w-full"
                  :rows="3"
                  placeholder="Espaço para resposta livre..."
                  disabled
                />
              </div>
              <div v-else-if="form.alternativas.length > 0" class="space-y-2">
                <label
                  v-for="alt in form.alternativas"
                  :key="alt.id"
                  class="flex items-center space-x-3 p-3 border rounded-lg cursor-not-allowed opacity-75"
                  :class="{
                    'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700':
                      alt.isCorreto,
                    'border-gray-200 dark:border-gray-700': !alt.isCorreto,
                  }"
                >
                  <div
                    class="w-5 h-5 rounded-full flex items-center justify-center"
                    :class="
                      alt.isCorreto
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    "
                  >
                    <UIcon
                      v-if="alt.isCorreto"
                      name="i-heroicons-check-20-solid"
                      class="w-4 h-4 text-white"
                    />
                  </div>
                  <span>{{ alt.descricao }}</span>
                </label>
              </div>
              <UCard
                v-if="form.explicacao"
                class="mt-4 bg-info-50 border-t border-gray-200 dark:border-gray-700"
              >
                <h5
                  class="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-200"
                >
                  Explicação:
                </h5>
                <p
                  class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
                >
                  {{ form.explicacao }}
                </p>
              </UCard>
            </div>
          </div>
        </div>
      </UForm>
    </template>

    <template #footer>
      <div class="flex items-center justify-end w-full gap-4">
        <UButton variant="ghost" @click="$emit('update:modelValue', false)"
          >Cancelar</UButton
        >
        <UButton
          type="submit"
          form="question-form"
          variant="solid"
          color="primary"
          >Salvar Questão</UButton
        >
      </div>
    </template>
  </UModal>
</template>
