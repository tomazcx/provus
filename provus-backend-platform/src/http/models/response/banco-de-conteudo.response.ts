import { ApiProperty } from '@nestjs/swagger';
import { BancoDeConteudoModel } from 'src/database/config/models/banco-de-conteudo.model';
import { TipoBancoEnum } from 'src/enums/tipo-banco';

export class BancoDeConteudoResponse {
  @ApiProperty({
    description:
      'O tipo do banco de conteúdo, para que o frontend saiba o que está listando.',
    enum: TipoBancoEnum,
    example: TipoBancoEnum.QUESTOES,
  })
  tipoBanco: TipoBancoEnum;

  @ApiProperty({
    description:
      'O título da pasta raiz deste banco, para ser exibido na interface.',
    example: 'Banco de Questões',
  })
  titulo: string;

  @ApiProperty({
    description:
      'O ID da pasta raiz. Usado pelo frontend para buscar o conteúdo deste banco.',
    example: 21,
  })
  pastaId: number;

  static fromModel(model: BancoDeConteudoModel): BancoDeConteudoResponse {
    const response = new BancoDeConteudoResponse();
    response.tipoBanco = model.tipoBanco;
    response.titulo = model.pastaRaiz.titulo;
    response.pastaId = model.pastaRaiz.id;
    return response;
  }
}
