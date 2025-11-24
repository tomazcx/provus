import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { ConfiguracoesSegurancaModel } from '../config/models/configuracoes-seguranca.model';

export const ConfiguracoesSegurancaFactory = setSeederFactory(
  ConfiguracoesSegurancaModel,
  () => {
    const config = new ConfiguracoesSegurancaModel();
    config.proibirTrocarAbas = faker.datatype.boolean();
    config.proibirCopiarColar = faker.datatype.boolean();
    config.quantidadeTentativas = faker.number.int({ min: 1, max: 3 });
    config.quantidadeAcessosSimultaneos = 1;
    config.ativarCorrecaoDiscursivaViaIa = faker.datatype.boolean();
    return config;
  },
);
