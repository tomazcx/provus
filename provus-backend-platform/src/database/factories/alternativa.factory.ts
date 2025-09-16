import { setSeederFactory } from 'typeorm-extension';
import { AlternativaModel } from '../config/models/alternativa.model';
import { faker } from '@faker-js/faker';

export const AlternativasFactory = setSeederFactory(AlternativaModel, () => {
  const alternativa = new AlternativaModel();

  alternativa.descricao = faker.lorem.sentence();

  alternativa.isCorreto = faker.datatype.boolean();

  return alternativa;
});
