import { setSeederFactory } from 'typeorm-extension';
import { ConfiguracaoAvaliacaoModel } from '../config/models';

export const ConfiguracaoAvaliacaoFactory = setSeederFactory(
  ConfiguracaoAvaliacaoModel,
  () => {
    return new ConfiguracaoAvaliacaoModel();
  },
);
