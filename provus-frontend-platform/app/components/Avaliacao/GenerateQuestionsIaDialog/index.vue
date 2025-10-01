<script setup lang="ts">
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { RegraGeracaoIaEntity } from "~/types/entities/Configuracoes.entity";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";

const props = defineProps<{
  modelValue: boolean;
  materiaisAnexados: ArquivoEntity[];
}>();

const emit = defineEmits([
  "update:modelValue",
  "generate",
  "open-materials-bank",
  "view-materials",
]);

const regras = ref<RegraGeracaoIaEntity[]>([]);
const isLoading = ref(false);

const dificuldadeOptions = Object.values(DificuldadeQuestaoEnum);
const tipoQuestaoOptions = Object.values(TipoQuestaoEnum);

function addIaRule() {
  regras.value.push({
    id: Date.now(),
    quantidade: 1,
    tipo: TipoQuestaoEnum.OBJETIVA,
    dificuldade: DificuldadeQuestaoEnum.FACIL,
    pontuacao: 1,
    materiaisAnexadosIds: [],
  });
}

function removeIaRule(ruleId: number) {
  regras.value = regras.value.filter((rule) => rule.id !== ruleId);
}

function openMaterialsBankForRule(rule: RegraGeracaoIaEntity) {
  emit("open-materials-bank", rule);
}

function viewMaterialsForRule(rule: RegraGeracaoIaEntity) {
  emit("view-materials", rule);
}

async function handleGenerate() {
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  emit("generate", regras.value);
  isLoading.value = false;
  emit("update:modelValue", false);
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      regras.value = [];
      addIaRule();
    }
  }
);

function handleModal(event: boolean) {
  if (!isLoading.value) emit("update:modelValue", event);
}
</script>

<template>
  <UModal
    :open="modelValue"
    :prevent-close="isLoading"
    class="min-w-[1120px]"
    @update:open="handleModal"
  >
    <template #header>
      <div class="flex items-center">
        <div
          class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center"
        >
          <Icon name="i-lucide-brain-circuit" class="text-white text-xl" />
        </div>
        <div class="ml-4">
          <h3 class="text-lg font-semibold text-gray-900">
            Gerar Questões com I.A.
          </h3>
          <p class="text-sm text-gray-600">
            Configure as regras para a geração automática de questões.
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <UCard v-for="(rule, index) in regras" :key="rule.id" variant="subtle">
          <div class="flex items-center justify-between mb-4">
            <p class="font-bold text-sm text-gray-600">
              Regra de Geração #{{ index + 1 }}
            </p>
            <UButton
              v-if="regras.length > 1"
              color="error"
              variant="solid"
              size="sm"
              icon="i-lucide-trash-2"
              @click="removeIaRule(rule.id!)"
            />
          </div>

          <div class="flex items-center flex-wrap gap-x-2 gap-y-4 text-sm">
            <span>Gerar</span>
            <UFormField>
              <UInputNumber v-model="rule.quantidade" :min="1" class="w-20" />
            </UFormField>
            <span>questões do tipo</span>
            <UFormField>
              <USelect
                v-model="rule.tipo"
                :items="tipoQuestaoOptions"
                class="w-30"
              />
            </UFormField>
            <span>de nível</span>
            <UFormField>
              <USelect
                v-model="rule.dificuldade"
                :items="dificuldadeOptions"
                class="w-22"
              />
            </UFormField>
            <span>valendo</span>
            <UFormField>
              <UInputNumber v-model="rule.pontuacao" :min="0" class="w-20" />
            </UFormField>
            <span>pontos, baseadas em</span>

            <UFormField>
              <UButton
                v-if="
                  !rule.materiaisAnexadosIds ||
                  rule.materiaisAnexadosIds.length === 0
                "
                label="Selecionar Materiais"
                variant="outline"
                size="xs"
                icon="i-lucide-database"
                @click="openMaterialsBankForRule(rule)"
              />
              <UButton
                v-else
                :label="`${rule.materiaisAnexadosIds.length} materiais selecionados`"
                variant="soft"
                size="xs"
                color="primary"
                icon="i-lucide-file-check-2"
                trailing-icon="i-lucide-eye"
                @click="viewMaterialsForRule(rule)"
              />
            </UFormField>
          </div>
        </UCard>
        <UButton
          label="Adicionar Outra Regra"
          variant="outline"
          icon="i-lucide-plus"
          class="w-fit"
          @click="addIaRule"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton
          variant="outline"
          color="primary"
          :disabled="isLoading"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </UButton>
        <UButton
          icon="i-lucide-wand-2"
          :loading="isLoading"
          @click="handleGenerate"
        >
          Gerar Questões
        </UButton>
      </div>
    </template>
  </UModal>
</template>
