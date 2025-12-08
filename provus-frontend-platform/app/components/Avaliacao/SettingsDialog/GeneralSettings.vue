<script setup lang="ts">
import DateTimePicker from "@/components/ui/DateTimePicker/index.vue";
import TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";
import type { AvaliacaoEntity } from "~/types/entities/Avaliacao.entity";
import type { RandomizationRuleEntity } from "~/types/entities/Configuracoes.entity";
import DificuldadeRandomizacaoEnum from "~/enums/DificuldadeRandomizacaoEnum";

const props = defineProps<{
  form: AvaliacaoEntity;
}>();

const emit = defineEmits(["update:form", "open-bank-dialog", "view-selection"]);

const tipoAplicacaoOptions = [
  {
    value: TipoAplicacaoEnum.MANUAL,
    label: "Aplicação manual",
    description:
      "A avaliação será aplicada apenas quando você, manualmente, realizar a ação.",
  },
  {
    value: TipoAplicacaoEnum.AGENDADA,
    label: "Aplicação agendada",
    description:
      "A avaliação será aplicada automaticamente em uma data e hora definidas.",
  },
];

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});

function setRandomizationType(newType: TipoRandomizacaoEnum | null) {
  const gerais = formState.value.configuracao.configuracoesGerais;
  if (newType === null) {
    gerais.configuracoesRandomizacao = [];
  } else {
    gerais.configuracoesRandomizacao = [
      {
        id: Date.now(),
        tipo: newType,
        dificuldade: DificuldadeRandomizacaoEnum.QUALQUER,
        quantidade:
          newType === TipoRandomizacaoEnum.BANCO_SIMPLES ||
          newType === TipoRandomizacaoEnum.BANCO_CONFIGURAVEL
            ? 1
            : 0,
        questoes: [],
      },
    ];
  }
}

const isRandomizacaoSimplesActive = computed({
  get: () =>
    formState.value.configuracao.configuracoesGerais
      .configuracoesRandomizacao[0]?.tipo === TipoRandomizacaoEnum.SIMPLES,
  set: (value) => {
    const currentType =
      formState.value.configuracao.configuracoesGerais
        .configuracoesRandomizacao[0]?.tipo;
    if (value) {
      setRandomizationType(TipoRandomizacaoEnum.SIMPLES);
    } else if (currentType === TipoRandomizacaoEnum.SIMPLES) {
      setRandomizationType(null);
    }
  },
});

const isBancoSimplesActive = computed({
  get: () =>
    formState.value.configuracao.configuracoesGerais
      .configuracoesRandomizacao[0]?.tipo ===
    TipoRandomizacaoEnum.BANCO_SIMPLES,
  set: (value) => {
    const currentType =
      formState.value.configuracao.configuracoesGerais
        .configuracoesRandomizacao[0]?.tipo;
    if (value) {
      setRandomizationType(TipoRandomizacaoEnum.BANCO_SIMPLES);
    } else if (currentType === TipoRandomizacaoEnum.BANCO_SIMPLES) {
      setRandomizationType(null);
    }
  },
});

const isBancoConfiguravelActive = computed({
  get: () =>
    formState.value.configuracao.configuracoesGerais
      .configuracoesRandomizacao[0]?.tipo ===
    TipoRandomizacaoEnum.BANCO_CONFIGURAVEL,
  set: (value) => {
    const currentType =
      formState.value.configuracao.configuracoesGerais
        .configuracoesRandomizacao[0]?.tipo;
    if (value) {
      setRandomizationType(TipoRandomizacaoEnum.BANCO_CONFIGURAVEL);
    } else if (currentType === TipoRandomizacaoEnum.BANCO_CONFIGURAVEL) {
      setRandomizationType(null);
    }
  },
});

function addRule() {
  formState.value.configuracao.configuracoesGerais.configuracoesRandomizacao.push(
    {
      id: Date.now(),
      quantidade: 1,
      dificuldade: DificuldadeRandomizacaoEnum.QUALQUER,
      tipo: TipoRandomizacaoEnum.BANCO_CONFIGURAVEL,
      questoes: [],
    }
  );
}

function removeRule(ruleId: number) {
  const rules =
    formState.value.configuracao.configuracoesGerais.configuracoesRandomizacao;
  const index = rules.findIndex((rule) => rule.id === ruleId);
  if (index > -1) {
    rules.splice(index, 1);
    if (rules.length === 0) {
      setRandomizationType(null);
    }
  }
}

function openBankDialogForRule(rule: RandomizationRuleEntity) {
  emit("open-bank-dialog", { rule });
}

function viewSelectionForRule(rule: RandomizationRuleEntity) {
  emit("view-selection", { rule });
}
</script>

<template>
  <div v-if="formState.configuracao" class="w-full flex flex-col gap-6">
    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Gerenciamento de tempo</h2>
      </template>
      <div class="flex justify-between gap-4">
        <UFormField label="Tempo mínimo (minutos)">
          <UInputNumber
            v-model="formState.configuracao.configuracoesGerais.tempoMinimo"
          />
        </UFormField>
        <UFormField label="Duração da avaliação (minutos)">
          <UInputNumber
            v-model="formState.configuracao.configuracoesGerais.tempoMaximo"
          />
        </UFormField>
      </div>
    </UCard>

    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Questões Randômicas</h2>
      </template>
      <div class="flex flex-col gap-6">
        <USwitch
          v-model="isRandomizacaoSimplesActive"
          label="Randomização simples"
          description="Apenas embaralha a ordem das questões e alternativas definidas na aba 'Questões'."
        />
        <div class="flex flex-col gap-3">
          <USwitch
            v-model="isBancoSimplesActive"
            label="Randomização simples do banco de questões"
            description="Sorteia um número de questões de um grupo selecionado no banco."
          />
          <div v-if="isBancoSimplesActive" class="pl-8 flex flex-col gap-3">
            <p class="text-sm text-gray-500">
              Defina a quantidade de questões a serem sorteadas e selecione o
              pool de questões do banco.
            </p>
            <div class="flex items-center gap-3 text-sm">
              <span>Sortear</span>
              <UInputNumber
                v-model="formState.configuracao.configuracoesGerais.configuracoesRandomizacao[0]!.quantidade"
                class="w-20"
              />
              <span>questões do grupo:</span>
              <UButton
                :label="formState.configuracao.configuracoesGerais.configuracoesRandomizacao[0]!.questoes.length > 0 ? 'Ver Seleção' : 'Selecionar do Banco'"
                variant="outline"
                icon="i-lucide-database"
                @click="
                  openBankDialogForRule(
                    formState.configuracao.configuracoesGerais
                      .configuracoesRandomizacao[0]!
                  )
                "
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <USwitch
            v-model="isBancoConfiguravelActive"
            label="Randomização configurável do banco de questões"
            description="Crie regras detalhadas para sortear questões por dificuldade e de grupos diferentes."
          />
          <div
            v-if="isBancoConfiguravelActive"
            class="pl-8 flex flex-col gap-4"
          >
            <div
              v-for="rule in formState.configuracao.configuracoesGerais
                .configuracoesRandomizacao"
              :key="rule.id"
              class="flex items-center gap-3 text-sm"
            >
              <span>Gerar</span>
              <UInputNumber v-model="rule.quantidade" class="w-20" />
              <span>questões do grupo</span>
              <UButton
                :label="rule.questoes.length > 0 ? 'Ver Seleção' : 'Selecionar'"
                variant="outline"
                size="xs"
                icon="i-lucide-database"
                class="flex-shrink-0"
                @click="
                  rule.questoes.length > 0
                    ? viewSelectionForRule(rule)
                    : openBankDialogForRule(rule)
                "
              />
              <span>de dificuldade</span>
              <USelect
                v-model="rule.dificuldade"
                :items="Object.values(DificuldadeRandomizacaoEnum)"
                class="w-28"
              />
              <UButton
                color="error"
                variant="solid"
                icon="i-lucide-trash-2"
                :disabled="
                  formState.configuracao.configuracoesGerais
                    .configuracoesRandomizacao.length <= 1
                "
                @click="removeRule(rule.id!)"
              />
            </div>
            <UButton
              label="Adicionar Outra Regra"
              variant="outline"
              icon="i-lucide-plus"
              class="w-fit"
              @click="addRule"
            />
          </div>
        </div>
      </div>
    </UCard>

    <UCard variant="subtle">
      <template #header><h2 class="font-bold">Aplicação</h2></template>
      <div class="flex flex-col gap-6">
        <URadioGroup
          v-model="formState.configuracao.configuracoesGerais.tipoAplicacao"
          :items="tipoAplicacaoOptions"
          color="primary"
          variant="table"
        />
        <div
          v-if="
            formState.configuracao.configuracoesGerais.tipoAplicacao ===
            'Agendada'
          "
          class="pl-8 flex flex-col gap-4 item"
        >
          <DateTimePicker
            v-model="formState.configuracao.configuracoesGerais.dataAgendamento"
            :enable-date="true"
            :enable-time="true"
          />
        </div>
      </div>
    </UCard>

    <UCard variant="subtle">
      <template #header
        ><h2 class="font-bold">Feedbacks e Reviews</h2></template
      >
      <div class="flex flex-col gap-6">
        <USwitch
          v-model="formState.configuracao.configuracoesGerais.mostrarPontuacao"
          label="Exibir pontuação"
          description="Após a avaliação ser submetida, o estudante poderá ver sua pontuação e apenas ela."
        />
        <USwitch
          v-model="formState.configuracao.configuracoesGerais.permitirRevisao"
          label="Permitir revisão"
          description="O estudante poderá ter acesso à sua prova corrigida."
        />
        <USwitch
          v-model="
            formState.configuracao.configuracoesGerais.exibirPontuacaoQuestoes
          "
          label="Exibir pontuação das questões"
          description="O estudante poderá ver o quanto vale cada questão."
        />
      </div>
    </UCard>
  </div>
</template>
