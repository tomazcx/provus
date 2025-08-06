<script setup lang="ts">
import DateTimePicker from "@/components/ui/DateTimePicker/index.vue";
import TipoAplicacaoEnum from "~/enums/TipoAplicacaoEnum";
import TipoArquivoEnum from "~/enums/TipoArquivoEnum";
import TipoRandomizacaoEnum from "~/enums/TipoRandomizacaoEnum";
import type { IAvaliacaoImpl } from "~/types/IAvaliacao";
import type { IRandomizationRule } from "~/types/IConfiguracoesAvaliacoes";
import type { IFile } from "~/types/IFile";

const props = defineProps<{
  form: Partial<IAvaliacaoImpl>;
  poolQuestoesCount: number;
}>();

const formState = computed({
  get: () => props.form,
  set: (value) => {
    emit("update:form", value);
  },
});

const emit = defineEmits([
  "update:form",
  "open-bank-dialog",
  "view-selection",
  "open-materials-bank",
  "view-materials",
]);

const isRandomizacaoSimplesActive = computed({
  get: () =>
    formState.value.configuracoes?.tipoRandomizacao ===
    TipoRandomizacaoEnum.SIMPLES,
  set: (value) => {
    if (formState.value.configuracoes) {
      formState.value.configuracoes.tipoRandomizacao = value
        ? TipoRandomizacaoEnum.SIMPLES
        : null;
    }
  },
});

const isBancoSimplesActive = computed({
  get: () =>
    formState.value.configuracoes?.tipoRandomizacao ===
    TipoRandomizacaoEnum.BANCO_SIMPLES,
  set: (value) => {
    if (formState.value.configuracoes) {
      formState.value.configuracoes.tipoRandomizacao = value
        ? TipoRandomizacaoEnum.BANCO_SIMPLES
        : null;
    }
  },
});

const isBancoConfiguravelActive = computed({
  get: () =>
    formState.value.configuracoes?.tipoRandomizacao ===
    TipoRandomizacaoEnum.BANCO_CONFIGURAVEL,
  set: (value) => {
    if (formState.value.configuracoes) {
      formState.value.configuracoes.tipoRandomizacao = value
        ? TipoRandomizacaoEnum.BANCO_CONFIGURAVEL
        : null;
    }
  },
});

const isAplicacaoManual = computed({
  get: () =>
    formState.value.configuracoes?.tipoAplicacao === TipoAplicacaoEnum.MANUAL,
  set: (value) => {
    if (formState.value.configuracoes) {
      formState.value.configuracoes.tipoAplicacao = value
        ? TipoAplicacaoEnum.MANUAL
        : null;
    }
  },
});

const isAplicacaoAgendada = computed({
  get: () =>
    formState.value.configuracoes?.tipoAplicacao === TipoAplicacaoEnum.AGENDADA,
  set: (value) => {
    if (formState.value.configuracoes) {
      formState.value.configuracoes.tipoAplicacao = value
        ? TipoAplicacaoEnum.AGENDADA
        : null;
    }
  },
});

function addRule() {
  formState.value.configuracoes?.regrasRandomizacaoConfiguravel?.push({
    id: Date.now(),
    quantidade: 1,
    dificuldade: "Qualquer",
    grupo: { pastas: [], questoes: [] },
  });
}

function removeRule(ruleId: number) {
  if (!formState.value.configuracoes?.regrasRandomizacaoConfiguravel) return;
  formState.value.configuracoes.regrasRandomizacaoConfiguravel =
    formState.value.configuracoes.regrasRandomizacaoConfiguravel.filter(
      (rule) => rule.id !== ruleId
    );
}

const fileInput = ref<HTMLInputElement | null>(null);

const materiaisAnexadosCount = computed(() => {
  return props.form.configuracoes?.materiaisAnexados?.arquivos.length || 0;
});

function openFilePicker() {
  fileInput.value?.click();
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const arquivosToAdd: IFile[] = [];
  for (const file of Array.from(target.files)) {
    const newFile: IFile = {
      id: Date.now() + Math.random(),
      titulo: file.name,
      tipo: getFileType(file.name),
      url: URL.createObjectURL(file),
      tamanhoEmBytes: file.size,
    };
    arquivosToAdd.push(newFile);
  }
  if (
    props.form.configuracoes &&
    props.form.configuracoes.materiaisAnexados &&
    props.form.configuracoes.materiaisAnexados.arquivos
  ) {
    const updatedForm = {
      ...props.form,
      configuracoes: {
        ...props.form.configuracoes,
        materiaisAnexados: {
          ...props.form.configuracoes.materiaisAnexados,
          arquivos: [
            ...props.form.configuracoes.materiaisAnexados.arquivos,
            ...arquivosToAdd,
          ],
        },
      },
    };
    emit("update:form", updatedForm);
  }
}

function getFileType(fileName: string): TipoArquivoEnum {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return TipoArquivoEnum.PDF;
  if (extension === "docx" || extension === "doc") return TipoArquivoEnum.DOCX;
  if (extension === "pptx" || extension === "ppt") return TipoArquivoEnum.PPTX;
  if (extension === "txt") return TipoArquivoEnum.TXT;
  return TipoArquivoEnum.OUTRO;
}

function openBankDialogForSimple() {
  emit("open-bank-dialog", { context: "simple" });
}

function openBankDialogForRule(ruleId: number) {
  emit("open-bank-dialog", { context: "configurable", ruleId });
}

function viewSimplePool() {
  emit("view-selection", { context: "simple" });
}

function viewConfigurableGroup(rule: IRandomizationRule) {
  emit("view-selection", { context: "configurable", rule });
}
</script>
<template>
  <div v-if="formState.configuracoes" class="w-full flex flex-col gap-6">
    <UCard variant="subtle">
      <template #header
        ><h2 class="font-bold">Gerenciamento de tempo</h2></template
      >
      <div class="flex justify-between gap-4">
        <UFormField label="Tempo mínimo (minutos)">
          <UInputNumber v-model="formState.configuracoes.tempoMinimo" />
        </UFormField>
        <UFormField label="Duração da avaliação (minutos)">
          <UInputNumber v-model="formState.configuracoes.tempoMaximo" />
        </UFormField>
      </div>
    </UCard>
    <UCard variant="subtle">
      <template #header
        ><h2 class="font-bold">Questões randômicas</h2></template
      >
      <div class="flex flex-col gap-6">
        <USwitch
          v-model="isRandomizacaoSimplesActive"
          label="Randomização simples"
          description="Apenas embaralha as questões e alternativas que você adicionou na prova. Cada estudante terá a mesma prova, mas com questões e alternativas em ordem aleatória."
        />
        <div class="flex flex-col gap-3">
          <USwitch
            v-model="isBancoSimplesActive"
            label="Randomização simples do banco de questões"
            description="Selecione um grupo de questões ou pastas que contenham as questões que serão aleatoriamente escolhidas para cada aluno. Quanto maior o número de questões, maior a diversidade."
          />
          <div v-if="isBancoSimplesActive" class="pl-8 flex items-center gap-3">
            <UButton
              label="Selecionar do Banco"
              variant="outline"
              icon="i-lucide-database"
              @click="openBankDialogForSimple"
            />
            <UButton
              v-if="poolQuestoesCount > 0"
              :label="`${poolQuestoesCount} questões selecionadas`"
              variant="link"
              color="primary"
              trailing-icon="i-lucide-eye"
              @click="viewSimplePool"
            />
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <USwitch
            v-model="isBancoConfiguravelActive"
            label="Randomização configurável do banco de questões"
            description="Controle a quantidade de questões de um determinado grupo e dificuldade."
          />

          <div
            v-if="isBancoConfiguravelActive"
            class="pl-8 flex flex-col gap-4"
          >
            <div
              v-for="rule in formState.configuracoes
                .regrasRandomizacaoConfiguravel"
              :key="rule.id"
              class="flex items-center gap-3 text-sm"
            >
              Gerar
              <UInputNumber v-model="rule.quantidade" class="w-20" />
              Questões do grupo

              <UButton
                v-if="
                  rule.grupo.pastas.length > 0 || rule.grupo.questoes.length > 0
                "
                label="Ver Seleção"
                variant="outline"
                size="xs"
                class="flex-shrink-0"
                @click="viewConfigurableGroup(rule)"
              />

              <UButton
                v-else
                label="Selecionar"
                variant="outline"
                size="xs"
                icon="i-lucide-database"
                class="flex-shrink-0"
                @click="openBankDialogForRule(rule.id!)"
              />

              de dificuldade
              <USelect
                v-model="rule.dificuldade"
                :items="['Qualquer', 'Fácil', 'Médio', 'Difícil']"
                class="w-28"
              />
              <UButton
                color="error"
                variant="solid"
                icon="i-lucide-trash-2"
                @click="removeRule(rule.id!)"
              />
            </div>

            <UButton
              label="Adicionar Configuração"
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
        <USwitch
          v-model="isAplicacaoManual"
          label="Aplicação manual"
          description="A avaliação será aplicada apenas quando você, manualmente, realizar a ação."
        />

        <USwitch
          v-model="isAplicacaoAgendada"
          label="Aplicação agendada"
          description="A avaliação será aplicada automaticamente em uma data e hora definidas."
        />
        <div v-if="isAplicacaoAgendada" class="pl-8 flex flex-col gap-4 item">
          <DateTimePicker
            v-model="formState.configuracoes.dataAgendada"
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
          v-model="formState.configuracoes.exibirPontuacaDaSubmissao"
          label="Exibir pontuação"
          description="Após a avaliação ser submetida, o estudante poderá ver sua pontuação e apenas ela."
        />

        <USwitch
          v-model="formState.configuracoes.permitirRevisao"
          label="Permitir revisão"
          description="O estudante poderá ter acesso à sua prova corrigida."
        />

        <USwitch
          v-model="formState.configuracoes.exibirPontuacaoQuestoes"
          label="Exibir pontuação das questões"
          description="O estudante poderá ver o quanto vale cada questão."
        />
      </div>
    </UCard>

    <UCard variant="subtle">
      <template #header>
        <h2 class="font-bold">Materiais de Consulta</h2>
      </template>
      <div class="flex flex-col gap-4">
        <USwitch
          v-model="formState.configuracoes.permitirConsulta"
          label="Permitir consulta a materiais anexados"
          description="O aluno terá acesso aos arquivos durante a avaliação."
        />
        <div
          v-if="formState.configuracoes.permitirConsulta"
          class="pl-8 flex items-center gap-3"
        >
          <UButton
            label="Selecionar do Banco"
            variant="outline"
            icon="i-lucide-database"
            @click="emit('open-materials-bank')"
          />
          <UButton
            label="Anexar Novo Arquivo"
            variant="outline"
            icon="i-lucide-upload"
            @click="openFilePicker"
          />
          <UButton
            v-if="materiaisAnexadosCount > 0"
            :label="`${materiaisAnexadosCount} materiais anexados`"
            variant="link"
            color="primary"
            trailing-icon="i-lucide-eye"
            @click="emit('view-materials')"
          />
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            multiple
            @change="handleFileUpload"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>
