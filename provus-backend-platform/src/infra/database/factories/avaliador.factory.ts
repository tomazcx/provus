import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { AvaliadorModel } from '../config/models';

export const AvaliadoresFactory = setSeederFactory(AvaliadorModel, () => {
  const avaliador = new AvaliadorModel();
  avaliador.nome = faker.person.fullName();
  avaliador.email = faker.internet.email().toLowerCase();
  avaliador.senha = faker.internet.password();
  return avaliador;
});
