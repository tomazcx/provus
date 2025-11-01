import apiService from './apiService';
import { SubmissoesResponse } from '../types/Submission';

class SubmissionsApiService {
  async getSubmissionsByApplication(applicationId: number): Promise<SubmissoesResponse> {
    try {
      const response = await apiService.get<SubmissoesResponse>(
        `/backoffice/aplicacao/${applicationId}/submissoes`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching submissions for application ${applicationId}:`, error);
      throw error;
    }
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Avaliada':
      case 'Enviada':
      case 'Encerrada':
        return '#27AE60';
      case 'Iniciada':
      case 'Pausada':
      case 'Reaberta':
        return '#F2C94C';
      case 'Código confirmado':
        return '#3498DB';
      case 'Cancelada':
      case 'Abandonada':
        return '#E74C3C';
      default:
        return '#6C757D';
    }
  }

  getEstadoBackgroundColor(estado: string): string {
    switch (estado) {
      case 'Avaliada':
      case 'Enviada':
      case 'Encerrada':
        return '#E6F4EA';
      case 'Iniciada':
      case 'Pausada':
      case 'Reaberta':
        return '#FEF9E7';
      case 'Código confirmado':
        return '#EBF5FB';
      case 'Cancelada':
      case 'Abandonada':
        return '#FADBD8';
      default:
        return '#F8F9FA';
    }
  }
}

export default new SubmissionsApiService();