import { mockSubmissionResponse, ISubmissao } from '../mock/mockSubmissionResponse';
import { mockAvaliacao } from '../mock/mockAvaliacao';

export interface IStudentSubmissionResult {
  testName: string;
  professor: string;
  submissionTime: string;
  timeTaken: string;
  score: number;
  totalPoints: number;
  percentage: number;
  confirmationCode: string;
  questions: Array<{
    id: number;
    points: number;
    totalPoints: number;
    isCorrect: boolean;
  }>;
}

export interface IStudentTestReview {
  testName: string;
  questions: Array<{
    id: number;
    question?: string;
    points: number;
    totalPoints: number;
    isCorrect: boolean;
    options?: Array<{
      text: string;
      isSelected: boolean;
      isCorrect: boolean;
    }>;
    feedback?: string;
  }>;
}

class StudentMockDataService {
  async getSubmissionResult(submissionId: number): Promise<IStudentSubmissionResult> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const submission = mockSubmissionResponse.submissoes.find(s => s.id === submissionId);
    
    if (!submission) {
      throw new Error(`Submission with ID ${submissionId} not found`);
    }

    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Data não disponível';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const calculateTimeTaken = (start?: string, end?: string) => {
      if (!start || !end) return 'Tempo não disponível';
      const startTime = new Date(start);
      const endTime = new Date(end);
      const diffMs = endTime.getTime() - startTime.getTime();
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      return `${minutes} minutos ${seconds} segundos`;
    };

    return {
      testName: mockSubmissionResponse.titulo,
      professor: 'Prof. Silva',
      submissionTime: formatDate(submission.finalizadoEm),
      timeTaken: calculateTimeTaken(submission.iniciadoEm, submission.finalizadoEm),
      score: submission.pontuacaoTotal,
      totalPoints: mockSubmissionResponse.pontuacaoTotal,
      percentage: Math.round((submission.pontuacaoTotal / mockSubmissionResponse.pontuacaoTotal) * 100),
      confirmationCode: `TST-${mockSubmissionResponse.applicationId}-${submission.id}-${new Date().getFullYear()}`,
      questions: mockAvaliacao.questoes?.map((questao, index) => ({
        id: questao.id,
        points: index < 2 ? questao.pontuacao : Math.floor(questao.pontuacao * 0.7),
        totalPoints: questao.pontuacao,
        isCorrect: index < 2,
      })) || [],
    };
  }

  async getTestReview(submissionId: number): Promise<IStudentTestReview> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const submission = mockSubmissionResponse.submissoes.find(s => s.id === submissionId);
    
    if (!submission) {
      throw new Error(`Submission with ID ${submissionId} not found`);
    }

    return {
      testName: mockSubmissionResponse.titulo,
      questions: [
        {
          id: 1,
          question: "Qual é o resultado de 15 + 27?",
          points: 20,
          totalPoints: 20,
          isCorrect: true,
          options: [
            { text: "32 (Sua resposta)", isSelected: true, isCorrect: true },
            { text: "42", isSelected: false, isCorrect: false },
            { text: "52", isSelected: false, isCorrect: false },
            { text: "35", isSelected: false, isCorrect: false }
          ],
          feedback: "Excelente! Você realizou a adição corretamente."
        },
        {
          id: 2,
          question: "A raiz quadrada de 144 é 12.",
          points: 15,
          totalPoints: 15,
          isCorrect: true,
          options: [
            { text: "Verdadeiro (Sua resposta)", isSelected: true, isCorrect: true },
            { text: "Falso", isSelected: false, isCorrect: false }
          ],
          feedback: "Perfeito! √144 = 12 está correto."
        },
        {
          id: 3,
          question: "Selecione todos os números primos da lista:",
          points: 15,
          totalPoints: 25,
          isCorrect: false,
          options: [
            { text: "2 (Sua resposta)", isSelected: true, isCorrect: true },
            { text: "4 (Não selecionado)", isSelected: false, isCorrect: false },
            { text: "7 (Sua resposta)", isSelected: true, isCorrect: true },
            { text: "9 (Não selecionado)", isSelected: false, isCorrect: false }
          ],
          feedback: "Boa resposta parcial, mas você perdeu alguns números primos na seleção."
        }
      ]
    };
  }

  getAvailableSubmissionIds(): number[] {
    return mockSubmissionResponse.submissoes.map(s => s.id);
  }
}

export default new StudentMockDataService();