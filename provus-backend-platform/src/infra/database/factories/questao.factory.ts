import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import DificuldadeQuestaoEnum from 'src/domain/enums/dificuldade-questao.enum';
import TipoQuestaoEnum from 'src/domain/enums/tipo-questao.enum';
import { QuestaoModel } from '../config/models';

export const QuestoesFactory = setSeederFactory(QuestaoModel, () => {
  const questao = new QuestaoModel();

  questao.titulo = faker.lorem.sentence({ min: 5, max: 10 }).replace('.', '?');

  questao.dificuldade = faker.helpers.enumValue(DificuldadeQuestaoEnum);
  questao.tipoQuestao = faker.helpers.enumValue(TipoQuestaoEnum);

  questao.descricao = faker.lorem.paragraph(3);

  questao.pontuacao = faker.number.int({ min: 5, max: 20 });

  questao.isModelo = faker.datatype.boolean();

  questao.exemploResposta = faker.datatype.boolean()
    ? faker.lorem.sentence()
    : null;

  questao.textoRevisao = faker.datatype.boolean()
    ? faker.lorem.paragraph(2)
    : null;

  return questao;
});
