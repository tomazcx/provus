import { faker } from '@faker-js/faker';
import EstadoSubmissaoEnum from 'src/domain/enums/estado-submissao.enum';
import { setSeederFactory } from 'typeorm-extension';
import { SubmissaoModel } from '../config/models';

export const SubmissoesFactory = setSeederFactory(SubmissaoModel, () => {
  const submissao = new SubmissaoModel();
  submissao.hash = faker.string.uuid();
  submissao.estado = faker.helpers.enumValue(EstadoSubmissaoEnum);
  submissao.pontuacaoTotal = faker.number.float({
    min: 0,
    max: 100,
    fractionDigits: 2,
  });
  submissao.finalizadoEm = faker.date.recent();
  submissao.codigoEntrega = faker.number.int({ min: 1000, max: 9999 });

  return submissao;
});
