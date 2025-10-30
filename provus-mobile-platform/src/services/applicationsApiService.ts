import apiService from './apiService';
import { Aplicacao } from '../types/Application';

interface AplicacaoApiResponse {
  id: number;
  avaliacao: {
    id: number;
    titulo: string;
    descricao?: string;
    isModelo: boolean;
    path: string;
    questoes: any[];
    arquivos: any[];
    configuracaoAvaliacao?: {
      configuracoesGerais: {
        tempoMaximo: number;
        tempoMinimo: number;
        tipoAplicacao: string;
        dataAgendamento?: string;
        mostrarPontuacao: boolean;
        exibirPontuacaoQuestoes: boolean;
        permitirRevisao: boolean;
        permitirMultiplosEnvios: boolean;
      };
      configuracoesSeguranca?: any;
    };
    criadoEm: string;
    atualizadoEm: string;
    tipo: string;
    paiId: number | null;
  };
  estado: string;
  codigoAcesso: string;
  dataInicio: string;
  dataFim: string;
  totalSubmissoes?: number;
  mediaGeralPercentual?: number | null;
}

class ApplicationsApiService {
  private mapApiResponseToApplication(apiResponse: AplicacaoApiResponse): Aplicacao {
    const tempoMaximo = apiResponse.avaliacao.configuracaoAvaliacao?.configuracoesGerais?.tempoMaximo || 0;

    return {
      id: apiResponse.id,
      codigoDeAcesso: apiResponse.codigoAcesso,
      titulo: apiResponse.avaliacao.titulo,
      descricao: apiResponse.avaliacao.descricao || '',
      dataAplicacao: apiResponse.dataInicio,
      participantes: apiResponse.totalSubmissoes || 0,
      taxaDeConclusao: 0,
      tempoMedio: tempoMaximo,
      mediaGeral: apiResponse.mediaGeralPercentual || 0,
      maiorNota: 0,
      menorNota: 0,
      desvioPadrao: 0,
      notaMedia: apiResponse.mediaGeralPercentual || 0,
      penalidades: [],
      estado: apiResponse.estado as any,
      avaliacaoModeloId: apiResponse.avaliacao.id,
      ajusteDeTempoEmSegundos: 0,
    };
  }

  async getApplications(): Promise<Aplicacao[]> {
    try {
      const response = await apiService.get<AplicacaoApiResponse[]>('/backoffice/aplicacoes');
      return response.map(this.mapApiResponseToApplication);
    } catch (error) {
      console.error('Error fetching applications from API:', error);
      throw error;
    }
  }

  async getApplicationById(id: number): Promise<Aplicacao | null> {
    try {
      const response = await apiService.get<AplicacaoApiResponse>(`/backoffice/aplicacao/${id}`);
      return this.mapApiResponseToApplication(response);
    } catch (error) {
      console.error(`Error fetching application ${id} from API:`, error);
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'Em Andamento':
        return '#F2C94C';
      case 'Finalizada':
        return '#27AE60';
      case 'Agendada':
        return '#192A56';
      case 'Cancelada':
        return '#E74C3C';
      default:
        return '#6C757D';
    }
  }

  getStatusBackgroundColor(estado: string): string {
    switch (estado) {
      case 'Em Andamento':
        return '#FEF9E7';
      case 'Finalizada':
        return '#E6F4EA';
      case 'Agendada':
        return '#EBF0FF';
      case 'Cancelada':
        return '#FADBD8';
      default:
        return '#F8F9FA';
    }
  }
}

export default new ApplicationsApiService();