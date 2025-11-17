<script setup lang="ts">
import TipoNotificacaoEnum from "~/enums/TipoNotificacaoEnum";
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
  [TipoInfracaoEnum.PRINT_SCREEN]: {
    label: "Print Screen",
    description: "Detecte se o estudante tirar um print da tela.",
    flag: "proibirPrintScreen" as const,
  },
  [TipoInfracaoEnum.COPIAR_COLAR]: {
    label: "Copiar e Colar",
    description:
      "Detecte se o estudante tentar copiar ou colar algum conteúdo.",
    flag: "proibirCopiarColar" as const,
  },
  [TipoInfracaoEnum.DEV_TOOLS]: {
    label: "Ferramentas de Desenvolvedor",
    description:
      "Detecte se o estudante abrir as ferramentas de desenvolvedor da página.",
    flag: "proibirDevtools" as const,
  },
};

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});

function addIpField() {
  formState.value.configuracao.configuracoesSeguranca.ipsPermitidos.push("");
}
function removeIpField(index: number) {
  formState.value.configuracao.configuracoesSeguranca.ipsPermitidos.splice(
    index,
    1
  );
}

const punitionOptions = Object.values(TipoPenalidadeEnum);

function addOcorrenciaRule(tipoInfracao: TipoInfracaoEnum) {
  const newRule: PunicaoPorOcorrenciaEntity = {
    tipoInfracao: tipoInfracao,
    quantidadeOcorrencias: 1,
    tipoPenalidade: TipoPenalidadeEnum.ALERTAR_ESTUDANTE,
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

const isEmailNotificationSelected = computed({
  get() {
    return formState.value.configuracao.configuracoesSeguranca.notificacoes.includes(
      TipoNotificacaoEnum.EMAIL
    );
  },
  set(value) {
    const selection = new Set(
      formState.value.configuracao.configuracoesSeguranca.notificacoes
    );
    if (value) {
      selection.add(TipoNotificacaoEnum.EMAIL);
    } else {
      selection.delete(TipoNotificacaoEnum.EMAIL);
    }
    formState.value.configuracao.configuracoesSeguranca.notificacoes =
      Array.from(selection);
  },
});
const isPushNotificationSelected = computed({
  get() {
    return formState.value.configuracao.configuracoesSeguranca.notificacoes.includes(
      TipoNotificacaoEnum.PUSH_NOTIFICATION
    );
  },
  set(value) {
    const selection = new Set(
      formState.value.configuracao.configuracoesSeguranca.notificacoes
    );
    if (value) {
      selection.add(TipoNotificacaoEnum.PUSH_NOTIFICATION);
    } else {
      selection.delete(TipoNotificacaoEnum.PUSH_NOTIFICATION);
    }
    formState.value.configuracao.configuracoesSeguranca.notificacoes =
      Array.from(selection);
  },
});

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

    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Controle de acesso</h2>
      </template>
      <div class="space-y-5">
        <UFormField
          label="Quantidade de tentativas"
          description="Defina quantas vezes o aluno pode fazer a avaliação."
        >
          <UInputNumber
            v-model="
              formState.configuracao.configuracoesSeguranca.quantidadeTentativas
            "
          />
        </UFormField>
        <UFormField
          label="Quantidade de acessos simultâneos"
          description="Defina quantas pessoas podem acessar uma mesma prova ao mesmo tempo."
        >
          <UInputNumber
            v-model="
              formState.configuracao.configuracoesSeguranca
                .quantidadeAcessosSimultaneos
            "
          />
        </UFormField>
        <div class="space-y-2">
          <USwitch
            v-model="
              formState.configuracao.configuracoesSeguranca.ativarControleIp
            "
            label="Ativar controle de acesso por IP"
            description="Apenas os endereços de IP listados poderão acessar a avaliação."
          />
          <div
            v-if="
              formState.configuracao.configuracoesSeguranca.ativarControleIp
            "
            class="pl-8 space-y-3"
          >
            <div
              v-for="(ip, index) in formState.configuracao
                .configuracoesSeguranca.ipsPermitidos"
              :key="index"
              class="flex items-center gap-2"
            >
              <UInput
                v-model="
                  formState.configuracao.configuracoesSeguranca.ipsPermitidos[
                    index
                  ]
                "
                placeholder="Ex: 192.168.1.1"
              />
              <UButton
                color="error"
                variant="solid"
                icon="i-lucide-trash-2"
                @click="removeIpField(index)"
              />
            </div>
            <UButton
              label="Adicionar IP"
              variant="outline"
              icon="i-lucide-plus"
              @click="addIpField"
            />
          </div>
        </div>
      </div>
    </UCard>
    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Alertas</h2>
        <p class="text-sm">
          Configure os alertas que podem aparecer aos estudantes.
        </p>
      </template>
      <div class="flex flex-col gap-5">
        <UFormField
          label="Duração do alerta (segundos)"
          description="Por quanto tempo o alerta ficará visível."
        >
          <UInputNumber
            v-model="
              formState.configuracao.configuracoesSeguranca.duracaoAlertas
            "
          />
        </UFormField>
        <USwitch
          v-model="
            formState.configuracao.configuracoesSeguranca.permitirFecharAlertas
          "
          label="Permitir fechar alerta"
          description="O estudante poderá fechar o alerta antes que o tempo de duração termine."
        />
      </div>
    </UCard>
    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Notificações</h2>
        <p class="text-sm">
          Configure suas notificações quando alguém infrigir as regras.
        </p>
      </template>
      <div class="flex flex-col gap-5">
        <UCheckbox
          v-model="isEmailNotificationSelected"
          label="E-mail"
          description="Receba notificações via e-mail."
        />
        <UCheckbox
          v-model="isPushNotificationSelected"
          label="Notificações Push"
          description="Receba notificações pelo aplicativo de celular."
        />
      </div>
    </UCard>
  </div>
</template>
