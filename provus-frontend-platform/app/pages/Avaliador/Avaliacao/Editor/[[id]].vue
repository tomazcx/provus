<script setup lang="ts">
import Details from "@/components/Avaliacao/Details/index.vue";
import SaveToQuestionsBankDialog from "@/components/Avaliacao/SaveToQuestionsBankDialog/index.vue";
import AssessmentQuestionList from "@/components/Avaliacao/AssessmentQuestionList/index.vue";
import Overview from "@/components/Avaliacao/Overview/index.vue";
import QuickSettings from "@/components/Avaliacao/QuickSettings/index.vue";
import DificuldadeQuestaoEnum from "~/enums/DificuldadeQuestaoEnum";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type { IAlternativa, IQuestao } from "~/types/IQuestao";
import type { AvaliacaoImpl } from "~/types/IAvaliacao";

// const route = useRoute();
// const examId = computed(() => route.params.id as string | null);
// const isEditing = computed(() => !!examId.value);

definePageMeta({
  layout: "assessment-editor",
});

// 2. A função para criar uma prova vazia agora retorna o tipo IProva
// const getNewExamTemplate = (): IProva => ({
//   id: null,
//   titulo: "",
//   duracao: "",
//   pontos: 0,
//   materia: "",
//   instrucoes: "",
//   questoes: [], // O tipo aqui é AnyQuestion[]
//   configuracoes: {
//     embaralharQuestoes: true,
//     mostrarResultados: true,
//     permitirRefazer: true,
//     tentativasPermitidas: 1,
//   },
// });

// 3. Reativamos o useAsyncData para lidar com a lógica de criar vs. editar
// const {
//   data: prova,
//   pending,
//   error,
// } = await useAsyncData<IProva>(
//   `prova-editor-${examId.value || null}`,
//   async () => {
//     if (isEditing.value) {
//       console.log(`Buscando dados da prova com ID: ${examId.value}`);
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       // O objeto simulado agora é um IProva válido com uma questão do tipo IQuestionMultipleChoice
//       const provaExistente: IProva = {
//         id: examId.value,
//         titulo: "Prova Existente de Biologia",
//         duracao: "90 minutos",
//         pontos: 100,
//         materia: "Biologia",
//         instrucoes: "Instruções da prova carregada.",
//         questoes: [
//           {
//             id: 1,
//             titulo: "Qual organela é responsável pela respiração celular?",
//             pontuacao: 10,
//             dificuldade: "Médio",
//             tipo: { label: "Múltipla Escolha", value: "multipla-escolha" },
//             opcoes: [
//                 { id: 1, texto: "Ribossomo", isCorreta: false },
//                 { id: 2, texto: "Mitocôndria", isCorreta: true },
//                 { id: 3, texto: "Lisossomo", isCorreta: false },
//             ]
//           },
//         ],
//         configuracoes: {
//           embaralharQuestoes: true,
//           mostrarResultados: false,
//           permitirRefazer: true,
//           tentativasPermitidas: 2,
//         },
//       };
//       return provaExistente;
//     } else {
//       console.log("Nenhum ID fornecido. Modo de criação.");
//       return getNewExamTemplate();
//     }
//   },
//   { watch: [examId] }
// );

const prova = ref<AvaliacaoImpl>({
  titulo: "",
  duracao: "120",
  pontuacao: 100,
  descricao: "",
  isModelo: false,
  dataAgendamento: "",
  questoes: [],
  configuracoes: {
    dataDeAplicacao: "",
    dataDeEncerramento: "",
    mostrarPontuacao: true,
    mostrarRespostas: true,
    permitirMultiplosEnvios: false,
    autocorrecaoIa: true,
    numeroMaximoDeEnvios: 1,
    embaralharQuestoes: true,
    embaralharAlternativas: true,
    tempoMaximo: 120,
    tempoMinimo: 30,
  },
});

function adicionarQuestao() {
  if (!prova.value) return;

  const novaQuestao: IQuestao = {
    id: Date.now(),
    titulo: "",
    descricao: "",
    pontuacao: 1,
    dificuldade: DificuldadeQuestaoEnum.FACIL,
    tipo: TipoQuestaoEnum.OBJETIVA,
    alternativas: [
      {
        id: Date.now() + 1,
        descricao: "",
        isCorreto: true,
      },
    ],
    exemploDeResposta: "",
    textoRevisao: "",
  };

  prova.value.questoes.push(novaQuestao);
}

function removerQuestao(id: number) {
  if (!prova.value) return;
  prova.value.questoes = prova.value.questoes.filter((q) => q.id !== id);
}

// const toast = useToast();
// function salvarProva() {
//   if (isEditing.value) {
//     console.log("Atualizando prova...", prova.value);
//     toast.add({ title: "Prova atualizada com sucesso!", color: "secondary" });
//   } else {
//     console.log("Criando nova prova...", prova.value);
//     toast.add({ title: "Prova criada com sucesso!", color: "secondary" });
//   }
// }

function handleAddQuestionsFromBank(questions: IQuestao[]) {
  const questionCopies = questions.map((originalQuestion, index) => {
    const newQuestion = JSON.parse(JSON.stringify(originalQuestion));

    newQuestion.id = Date.now() + index;

    if (newQuestion.alternativas) {
      newQuestion.alternativas.forEach(
        (alt: IAlternativa, altIndex: number) => {
          alt.id = Date.now() + index + altIndex + 1;
        }
      );
    }

    return newQuestion;
  });
  prova.value.questoes.push(...questionCopies);
}

const bancoDeQuestoesDialog = ref(false);
const saveToBankDialog = ref(false);
const questionToSave = ref<IQuestao | null>(null);

function handleSaveQuestionToBank(question: IQuestao) {
  questionToSave.value = JSON.parse(JSON.stringify(question));
  saveToBankDialog.value = true;
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <OpenQuestionBankDialog
      v-model="bancoDeQuestoesDialog"
      @add-questions="handleAddQuestionsFromBank"
    />

    <SaveToQuestionsBankDialog
      v-model="saveToBankDialog"
      :question-to-save="questionToSave"
    />

    <!-- <div v-if="pending" class="text-center p-10">
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin text-4xl text-gray-500"
      />
      <p class="mt-2 text-gray-600">Carregando editor da prova...</p>
    </div>

    <div v-else-if="error" class="text-center p-10">
      <p class="text-red-500">Ocorreu um erro ao carregar os dados da prova.</p>
    </div> -->

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3 space-y-6">
          <Details v-model="prova" />
          <AssessmentQuestionList
            v-model:questoes="prova.questoes"
            @adicionar="adicionarQuestao"
            @remover="removerQuestao"
            @adicionar-do-banco="bancoDeQuestoesDialog = true"
            @save-to-bank="handleSaveQuestionToBank"
          />
        </div>
        <div class="sticky top-24 space-y-6">
          <Overview :prova="prova" />
          <QuickSettings v-model="prova.configuracoes" />
        </div>
      </div>
    </div>
  </div>
</template>
