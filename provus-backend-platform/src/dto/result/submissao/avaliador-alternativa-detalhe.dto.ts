import { AlternativaModel } from 'src/database/config/models/alternativa.model';

export class AvaliadorAlternativaDetalheDto {
  id: number;
  descricao: string;
  isCorreto: boolean;

  constructor(model: AlternativaModel) {
    this.id = model.id;
    this.descricao = model.descricao;
    this.isCorreto = model.isCorreto;
  }
}
