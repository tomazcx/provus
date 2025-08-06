<script setup lang="ts">
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import type { IRegraGeracaoIA } from "~/types/IConfiguracoesAvaliacoes";

const props = defineProps<{
  form: Partial<IAvaliacaoImpl>;
}>();

const emit = defineEmits([
  "update:form",
  "open-materials-bank-for-rule",
  "view-material-for-rule",
]);

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});

const dificuldadeOptions = Object.values(DificuldadeQuestaoEnum);
const tipoQuestaoOptions = Object.values(TipoQuestaoEnum);

function addIaRule() {
  formState.value.configuracoes?.regrasGeracaoIA?.push({
    id: Date.now(),
    quantidade: 1,
    tipo: TipoQuestaoEnum.OBJETIVA,
    dificuldade: DificuldadeQuestaoEnum.FACIL,
    pontuacao: 1,
    materiaisAnexadosIds: [],
  });
}

function openMaterialsBankForRule(rule: IRegraGeracaoIA) {
  emit("open-materials-bank-for-rule", rule);
}

function viewMaterialForRule(rule: IRegraGeracaoIA) {
  emit("view-material-for-rule", rule);
}

function removeIaRule(ruleId: number) {
  if (!formState.value.configuracoes?.regrasGeracaoIA) return;
  formState.value.configuracoes.regrasGeracaoIA =
    formState.value.configuracoes.regrasGeracaoIA.filter(
      (rule) => rule.id !== ruleId
    );
}
</script>

<template>
  <div v-if="formState.configuracoes" class="w-full flex flex-col gap-6">
    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Correção Automática</h2>
      </template>
      <div class="flex flex-col gap-4">
        <USwitch
          v-model="formState.configuracoes.autocorrecaoIa"
          label="Ativar autocorreção para questões discursivas"
          description="A I.A. irá analisar as respostas textuais dos alunos e atribuir uma pontuação."
        />
      </div>
    </UCard>

    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Geração de Questões via I.A.</h2>
      </template>
      <div class="flex flex-col gap-4">
        <USwitch
          v-model="formState.configuracoes.gerarQuestoesIA"
          label="Gerar questões automaticamente com I.A."
          description="A I.A. criará questões com base nos materiais de consulta anexados."
        />

        <div
          v-if="formState.configuracoes.gerarQuestoesIA"
          class="pl-8 flex flex-col gap-4"
        >
          <UCard
            v-for="rule in formState.configuracoes.regrasGeracaoIA"
            :key="rule.id"
            variant="outline"
          >
            <div class="flex items-center justify-between mb-4">
              <p class="font-medium text-sm">Configurar regra de geração</p>
              <UButton
                color="error"
                variant="solid"
                icon="i-lucide-trash-2"
                @click="removeIaRule(rule.id!)"
              />
            </div>

            <div class="flex items-center flex-wrap gap-x-2 gap-y-4 text-sm">
              <span>Gerar</span>
              <UFormGroup>
                <UInputNumber v-model="rule.quantidade" :min="1" class="w-20" />
              </UFormGroup>
              <span>questões do tipo</span>
              <UFormGroup>
                <USelect
                  v-model="rule.tipo"
                  :items="tipoQuestaoOptions"
                  class="w-36"
                />
              </UFormGroup>
              <span>de nível</span>
              <UFormGroup>
                <USelect
                  v-model="rule.dificuldade"
                  :items="dificuldadeOptions"
                  class="w-28"
                />
              </UFormGroup>
              <span>valendo</span>
              <UFormGroup>
                <UInputNumber v-model="rule.pontuacao" :min="0" class="w-20" />
              </UFormGroup>
              <span>pontos e baseadas no material</span>

              <UFormGroup>
                <UButton
                  v-if="
                    !rule.materiaisAnexadosIds ||
                    rule.materiaisAnexadosIds.length === 0
                  "
                  label="Selecionar"
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
                  @click="viewMaterialForRule(rule)"
                />
              </UFormGroup>
            </div>
          </UCard>

          <UButton
            label="Adicionar Configuração de Geração"
            variant="outline"
            icon="i-lucide-plus"
            class="w-fit"
            @click="addIaRule"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
