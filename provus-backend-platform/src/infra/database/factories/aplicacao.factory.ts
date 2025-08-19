import { faker } from '@faker-js/faker';
import EstadoAplicacaoEnum from 'src/domain/enums/estado-aplicacao.enum';
import { setSeederFactory } from 'typeorm-extension';
import { AplicacaoModel } from '../config/models';

export const AplicacoesFactory = setSeederFactory(AplicacaoModel, () => {
  const aplicacao = new AplicacaoModel();

  aplicacao.codigoAcesso = faker.string.alphanumeric(6).toUpperCase();

  const dataInicio = faker.date.soon({ days: 15 });
  aplicacao.dataInicio = dataInicio;

  aplicacao.dataFim = faker.date.soon({ days: 7, refDate: dataInicio });

  aplicacao.estado = faker.helpers.enumValue(EstadoAplicacaoEnum);

  return aplicacao;
});
