import { faker } from '@faker-js/faker';
import TipoAplicacaoEnum from 'src/domain/enums/tipo-aplicacao.enum';
import { setSeederFactory } from 'typeorm-extension';
import { ConfiguracoesGeraisModel } from '../config/models/configuracoes-gerais.model';

export const ConfiguracoesGeraisFactory = setSeederFactory(
  ConfiguracoesGeraisModel,
  () => {
    const config = new ConfiguracoesGeraisModel();
    config.tempoMaximo = 120;
    config.tempoMinimo = 30;
    config.tipoAplicacao = faker.helpers.enumValue(TipoAplicacaoEnum);
    config.dataAgendamento = faker.datatype.boolean()
      ? faker.date.future()
      : null;
    config.mostrarPontuacao = faker.datatype.boolean();
    config.permitirRevisao = faker.datatype.boolean();
    config.permitirMultiplosEnvios = faker.datatype.boolean();
    config.exibirPontuacaoQuestoes = faker.datatype.boolean();
    config.permitirConsultarAnexos = faker.datatype.boolean();
    return config;
  },
);
