import { setSeederFactory } from 'typeorm-extension';
import { AvaliacaoModel } from '../config/models';
import { faker } from '@faker-js/faker';

export const AvaliacoesFactory = setSeederFactory(AvaliacaoModel, () => {
  const avaliacao = new AvaliacaoModel();

  avaliacao.titulo = `Avaliação de ${faker.commerce.department()}`;
  avaliacao.descricao = faker.lorem.paragraph();
  avaliacao.isModelo = faker.datatype.boolean();

  return avaliacao;
});
