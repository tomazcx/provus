import { setSeederFactory } from 'typeorm-extension';
import { ConfiguracaoAvaliacaoModel } from '../config/models/configuracao-avaliacao.model';

export const ConfiguracaoAvaliacaoFactory = setSeederFactory(
  ConfiguracaoAvaliacaoModel,
  () => {
    return new ConfiguracaoAvaliacaoModel();
  },
);
