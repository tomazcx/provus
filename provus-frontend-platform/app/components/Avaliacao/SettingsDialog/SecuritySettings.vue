<script setup lang="ts">
import TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import TipoInfracaoEnum from "~/enums/TipoInfracaoEnum";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { PunicaoPorOcorrenciaEntity } from "~/types/entities/Configuracoes.entity";

const props = defineProps<{
  form: AvaliacaoEntity;
}>();

const emit = defineEmits(["update:form"]);

const infracoesDisponiveis = {
  [TipoInfracaoEnum.TROCA_ABAS]: {
    label: "Troca de Abas",
    description: "Detecte se o estudante sair da aba da avaliação.",
    flag: "proibirTrocarAbas" as const,
  },
  [TipoInfracaoEnum.COPIAR_COLAR]: {
    label: "Copiar e Colar",
    description:
      "Detecte se o estudante tentar copiar ou colar algum conteúdo.",
    flag: "proibirCopiarColar" as const,
  },
};

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});

const punitionOptions = Object.values(TipoPenalidadeEnum);

function addOcorrenciaRule(tipoInfracao: TipoInfracaoEnum) {
  const newRule: PunicaoPorOcorrenciaEntity = {
    tipoInfracao: tipoInfracao,
    quantidadeOcorrencias: 1,
    tipoPenalidade: undefined,
    pontuacaoPerdida: 0,
    tempoReduzido: 0,
    sempre: false,
    quantidadeAplicacoes: null,
  };

  formState.value.configuracao.configuracoesSeguranca.punicoes.push(newRule);

  const punicoesArray =
    formState.value.configuracao.configuracoesSeguranca.punicoes;
  const reactiveNewRule = punicoesArray[punicoesArray.length - 1];

  if (reactiveNewRule) {
    watchRule(reactiveNewRule);
  }
}

function removeOcorrenciaRule(ruleToRemove: PunicaoPorOcorrenciaEntity) {
  const punicoes = formState.value.configuracao.configuracoesSeguranca.punicoes;
  const index = punicoes.indexOf(ruleToRemove);
  if (index > -1) {
    punicoes.splice(index, 1);
  }
}

function watchRule(rule: PunicaoPorOcorrenciaEntity) {
  watch(
    () => rule.sempre,
    (isSempre) => {
      if (isSempre && rule.quantidadeAplicacoes) {
        rule.quantidadeAplicacoes = null;
      }
    }
  );
  watch(
    () => rule.quantidadeAplicacoes,
    (newQty) => {
      if (newQty && newQty > 0 && rule.sempre) {
        rule.sempre = false;
      }
    }
  );
}

onMounted(() => {
  formState.value.configuracao.configuracoesSeguranca.punicoes.forEach(
    watchRule
  );
});
</script>

<template>
  <div v-if="formState.configuracao" class="w-full flex flex-col gap-6">
    <UCard variant="subtle">
      <template #header>
        <div class="flex justify-between">
          <h2 class="font-bold">Segurança no navegador</h2>
        </div>
      </template>
      <div class="flex flex-col gap-5">
        <div
          v-for="(regra, tipoInfracao) in infracoesDisponiveis"
          :key="tipoInfracao"
        >
          <USwitch
            v-model="formState.configuracao.configuracoesSeguranca[regra.flag]"
            :label="regra.label"
            :description="regra.description"
          />
          <div
            v-if="formState.configuracao.configuracoesSeguranca[regra.flag]"
            class="pl-8 pt-4 space-y-4"
          >
            <UCard
              v-for="(
                ocorrenciaRule, index
              ) in formState.configuracao.configuracoesSeguranca.punicoes.filter(
                (p) => p.tipoInfracao === tipoInfracao
              )"
              :key="index"
              variant="outline"
            >
              <div class="flex items-center gap-2 text-sm">
                <span>Após</span>
                <UInputNumber
                  v-model="ocorrenciaRule.quantidadeOcorrencias"
                  :min="1"
                  class="w-20"
                />
                <span>ocorrências, aplicar:</span>
                <UButton
                  color="error"
                  variant="outline"
                  icon="i-lucide-trash-2"
                  class="ml-auto -mr-2"
                  @click="removeOcorrenciaRule(ocorrenciaRule)"
                />
              </div>
              <div class="pl-6 pt-3 space-y-4">
                <div class="flex items-center gap-2">
                  <USelect
                    v-model="ocorrenciaRule.tipoPenalidade"
                    :items="punitionOptions"
                    class="flex-1"
                    placeholder="Selecione uma punição..."
                  />
                  <UInputNumber
                    v-if="
                      ocorrenciaRule.tipoPenalidade ===
                      TipoPenalidadeEnum.REDUZIR_PONTOS
                    "
                    v-model="ocorrenciaRule.pontuacaoPerdida"
                    class="w-24"
                  />
                  <UInputNumber
                    v-if="
                      ocorrenciaRule.tipoPenalidade ===
                      TipoPenalidadeEnum.REDUZIR_TEMPO
                    "
                    v-model="ocorrenciaRule.tempoReduzido"
                    class="w-24"
                  />
                </div>
                <div class="flex items-center gap-6 text-sm">
                  <UCheckbox
                    v-model="ocorrenciaRule.sempre"
                    :disabled="
                      !!(
                        ocorrenciaRule.quantidadeAplicacoes &&
                        ocorrenciaRule.quantidadeAplicacoes > 0
                      )
                    "
                    name="sempre"
                    label="Aplicar 'Sempre' (recorrente)"
                  />
                  <div class="flex items-center gap-2">
                    <UInputNumber
                      v-model="ocorrenciaRule.quantidadeAplicacoes"
                      :min="1"
                      :disabled="ocorrenciaRule.sempre"
                      placeholder="N/A"
                      class="w-24"
                    />
                    <span>vez(es)</span>
                  </div>
                </div>
              </div>
            </UCard>
            <UButton
              label="Adicionar Gatilho de Ocorrência"
              variant="outline"
              size="sm"
              icon="i-lucide-plus"
              class="mt-2"
              @click="addOcorrenciaRule(tipoInfracao)"
            />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
