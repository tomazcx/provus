import { Aplicacao } from '../types/Application';
import { IDashboardData } from '../types/Dashboard';
import { IMonitoringData } from '../types/Monitoring';
import { mockApplicationsResponse } from '../mock/mockApplications';
import { mockDashboardResponse } from '../mock/mockDashboard';
import { mockMonitoringResponse } from '../mock/mockMonitoring';

class MockDataService {
  async getApplications(): Promise<Aplicacao[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockApplicationsResponse);
      }, 500);
    });
  }

  async getApplicationById(id: number): Promise<Aplicacao | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const application = mockApplicationsResponse.find(app => app.id === id);
        resolve(application || null);
      }, 300);
    });
  }

  async getDashboardData(): Promise<IDashboardData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDashboardResponse);
      }, 400);
    });
  }

  async getMonitoringData(applicationId: number): Promise<IMonitoringData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...mockMonitoringResponse,
          applicationId,
        });
      }, 400);
    });
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

export default new MockDataService();