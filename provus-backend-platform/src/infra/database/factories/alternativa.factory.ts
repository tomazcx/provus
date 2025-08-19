import { setSeederFactory } from 'typeorm-extension';

import { AlternativaModel } from 'src/infra/database/config/models/alternativa';
import { faker } from '@faker-js/faker';

export const AlternativasFactory = setSeederFactory(AlternativaModel, () => {
  const alternativa = new AlternativaModel();

  alternativa.titulo = faker.lorem.sentence({ min: 5, max: 10 });

  alternativa.descricao = faker.datatype.boolean()
    ? faker.lorem.paragraph(2)
    : null;

  alternativa.isCorreto = faker.datatype.boolean();

  return alternativa;
});
