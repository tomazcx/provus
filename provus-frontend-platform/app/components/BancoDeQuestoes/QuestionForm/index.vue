<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";

import type {
  QuestaoEntity,
  AlternativaEntity,
} from "~/types/entities/Questao.entity";
import type { CreateQuestaoRequest } from "~/types/api/request/Questao.request";

const props = defineProps<{
  initialData?: QuestaoEntity | null;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CreateQuestaoRequest): void;
}>();

const getBlankForm = (): CreateQuestaoRequest => ({
  titulo: "",
  descricao: "",
  tipoQuestao: TipoQuestaoEnum.OBJETIVA,
  dificuldade: DificuldadeQuestaoEnum.FACIL,
  pontuacao: 5,
  isModelo: true,
  alternativas: [{ descricao: "", isCorreto: true }],
  exemploRespostaIa: "",
  textoRevisao: "",
});

const form = reactive<CreateQuestaoRequest>(getBlankForm());

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.titulo = newData.titulo;
      form.descricao = newData.descricao;
      form.tipoQuestao = newData.tipoQuestao;
      form.dificuldade = newData.dificuldade;
      form.pontuacao = newData.pontuacao;
      form.isModelo = newData.isModelo;
      form.alternativas = JSON.parse(
        JSON.stringify(newData.alternativas || [])
      );
      form.exemploRespostaIa = newData.exemploRespostaIa || "";
      form.textoRevisao = newData.textoRevisao || "";
    } else {
      Object.assign(form, getBlankForm());
    }
  },
  { immediate: true, deep: true }
);

const questionTypeItems: RadioGroupItem[] = [
  { label: "Objetiva", value: TipoQuestaoEnum.OBJETIVA },
  { label: "Múltipla Escolha", value: TipoQuestaoEnum.MULTIPLA_ESCOLHA },
  { label: "Verdadeiro ou Falso", value: TipoQuestaoEnum.VERDADEIRO_FALSO },
  { label: "Discursiva", value: TipoQuestaoEnum.DISCURSIVA },
];
const questionDifficultyItems: RadioGroupItem[] = [
  { label: "Fácil", value: DificuldadeQuestaoEnum.FACIL },
  { label: "Médio", value: DificuldadeQuestaoEnum.MEDIO },
  { label: "Difícil", value: DificuldadeQuestaoEnum.DIFICIL },
];

const isFreeText = computed(
  () => form.tipoQuestao === TipoQuestaoEnum.DISCURSIVA
);
const isTrueFalse = computed(
  () => form.tipoQuestao === TipoQuestaoEnum.VERDADEIRO_FALSO
);
const isSingleCorrect = computed(
  () => form.tipoQuestao === TipoQuestaoEnum.OBJETIVA
);

watch(
  () => form.tipoQuestao,
  (newType, oldType) => {
    if (newType === TipoQuestaoEnum.DISCURSIVA) {
      form.alternativas = [];
    }
    if (
      oldType === TipoQuestaoEnum.MULTIPLA_ESCOLHA &&
      newType === TipoQuestaoEnum.OBJETIVA
    ) {
      let foundFirstCorrect = false;
      form.alternativas?.forEach((alt) => {
        if (alt.isCorreto) {
          if (foundFirstCorrect) alt.isCorreto = false;
          foundFirstCorrect = true;
        }
      });
      if (
        !foundFirstCorrect &&
        form.alternativas &&
        form.alternativas.length > 0
      ) {
        if (form.alternativas && form.alternativas[0]) {
          form.alternativas[0].isCorreto = true;
        }
      }
    }
  }
);

function addAlternative() {
  if (!form.alternativas) {
    form.alternativas = [];
  }
  form.alternativas.push({
    descricao: "",
    isCorreto: form.alternativas.length === 0,
  });
}

function removeAlternative(altIndex: number) {
  form.alternativas?.splice(altIndex, 1);
}

function toggleCorrect(alternative: AlternativaEntity) {
  if (isSingleCorrect.value) {
    form.alternativas?.forEach((alt) => {
      alt.isCorreto = false;
    });
  }
  alternative.isCorreto = !alternative.isCorreto;
}
</script>

<template>
  <UForm
    id="question-form"
    :state="form"
    class="flex-1 flex flex-col overflow-hidden"
    @submit="emit('submit', form)"
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
          <RichTextEditor
            v-model="form.titulo"
            placeholder="Digite o título da questão..."
          />
        </UFormField>

        <UFormField
          class="w-full"
          label="Descrição (Opcional)"
          name="descricao"
        >
          <RichTextEditor
            v-model="form.descricao"
            placeholder="Digite uma descrição mais detalhada, se necessário..."
          />
        </UFormField>

        <UFormField class="w-full" label="Tipo da Questão" name="type">
          <URadioGroup
            v-model="form.tipoQuestao"
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
          <div class="space-y-4">
            <div
              v-for="(alt, index) in form.alternativas"
              :key="index"
              class="flex items-start space-x-3 p-3 border rounded-lg transition-colors duration-200 bg-gray-50 dark:bg-gray-800/30"
              :class="{
                'border-green-500 dark:border-green-700 ring-1 ring-green-500/20':
                  alt.isCorreto,
                'border-gray-200 dark:border-gray-700': !alt.isCorreto,
              }"
            >
              <div class="flex-1 min-w-0">
                <RichTextEditor
                  v-model="alt.descricao"
                  :placeholder="
                    isTrueFalse
                      ? `Afirmativa ${index + 1}...`
                      : `Texto da alternativa ${index + 1}...`
                  "
                />
              </div>

              <div class="flex flex-col gap-2 pt-1">
                <UTooltip
                  :text="alt.isCorreto ? 'Alternativa Correta' : 'Marcar como Correta'"
                >
                  <UButton
                    icon="i-heroicons-check-circle-20-solid"
                    :color="alt.isCorreto ? 'primary' : 'neutral'"
                    :variant="alt.isCorreto ? 'solid' : 'ghost'"
                    size="sm"
                    @click="toggleCorrect(alt)"
                  />
                </UTooltip>
                
                <UTooltip text="Remover Alternativa">
                  <UButton
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    size="sm"
                    color="error"
                    :disabled="
                      (form.alternativas?.length || 0) <= (isTrueFalse ? 1 : 2)
                    "
                    @click="removeAlternative(index)"
                  />
                </UTooltip>
              </div>
            </div>
            
            <UButton
              variant="link"
              icon="i-lucide-plus"
              @click="addAlternative"
            >
              {{
                isTrueFalse ? "Adicionar Afirmativa" : "Adicionar Alternativa"
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
            <RichTextEditor
              v-model="form.exemploRespostaIa"
              placeholder="Digite a resposta ideal para ajudar na correção..."
            />
          </UFormField>
        </div>

        <UFormField
          class="w-full"
          label="Explicação da Resposta"
          name="explicacao"
        >
          <RichTextEditor
            v-model="form.textoRevisao"
            placeholder="Digite a explicação para o aluno..."
          />
        </UFormField>
      </div>

      <div class="w-1/2 p-6 bg-gray-50 dark:bg-gray-800/50 overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">Preview</h3>
        <div
          class="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm space-y-4"
        >
          <div class="border-b pb-2 mb-2">
            <h4 class="text-xs font-bold text-gray-500 uppercase mb-1">Título</h4>
            <div v-if="form.titulo">
              <RichTextEditor :model-value="form.titulo" disabled />
            </div>
            <p v-else class="text-gray-400 italic">Sem título...</p>
          </div>

          <div>
            <h4 class="text-xs font-bold text-gray-500 uppercase mb-1">Descrição</h4>
            <div v-if="form.descricao">
              <RichTextEditor :model-value="form.descricao" disabled />
            </div>
            <p v-else class="text-gray-400 italic">
              Sem descrição...
            </p>
          </div>

          <div v-if="isFreeText">
            <UTextarea
              class="w-full"
              :rows="3"
              placeholder="Espaço para resposta livre..."
              disabled
            />
          </div>

          <div
            v-else-if="form.alternativas && form.alternativas.length > 0"
            class="space-y-2 mt-4"
          >
            <label
              v-for="(alt, index) in form.alternativas"
              :key="index"
              class="flex items-start space-x-3 p-3 border rounded-lg cursor-not-allowed opacity-75"
              :class="{
                'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700':
                  alt.isCorreto,
                'border-gray-200 dark:border-gray-700': !alt.isCorreto,
              }"
            >
              <div
                class="w-5 h-5 mt-1 rounded-full flex items-center justify-center flex-shrink-0"
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
              
              <div class="flex-1 min-w-0">
                 <RichTextEditor 
                    v-if="alt.descricao" 
                    :model-value="alt.descricao" 
                    disabled 
                    class="!p-0 !bg-transparent" 
                  />
                 <span v-else class="italic text-gray-400">Alternativa vazia...</span>
              </div>
            </label>
          </div>

          <UCard
            v-if="form.textoRevisao"
            class="mt-4 bg-info-50 border-t border-gray-200 dark:border-gray-700"
          >
            <h5
              class="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-200"
            >
              Explicação:
            </h5>
            <RichTextEditor :model-value="form.textoRevisao" disabled />
          </UCard>
        </div>
      </div>
    </div>
  </UForm>
</template>