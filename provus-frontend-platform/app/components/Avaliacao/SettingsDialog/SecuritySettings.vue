<script setup lang="ts">
import TipoNotificacaoEnum from "~/enums/TipoNotificacaoEnum";
import TipoPenalidadeEnum from "~/enums/TipoPenalidadeEnum";
import type { AvaliacaoImpl } from "~/types/IAvaliacao";
import type {
  IRegraDeOcorrencia,
  IRegraSeguranca,
} from "~/types/IConfiguracoesAvaliacoes";

const props = defineProps<{
  form: Partial<AvaliacaoImpl>;
  poolQuestoesCount: number;
}>();

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});

function addIpField() {
  if (formState.value.configuracoes) {
    if (!formState.value.configuracoes.ipsPermitidos) {
      formState.value.configuracoes.ipsPermitidos = [];
    }
    formState.value.configuracoes.ipsPermitidos.push("");
  }
}

function removeIpField(index: number) {
  if (formState.value.configuracoes?.ipsPermitidos) {
    formState.value.configuracoes.ipsPermitidos.splice(index, 1);
  }
}

const punitionOptions = Object.values(TipoPenalidadeEnum);

function addOcorrenciaRule(regra: IRegraSeguranca) {
  regra.regrasDeOcorrencia.push({
    id: Date.now(),
    ocorrencias: 1,
    punicoes: [],
  });
}

function removeOcorrenciaRule(regra: IRegraSeguranca, ocorrenciaId: number) {
  regra.regrasDeOcorrencia = regra.regrasDeOcorrencia.filter(
    (o) => o.id !== ocorrenciaId
  );
}

function addPunition(ocorrenciaRule: IRegraDeOcorrencia) {
  ocorrenciaRule.punicoes.push({
    id: Date.now(),
    tipo: null,
    valor: 0,
  });
}

function removePunition(ocorrenciaRule: IRegraDeOcorrencia, punicaoId: number) {
  ocorrenciaRule.punicoes = ocorrenciaRule.punicoes.filter(
    (p) => p.id !== punicaoId
  );
}

const isEmailNotificationSelected = computed({
  get() {
    return (
      formState.value.configuracoes?.tipoNotificacao?.includes(
        TipoNotificacaoEnum.EMAIL
      ) ?? false
    );
  },
  set(value) {
    if (!formState.value.configuracoes) return;

    const selection = new Set(
      formState.value.configuracoes.tipoNotificacao || []
    );

    if (value) {
      selection.add(TipoNotificacaoEnum.EMAIL);
    } else {
      selection.delete(TipoNotificacaoEnum.EMAIL);
    }

    formState.value.configuracoes.tipoNotificacao = Array.from(selection);
  },
});

const isPushNotificationSelected = computed({
  get() {
    return (
      formState.value.configuracoes?.tipoNotificacao?.includes(
        TipoNotificacaoEnum.PUSH_NOTIFICATION
      ) ?? false
    );
  },
  set(value) {
    if (!formState.value.configuracoes) return;

    const selection = new Set(
      formState.value.configuracoes.tipoNotificacao || []
    );

    if (value) {
      selection.add(TipoNotificacaoEnum.PUSH_NOTIFICATION);
    } else {
      selection.delete(TipoNotificacaoEnum.PUSH_NOTIFICATION);
    }

    formState.value.configuracoes.tipoNotificacao = Array.from(selection);
  },
});

const emit = defineEmits(["update:form", "open-bank-dialog", "view-selection"]);
</script>
<template>
  <div v-if="formState.configuracoes" class="w-full flex flex-col gap-6">
    <UCard variant="subtle">
      <template #header>
        <div class="flex justify-between">
          <h2 class="font-bold">Segurança no navegador</h2>
        </div>
      </template>
      <div class="flex flex-col gap-5">
        <div
          v-for="(regra, tipoInfracao) in formState.configuracoes
            .regrasDeSeguranca"
          :key="tipoInfracao"
        >
          <USwitch
            v-model="regra.ativo"
            :label="tipoInfracao"
            :description="regra.descricao"
          />

          <div v-if="regra.ativo" class="pl-8 pt-4 space-y-4">
            <UCard
              v-for="ocorrenciaRule in regra.regrasDeOcorrencia"
              :key="ocorrenciaRule.id"
              variant="outline"
            >
              <div class="flex items-center gap-2 text-sm">
                <span>Após</span>
                <UInputNumber
                  v-model="ocorrenciaRule.ocorrencias"
                  class="w-20"
                />
                <span>ocorrências, aplicar:</span>
                <UButton
                  color="error"
                  variant="outline"
                  icon="i-lucide-trash-2"
                  class="ml-auto -mr-2"
                  @click="removeOcorrenciaRule(regra, ocorrenciaRule.id)"
                />
              </div>

              <div class="pl-6 pt-3 space-y-3">
                <div
                  v-for="punicao in ocorrenciaRule.punicoes"
                  :key="punicao.id"
                  class="flex items-center gap-2"
                >
                  <USelect
                    v-model="punicao.tipo!"
                    :items="punitionOptions"
                    class="flex-1"
                    placeholder="Selecione uma punição..."
                  />
                  <UInputNumber
                    v-if="
                      punicao.tipo === TipoPenalidadeEnum.REDUZIR_PONTOS ||
                      punicao.tipo === TipoPenalidadeEnum.REDUZIR_TEMPO
                    "
                    v-model="punicao.valor"
                    class="w-24"
                  />
                  <UButton
                    color="error"
                    variant="ghost"
                    icon="i-lucide-x"
                    @click="removePunition(ocorrenciaRule, punicao.id)"
                  />
                </div>
                <UButton
                  label="Adicionar Punição"
                  variant="link"
                  size="xs"
                  icon="i-lucide-plus"
                  @click="addPunition(ocorrenciaRule)"
                />
              </div>
            </UCard>

            <UButton
              label="Adicionar Gatilho de Ocorrência"
              variant="outline"
              size="sm"
              icon="i-lucide-plus"
              class="mt-2"
              @click="addOcorrenciaRule(regra)"
            />
          </div>
        </div>
      </div>
    </UCard>

    <UCard variant="subtle">
      <template #header>
        <div class="flex justify-between">
          <h2 class="font-bold">Controle de acesso</h2>
        </div>
      </template>

      <div class="space-y-5">
        <UFormField
          label="Quantidade de tentativas"
          description="Defina quantas vezes o aluno pode fazer a avaliação."
        >
          <UInputNumber
            v-model="formState.configuracoes.numeroMaximoDeEnvios"
          />
        </UFormField>

        <UFormField
          label="Quantidade de acessos simultâneos"
          description="Defina quantas pessoas podem acessar uma mesma prova ao mesmo tempo."
        >
          <UInputNumber
            v-model="formState.configuracoes.quantidadeAcessosSimultaneos"
          />
        </UFormField>
        <div class="space-y-2">
          <USwitch
            v-model="formState.configuracoes.ativarControleIp"
            label="Ativar controle de acesso por IP"
            description="Apenas os endereços de IP listados poderão acessar a avaliação."
          />

          <div
            v-if="formState.configuracoes.ativarControleIp"
            class="pl-8 space-y-3"
          >
            <div
              v-for="(ip, index) in formState.configuracoes.ipsPermitidos"
              :key="index"
              class="flex items-center gap-2"
            >
              <UInput
                v-model="formState.configuracoes.ipsPermitidos[index]"
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
        <div class="flex justify-between">
          <h2 class="font-bold">Alertas</h2>
        </div>
        <p class="text-sm">
          Configure os alertas que podem aparecer aos estudantes.
        </p>
      </template>
      <div class="flex flex-col gap-5">
        <div class="flex justify-between">
          <UFormField
            label="Duração do alerta (segundos)"
            description="Por quanto tempo o alerta ficará visível."
          >
            <UInputNumber v-model="formState.configuracoes.duracaoDoAlerta" />
          </UFormField>
        </div>
        <USwitch
          v-model="formState.configuracoes.permitirFecharAlerta"
          label="Permitir fechar alerta"
          description="O estudante poderá fechar o alerta antes que o tempo de duração termine."
        />
      </div>
    </UCard>

    <UCard variant="subtle">
      <template #header>
        <div class="flex justify-between">
          <h2 class="font-bold">Notificações</h2>
        </div>
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
