<script setup lang="ts">
import { mockAvaliacao } from "~/mock/mockAvaliacao";
import { mockSubmissionResponse } from "~/mock/mockSubmissionResponse";
import ReviewHeader from "~/components/Aluno/Revisao/ReviewHeader/index.vue";
import ReviewSidebar from "~/components/Aluno/Revisao/ReviewSidebar/index.vue";
import ReviewedQuestionCard from "~/components/Aluno/Revisao/ReviewedQuestionCard/index.vue";
import TipoQuestaoEnum from "~/enums/TipoQuestaoEnum";
import type {
  IRespostaDiscursiva,
  IRespostaMultiplaEscolha,
  IRespostaObjetiva,
} from "~/types/IQuestao";

const submission = mockSubmissionResponse.submissoes[0]!;
const assessment = mockAvaliacao;

const reviewedQuestions = computed(() => {
  return assessment.questoes.map((q) => {
    const answeredQuestion = submission?.questoesRespondidas?.find(
      (aq) => aq.id === q.id
    );
    if (q.tipo === TipoQuestaoEnum.DISCURSIVA) {
      return {
        ...(q as import("~/types/IQuestao").IQuestaoDiscursiva),
        resposta: answeredQuestion?.resposta as IRespostaDiscursiva | undefined,
      };
    } else if (q.tipo === TipoQuestaoEnum.OBJETIVA) {
      return {
        ...(q as import("~/types/IQuestao").IQuestaoObjetiva),
        resposta: answeredQuestion?.resposta as IRespostaObjetiva | undefined,
      };
    } else if (q.tipo === TipoQuestaoEnum.MULTIPLA_ESCOLHA) {
      return {
        ...(q as import("~/types/IQuestao").IQuestaoMultiplaEscolhaOuVerdadeiroOuFalso),
        resposta: answeredQuestion?.resposta as
          | IRespostaMultiplaEscolha
          | undefined,
      };
    } else if (q.tipo === TipoQuestaoEnum.VERDADEIRO_FALSO) {
      return {
        ...q,
        resposta: answeredQuestion?.resposta as
          | IRespostaMultiplaEscolha
          | undefined,
      };
    } else return q;
  });
});
</script>

<template>
  <div>
    <ReviewHeader :avaliacao="assessment" />
    <div class="flex pt-20">
      <ReviewSidebar
        :submission="submission"
        :total-score="assessment.pontuacao"
      />
      <main class="ml-80 flex-1 p-6">
        <div class="max-w-4xl mx-auto">
          <div class="space-y-6">
            <ReviewedQuestionCard
              v-for="(questao, index) in reviewedQuestions"
              :key="questao.id"
              :questao="questao"
              :numero="index + 1"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
