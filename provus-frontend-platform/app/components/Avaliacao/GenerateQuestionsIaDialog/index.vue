<script setup lang="ts">
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { RegraGeracaoIaEntity } from "~/types/entities/Configuracoes.entity";
import type { ArquivoEntity } from "~/types/entities/Arquivo.entity";

interface TemaRule {
  id: number;
  assunto: string;
  quantidade: number;
  tipo: TipoQuestaoEnum;
  dificuldade: DificuldadeQuestaoEnum;
  pontuacao: number;
}

const props = defineProps<{
  modelValue: boolean;
  materiaisAnexados: ArquivoEntity[];
  isLoading: boolean;
}>();

const emit = defineEmits([
  "update:modelValue",
  "generate",
  "generate-by-topic",
  "open-materials-bank",
  "view-materials",
]);

const regrasArquivo = ref<RegraGeracaoIaEntity[]>([]);

const regrasTema = ref<TemaRule[]>([]);

const dificuldadeOptions = Object.values(DificuldadeQuestaoEnum);
const tipoQuestaoOptions = Object.values(TipoQuestaoEnum);
const tabItems = [
  { key: "tema", label: "Gerar por Tema", slot: "tema" },
  { key: "material", label: "Gerar por Material", slot: "material" },
];
const selectedTab = ref("0");

function addIaRule() {
  regrasArquivo.value.push({
    id: Date.now(),
    quantidade: 1,
    tipo: TipoQuestaoEnum.OBJETIVA,
    dificuldade: DificuldadeQuestaoEnum.FACIL,
    pontuacao: 1,
    materiaisAnexadosIds: [],
    assunto: "",
  });
}

function removeIaRule(ruleId: number) {
  regrasArquivo.value = regrasArquivo.value.filter(
    (rule) => rule.id !== ruleId
  );
}

function addTopicRule() {
  regrasTema.value.push({
    id: Date.now() + Math.random(),
    assunto: "",
    quantidade: 1,
    tipo: TipoQuestaoEnum.OBJETIVA,
    dificuldade: DificuldadeQuestaoEnum.FACIL,
    pontuacao: 1,
  });
}

function removeTopicRule(ruleId: number) {
  regrasTema.value = regrasTema.value.filter((rule) => rule.id !== ruleId);
}

function openMaterialsBankForRule(rule: RegraGeracaoIaEntity) {
  emit("open-materials-bank", rule);
}

function viewMaterialsForRule(rule: RegraGeracaoIaEntity) {
  emit("view-materials", rule);
}

async function handleGenerate() {
  if (selectedTab.value === "0") {
    emit("generate-by-topic", regrasTema.value);
  } else {
    emit("generate", regrasArquivo.value);
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      regrasArquivo.value = [];
      addIaRule();

      regrasTema.value = [];
      addTopicRule();

      selectedTab.value = "0";
    }
  }
);

function handleModal(event: boolean) {
  if (!props.isLoading) emit("update:modelValue", event);
}
</script>

<template>
  <UModal
    class="min-w-[1120px]"
    :open="modelValue"
    :prevent-close="props.isLoading"
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
      <UTabs v-model="selectedTab" :items="tabItems" class="w-full">
        <template #tema>
          <div
            class="flex flex-col gap-4 mt-4 max-h-[60vh] overflow-y-auto px-1"
          >
            <UCard
              v-for="(rule, index) in regrasTema"
              :key="rule.id"
              variant="subtle"
            >
              <div class="flex items-center justify-between mb-4">
                <p class="font-bold text-sm text-gray-600">
                  Regra de Tema #{{ index + 1 }}
                </p>
                <UButton
                  v-if="regrasTema.length > 1"
                  color="error"
                  variant="solid"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="removeTopicRule(rule.id)"
                />
              </div>

              <div class="flex items-center flex-wrap gap-x-2 gap-y-4 text-sm">
                <span>Gerar</span>
                <UFormField>
                  <UInputNumber
                    v-model="rule.quantidade"
                    :min="1"
                    class="w-20"
                  />
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
                    class="w-28"
                  />
                </UFormField>
                <span>valendo</span>
                <UFormField>
                  <UInputNumber
                    v-model="rule.pontuacao"
                    :min="0"
                    class="w-20"
                  />
                </UFormField>
                <span>pontos.</span>
              </div>
              <UFormField label="Sobre o seguinte tema/assunto" class="mt-4">
                <UInput
                  v-model="rule.assunto"
                  placeholder="Ex: Revolução Francesa"
                />
              </UFormField>
            </UCard>

            <UButton
              label="Adicionar Outra Regra de Tema"
              variant="outline"
              icon="i-lucide-plus"
              class="w-fit"
              @click="addTopicRule"
            />
          </div>
        </template>

        <template #material>
          <div
            class="flex flex-col gap-4 mt-4 max-h-[60vh] overflow-y-auto px-1"
          >
            <UCard
              v-for="(rule, index) in regrasArquivo"
              :key="rule.id"
              variant="subtle"
            >
              <div class="flex items-center justify-between mb-4">
                <p class="font-bold text-sm text-gray-600">
                  Regra de Material #{{ index + 1 }}
                </p>
                <UButton
                  v-if="regrasArquivo.length > 1"
                  color="error"
                  variant="solid"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="removeIaRule(rule.id)"
                />
              </div>
              <div class="flex items-center flex-wrap gap-x-2 gap-y-4 text-sm">
                <span>Gerar</span>
                <UFormField>
                  <UInputNumber
                    v-model="rule.quantidade"
                    :min="1"
                    class="w-20"
                  />
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
                    class="w-28"
                  />
                </UFormField>
                <span>valendo</span>
                <UFormField>
                  <UInputNumber
                    v-model="rule.pontuacao"
                    :min="0"
                    class="w-20"
                  />
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
              label="Adicionar Outra Regra de Material"
              variant="outline"
              icon="i-lucide-plus"
              class="w-fit"
              @click="addIaRule"
            />
          </div>
        </template>
      </UTabs>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton
          variant="outline"
          color="primary"
          :disabled="props.isLoading"
          @click="$emit('update:modelValue', false)"
        >
          Cancelar
        </UButton>
        <UButton
          icon="i-lucide-wand-2"
          :loading="props.isLoading"
          @click="handleGenerate"
        >
          Gerar Questões
        </UButton>
      </div>
    </template>
  </UModal>
</template>
