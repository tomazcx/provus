import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { ArquivoModel } from '../config/models/arquivo';

export const ArquivosFactory = setSeederFactory(ArquivoModel, () => {
  const arquivo = new ArquivoModel();
  arquivo.url = faker.internet.url();
  arquivo.descricao = faker.lorem.sentence();

  arquivo.tamanhoEmBytes = faker.number.int({ min: 1000, max: 5000000 });
  return arquivo;
});
