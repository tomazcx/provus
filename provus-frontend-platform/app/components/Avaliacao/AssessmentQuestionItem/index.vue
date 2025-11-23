<script setup lang="ts">
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import RichTextEditor from "~/components/ui/RichTextEditor/index.vue";
import type {
  AlternativaEntity,
  QuestaoEntity,
} from "~/types/entities/Questao.entity";

const model = defineModel<QuestaoEntity>({ required: true });
const props = defineProps<{ numero: number; autocorrecaoAtiva?: boolean }>();
const emit = defineEmits(["remover", "save-to-bank"]);

const isModeloRespostaRequired = computed(() => {
  return (
    props.autocorrecaoAtiva &&
    model.value.tipoQuestao === TipoQuestaoEnum.DISCURSIVA
  );
});

const isQuestionValid = computed(() => {
  const textContent = model.value?.titulo?.replace(/<[^>]*>/g, "").trim();
  return textContent !== "";
});

watch(
  () => model.value.tipoQuestao,
  (newType) => {
    if (newType === TipoQuestaoEnum.DISCURSIVA) {
      model.value.alternativas = [];
    } else if (model.value.alternativas.length === 0) {
      addAlternative();
    }
  }
);

function addAlternative() {
  if (model.value) {
    if (!model.value.alternativas) {
      model.value.alternativas = [];
    }
    model.value.alternativas.push({
      id: Date.now(),
      descricao: "",
      isCorreto: false,
    });
  }
}

function removeAlternative(id: number) {
  if (model.value && "alternativas" in model.value) {
    model.value.alternativas = model.value.alternativas?.filter(
      (o) => o.id !== id
    );
  }
}

function toggleCorrect(alt: AlternativaEntity) {
  if (model.value && "alternativas" in model.value) {
    if (model.value.tipoQuestao === TipoQuestaoEnum.OBJETIVA) {
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
          <USelectMenu v-model="model.tipoQuestao" :items="tipos" />
        </UFormField>
        <UFormField label="Dificuldade" size="sm">
          <USelect v-model="model.dificuldade" :items="dificuldade" />
        </UFormField>
        <UFormField label="Pontos" size="sm">
          <UInputNumber v-model="model.pontuacao" class="w-20" />
        </UFormField>
      </div>
      <div class="flex items-center space-x-1">
        <UTooltip text="Salvar no Banco de Questões">
          <UButton
            color="secondary"
            variant="ghost"
            icon="i-lucide-bookmark-plus"
            :disabled="!isQuestionValid"
            @click="emit('save-to-bank', model)"
          />
        </UTooltip>
        <UButton
          color="primary"
          variant="ghost"
          icon="i-heroicons-arrows-up-down"
          class="cursor-grab drag-handle"
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
        <RichTextEditor
          v-model="model.titulo"
          placeholder="Digite o enunciado da questão aqui..."
          min-height="min-h-[40px]"
        />
      </UFormField>
      <UFormField label="Descrição da Questão (opcional)">
        <RichTextEditor
          v-model="model.descricao"
          placeholder="Digite uma breve descrição da questão aqui..."
        />
      </UFormField>
      <template v-if="model.tipoQuestao === TipoQuestaoEnum.DISCURSIVA">
        <UFormField
          :label="
            isModeloRespostaRequired
              ? 'Modelo de Resposta para I.A. (Obrigatório)'
              : 'Modelo de Resposta para I.A.'
          "
          :required="isModeloRespostaRequired"
          name="exemploDeResposta"
        >
          <RichTextEditor
            v-model="model.exemploRespostaIa"
            placeholder="Digite a resposta esperada para esta questão..."
            min-height="min-h-[40px]"
          />
        </UFormField>
      </template>

      <template
        v-else-if="
          model.tipoQuestao === TipoQuestaoEnum.OBJETIVA ||
          model.tipoQuestao === TipoQuestaoEnum.MULTIPLA_ESCOLHA ||
          model.tipoQuestao === TipoQuestaoEnum.VERDADEIRO_FALSO
        "
      >
        <UFormField label="Alternativas">
          <div class="space-y-4">
            <div
              v-for="alt in model.alternativas"
              :key="alt.id"
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
                  placeholder="Texto da alternativa..."
                  min-height="min-h-[40px]"
                />
              </div>
              <div class="flex flex-col gap-2 pt-1">
                <UTooltip
                  :text="
                    alt.isCorreto
                      ? 'Alternativa Correta'
                      : 'Marcar como Correta'
                  "
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
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    size="sm"
                    :disabled="(model.alternativas?.length ?? 0) <= 1"
                    @click="removeAlternative(alt.id!)"
                  />
                </UTooltip>
              </div>
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
        <RichTextEditor
          v-model="model.textoRevisao"
          placeholder="Explique por que a resposta correta é essa..."
        />
      </UFormField>
    </div>
  </UCard>
</template>