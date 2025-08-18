import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { PastaModel } from '../config/models';

export const PastasFactory = setSeederFactory(PastaModel, () => {
  const pasta = new PastaModel();
  pasta.titulo = faker.system.directoryPath().split('/').pop() || 'Nova Pasta';
  return pasta;
});
