import { AlternativaModel } from 'src/database/config/models/alternativa.model';

export class AlternativaRevisaoResultDto {
  id: number;
  descricao: string;
  isCorreto: boolean;

  constructor(model: AlternativaModel) {
    this.id = model.id;
    this.descricao = model.descricao;
    this.isCorreto = model.isCorreto;
  }
}
