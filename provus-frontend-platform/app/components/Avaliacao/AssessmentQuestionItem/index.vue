<script setup lang="ts">
import { computed } from "vue";
import type {
  AnyQuestion,
  TQuestionType,
  TDifficulty,
  IQuestionAlternative,
} from "@/types/Avaliacao";

const model = defineModel<AnyQuestion>({ required: true });
defineProps<{ numero: number }>();
const emit = defineEmits(["remover"]);

const tipos: TQuestionType[] = [
  { label: "Múltipla Escolha", value: "multipla-escolha" },
  { label: "Discursiva", value: "discursiva" },
  { label: "Verdadeiro ou Falso", value: "verdadeiro-falso" },
];

const dificuldades: TDifficulty[] = ["Fácil", "Médio", "Difícil"];

// A lógica do script permanece a mesma
const opcoes = computed(() => {
  if (model.value && "opcoes" in model.value) {
    return model.value.opcoes;
  }
  return null;
});

const modeloDeRespostaWritable = computed({
  get() {
    if (model.value && "modeloDeResposta" in model.value) {
      return model.value.modeloDeResposta;
    }
    return "";
  },
  set(newValue) {
    if (model.value && "modeloDeResposta" in model.value) {
      model.value.modeloDeResposta = newValue;
    }
  },
});

const nextAltId = computed(() => {
  if (opcoes.value) {
    return Math.max(0, ...opcoes.value.map((o) => o.id)) + 1;
  }
  return 1;
});

function addAlternative() {
  if (model.value && "opcoes" in model.value) {
    model.value.opcoes.push({
      id: nextAltId.value,
      texto: "",
      isCorreta: false,
    });
  }
}

const tipoWritable = computed({
  get() {
    return model.value.tipo;
  },
  set(newValue) {
    if (model.value.tipo.value !== newValue.value) {
      const baseData = {
        id: model.value.id,
        titulo: model.value.titulo,
        materia: model.value.materia,
        pontuacao: model.value.pontuacao,
        dificuldade: model.value.dificuldade,
        explicacao: model.value.explicacao,
        descricao: model.value.descricao,
      };

      if (newValue.value === "discursiva") {
        model.value = {
          ...baseData,
          tipo: { label: "Discursiva", value: "discursiva" },
          modeloDeResposta: "",
        };
      } else if (newValue.value === "multipla-escolha") {
        model.value = {
          ...baseData,
          tipo: { label: "Múltipla Escolha", value: "multipla-escolha" },
          opcoes: [],
        };
      } else if (newValue.value === "verdadeiro-falso") {
        model.value = {
          ...baseData,
          tipo: { label: "Verdadeiro ou Falso", value: "verdadeiro-falso" },
          opcoes: [],
        };
      }
    }
  },
});

function removeAlternative(id: number) {
  if (model.value && "opcoes" in model.value) {
    model.value.opcoes = model.value.opcoes.filter((o) => o.id !== id);
  }
}

function toggleCorrect(alt: IQuestionAlternative) {
  if (model.value && "opcoes" in model.value) {
    // Para múltipla escolha, podemos querer desmarcar outras opções
    if (model.value.tipo.value === "multipla-escolha") {
      // Se você quiser comportamento de 'single-choice', descomente a linha abaixo
      // model.value.opcoes.forEach(o => o.isCorreta = false);
    }
    alt.isCorreta = !alt.isCorreta;
  }
}
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
            v-model="tipoWritable"
            :items="tipos"
            by="value"
            option-attribute="label"
          />
        </UFormField>
        <UFormField label="Dificuldade" size="sm">
          <USelect v-model="model.dificuldade" :items="dificuldades" />
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
      <UFormField label="Enunciado da Questão">
        <UTextarea
          v-model="model.titulo"
          placeholder="Digite o enunciado da questão aqui..."
          class="w-full"
          autoresize
        />
      </UFormField>

      <template v-if="opcoes">
        <UFormField label="Alternativas">
          <div class="space-y-3">
            <div
              v-for="alt in opcoes"
              :key="alt.id"
              class="flex items-center space-x-3 p-3 border rounded-lg transition-colors duration-200"
              :class="{
                'bg-green-50 dark:bg-green-900/30 border-green-500 dark:border-green-700':
                  alt.isCorreta,
                'border-gray-200 dark:border-gray-700': !alt.isCorreta,
              }"
            >
              <UInput
                v-model="alt.texto"
                class="flex-1"
                placeholder="Texto da alternativa..."
              />
              <UButton
                icon="i-heroicons-check-circle-20-solid"
                :color="alt.isCorreta ? 'primary' : 'neutral'"
                :variant="alt.isCorreta ? 'solid' : 'ghost'"
                @click="toggleCorrect(alt)"
              />
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                :disabled="opcoes.length <= 1"
                @click="removeAlternative(alt.id)"
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

      <template v-else-if="model.tipo.value === 'discursiva'">
        <UFormField label="Modelo de Resposta">
          <UTextarea
            v-model="modeloDeRespostaWritable"
            placeholder="Digite a resposta esperada para esta questão..."
            class="w-full"
            autoresize
          />
        </UFormField>
      </template>

      <UFormField label="Explicação da Resposta (Opcional)">
        <UTextarea
          v-model="model.explicacao"
          :rows="2"
          class="w-full"
          placeholder="Explique por que a resposta correta é essa. Será exibido ao aluno após a correção."
          autoresize
        />
      </UFormField>
    </div>
  </UCard>
</template>
