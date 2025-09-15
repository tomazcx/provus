import DificuldadeQuestaoEnum from 'src/enums/dificuldade-questao.enum';

class AlternativaDto {
  titulo: string;
  descricao?: string;
  isCorreto: boolean;
}

export class GeneratedQuestaoDto {
  titulo: string;
  descricao: string;
  dificuldade: DificuldadeQuestaoEnum;
  exemplo_resposta: string;
  alternativas?: AlternativaDto[];
}
