import EstadoAvaliacaoEnum from '../enums/EstadoAvaliacaoEnum';

export interface IAvaliacao {
  id: number;
  titulo: string;
  dataAgendamento?: string;
  estado: EstadoAvaliacaoEnum;
  descricao?: string;
  atualizadoEm?: string;
}

export interface IDashboardData {
  totalAvaliacoes: number;
  avaliacoesEmAndamento: number;
  avaliacoesFinalizadas: number;
  proximosAgendamentos: IAvaliacao[];
  ultimosEventos: IAvaliacao[];
}