import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { EstudanteModel } from '../config/models/estudante';

export const EstudantesFactory = setSeederFactory(EstudanteModel, () => {
  const estudante = new EstudanteModel();
  estudante.nome = faker.person.fullName();
  estudante.email = faker.internet
    .email({ firstName: estudante.nome })
    .toLowerCase();

  return estudante;
});
