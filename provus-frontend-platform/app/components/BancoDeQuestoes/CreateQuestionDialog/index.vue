<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";
import type {
  AnyQuestion,
  TDifficulty,
  TQuestionType,
  IQuestionAlternative,
} from "@/types/Avaliacao";

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
}>();

const questionTypeItems: RadioGroupItem[] = [
  { label: "Resposta Única (Múltipla Escolha)", value: "single-correct" },
  { label: "Múltiplas Respostas (Múltipla Escolha)", value: "multiple-choice" },
  { label: "Verdadeiro ou Falso", value: "true-false" },
  { label: "Texto Livre (Discursiva)", value: "free-text" },
];

const questionDifficultyItems: RadioGroupItem[] = [
  { label: "Fácil", value: "Fácil" },
  { label: "Médio", value: "Médio" },
  { label: "Difícil", value: "Difícil" },
];

const form = reactive({
  titulo: "",
  descricao: "",
  type: "single-correct" as
    | "single-correct"
    | "multiple-choice"
    | "true-false"
    | "free-text",
  difficulty: "Fácil" as TDifficulty,
  pontuacao: 5,
  alternatives: [
    { id: 1, texto: "", isCorreta: false },
    { id: 2, texto: "", isCorreta: false },
  ],
  correctAlternativeId: null as number | null,
  modeloDeResposta: "",
  explicacao: "",
});

const isFreeText = computed(() => form.type === "free-text");
const isTrueFalse = computed(() => form.type === "true-false");
const isSingleCorrect = computed(() => form.type === "single-correct");

let nextAltId = 3;

watch(
  () => form.type,
  (newType) => {
    nextAltId = 1;
    form.correctAlternativeId = null;

    if (newType === "single-correct" || newType === "multiple-choice") {
      form.alternatives = [
        { id: nextAltId++, texto: "", isCorreta: false },
        { id: nextAltId++, texto: "", isCorreta: false },
      ];
    } else if (newType === "true-false") {
      form.alternatives = [
        { id: nextAltId++, texto: "Verdadeiro", isCorreta: false },
        { id: nextAltId++, texto: "Falso", isCorreta: false },
      ];
    } else if (newType === "free-text") {
      form.alternatives = [];
    }
  }
);

function addAlternative() {
  form.alternatives.push({ id: nextAltId++, texto: "", isCorreta: false });
}

function removeAlternative(id: number) {
  form.alternatives = form.alternatives.filter((a) => a.id !== id);
  if (form.correctAlternativeId === id) {
    form.correctAlternativeId = null;
  }
}

function isCorrect(alternative: { id: number; isCorreta: boolean }): boolean {
  if (isSingleCorrect.value) {
    return form.correctAlternativeId === alternative.id;
  }
  return alternative.isCorreta;
}

function toggleCorrect(alternative: { id: number; isCorreta: boolean }) {
  if (isSingleCorrect.value) {
    form.correctAlternativeId =
      form.correctAlternativeId === alternative.id ? null : alternative.id;
  } else {
    alternative.isCorreta = !alternative.isCorreta;
  }
}

async function onSubmit() {
  const typeMap: { [key: string]: TQuestionType } = {
    "single-correct": { label: "Múltipla Escolha", value: "multipla-escolha" },
    "multiple-choice": { label: "Múltipla Escolha", value: "multipla-escolha" },
    "true-false": { label: "Verdadeiro ou Falso", value: "verdadeiro-falso" },
    "free-text": { label: "Discursiva", value: "discursiva" },
  };

  const finalType = typeMap[form.type];

  if (!finalType) {
    console.error("Erro: Tipo de questão desconhecido ou inválido:", form.type);
    return;
  }

  const baseQuestionData = {
    id: Date.now(),
    titulo: form.titulo,
    descricao: form.descricao,
    dificuldade: form.difficulty,
    pontuacao: form.pontuacao,
    explicacao: form.explicacao,
  };

  let questaoPayload: AnyQuestion;

  if (finalType.value === "discursiva") {
    questaoPayload = {
      ...baseQuestionData,
      tipo: finalType,
      modeloDeResposta: form.modeloDeResposta,
    };
  } else {
    const finalAlternatives: IQuestionAlternative[] = form.alternatives.map(
      (alt) => {
        let correta = alt.isCorreta;
        if (isSingleCorrect.value) {
          correta = form.correctAlternativeId === alt.id;
        }
        return {
          id: typeof alt.id === "number" ? alt.id : Date.now(),
          texto: alt.texto,
          isCorreta: correta,
        };
      }
    );

    if (finalType.value === "multipla-escolha") {
      questaoPayload = {
        ...baseQuestionData,
        tipo: { label: "Múltipla Escolha", value: "multipla-escolha" },
        opcoes: finalAlternatives,
      };
    } else if (finalType.value === "verdadeiro-falso") {
      questaoPayload = {
        ...baseQuestionData,
        tipo: { label: "Verdadeiro ou Falso", value: "verdadeiro-falso" },
        opcoes: finalAlternatives,
      };
    } else {
      console.error(
        "Tipo de questão não suportado na lógica de criação:",
        finalType
      );
      return;
    }
  }

  console.log("Saving question (typed payload):", questaoPayload);
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
                v-model="form.type"
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
                v-model="form.difficulty"
                :items="questionDifficultyItems"
                color="primary"
                variant="table"
              />
            </UFormField>

            <UFormField
              v-if="!isFreeText"
              class="w-full"
              label="Alternativas de Resposta"
              name="alternatives"
            >
              <div class="space-y-3">
                <div
                  v-for="(alt, index) in form.alternatives"
                  :key="alt.id"
                  class="flex items-center space-x-3 p-3 border rounded-lg transition-colors duration-200"
                  :class="{
                    'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700':
                      isCorrect(alt),
                    'border-gray-200 dark:border-gray-700': !isCorrect(alt),
                  }"
                >
                  <UInput
                    v-model="alt.texto"
                    :placeholder="
                      isTrueFalse
                        ? `Afirmativa ${index + 1}...`
                        : `Texto da alternativa ${index + 1}...`
                    "
                    class="flex-1"
                  />
                  <UButton
                    icon="i-heroicons-check-circle-20-solid"
                    :color="isCorrect(alt) ? 'primary' : 'neutral'"
                    :variant="isCorrect(alt) ? 'solid' : 'ghost'"
                    @click="toggleCorrect(alt)"
                  />
                  <UButton
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    size="xl"
                    color="error"
                    :disabled="
                      form.alternatives.length <= (isTrueFalse ? 1 : 2)
                    "
                    @click="removeAlternative(alt.id)"
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
                name="modeloDeResposta"
              >
                <UTextarea
                  v-model="form.modeloDeResposta"
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
              <div v-else-if="form.alternatives.length > 0" class="space-y-2">
                <label
                  v-for="alt in form.alternatives"
                  :key="alt.id"
                  class="flex items-center space-x-3 p-3 border rounded-lg cursor-not-allowed opacity-75"
                  :class="{
                    'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700':
                      isCorrect(alt),
                    'border-gray-200 dark:border-gray-700': !isCorrect(alt),
                  }"
                >
                  <div
                    class="w-5 h-5 rounded-full flex items-center justify-center"
                    :class="
                      isCorrect(alt)
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    "
                  >
                    <UIcon
                      v-if="isCorrect(alt)"
                      name="i-heroicons-check-20-solid"
                      class="w-4 h-4 text-white"
                    />
                  </div>
                  <span>{{ alt.texto || `Alternativa ${alt.id}` }}</span>
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
