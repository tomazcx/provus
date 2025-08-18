import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager, runSeeder } from 'typeorm-extension';
import 'reflect-metadata';

import {
  AlternativaModel,
  AplicacaoModel,
  AvaliacaoModel,
  AvaliadorModel,
  ConfiguracaoAvaliacaoModel,
  ConfiguracoesGeraisModel,
  ConfiguracoesSegurancaModel,
  PastaModel,
  QuestaoModel,
  QuestoesAvaliacoesModel,
  SubmissaoModel,
} from '../config/models';
import { AppDataSource } from '../config/data-source';
import { ArquivoModel } from '../config/models/arquivo';
import { EstudanteModel } from '../config/models/estudante';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const questoesAvaliacoesRepository = dataSource.getRepository(
      QuestoesAvaliacoesModel,
    );
    const configAvaliacaoRepo = dataSource.getRepository(
      ConfiguracaoAvaliacaoModel,
    );

    const avaliadorFactory = factoryManager.get(AvaliadorModel);
    const questaoFactory = factoryManager.get(QuestaoModel);
    const alternativaFactory = factoryManager.get(AlternativaModel);
    const avaliacaoFactory = factoryManager.get(AvaliacaoModel);
    const aplicacaoFactory = factoryManager.get(AplicacaoModel);
    const submissaoFactory = factoryManager.get(SubmissaoModel);
    const estudanteFactory = factoryManager.get(EstudanteModel);
    const pastaFactory = factoryManager.get(PastaModel);
    const arquivoFactory = factoryManager.get(ArquivoModel);
    const configGeraisFactory = factoryManager.get(ConfiguracoesGeraisModel);
    const configSegurancaFactory = factoryManager.get(
      ConfiguracoesSegurancaModel,
    );

    console.log('Criando 2 avaliadores...');
    const [avaliadorPrincipal, outroAvaliador] =
      await avaliadorFactory.saveMany(2);

    console.log('Criando um banco de 20 questões...');
    const bancoDeQuestoes = await questaoFactory.saveMany(20, {
      avaliador: avaliadorPrincipal,
    });

    console.log(
      'Adicionando alternativas para cada questão (1 correta, 4 incorretas)...',
    );
    for (const questao of bancoDeQuestoes) {
      await alternativaFactory.saveMany(4, { isCorreto: false, questao });
      await alternativaFactory.save({ isCorreto: true, questao });
    }

    console.log('Criando configurações (Gerais e de Segurança)...');
    const configGerais = await configGeraisFactory.save();
    const configSeguranca = await configSegurancaFactory.save();

    console.log('Montando a configuração da avaliação...');
    const novaConfigAvaliacao = configAvaliacaoRepo.create({
      configuracoesGerais: configGerais,
      configuracoesSeguranca: configSeguranca,
    });
    await configAvaliacaoRepo.save(novaConfigAvaliacao);

    console.log('Criando a avaliação principal...');
    const avaliacaoPrincipal = await avaliacaoFactory.save({
      titulo: 'Avaliação de Conhecimentos Gerais 2025',
      avaliador: avaliadorPrincipal,
      configuracaoAvaliacao: novaConfigAvaliacao,
    });

    console.log('Associando 10 questões à avaliação principal...');
    const questoesDaAvaliacao = faker.helpers.arrayElements(
      bancoDeQuestoes,
      10,
    );

    for (const [index, questao] of questoesDaAvaliacao.entries()) {
      const questaoAvaliacao = new QuestoesAvaliacoesModel();
      questaoAvaliacao.avaliacaoId = avaliacaoPrincipal.id;
      questaoAvaliacao.questaoId = questao.id;
      questaoAvaliacao.ordem = index + 1;
      questaoAvaliacao.pontuacao = 10;
      await questoesAvaliacoesRepository.save(questaoAvaliacao);
    }

    console.log('Criando 2 aplicações para a avaliação...');
    const aplicacoes = await aplicacaoFactory.saveMany(2, {
      avaliacao: avaliacaoPrincipal,
    });

    console.log('Criando submissões de estudantes para cada aplicação...');
    for (const aplicacao of aplicacoes) {
      const submissoes = await submissaoFactory.saveMany(15, { aplicacao });
      for (const submissao of submissoes) {
        const nomeUnico = `${submissao.id}_${faker.person.firstName()}`;
        await estudanteFactory.save({
          id: submissao.id,
          submissao,
          email: faker.internet.email({ firstName: nomeUnico }).toLowerCase(),
        });
      }
    }

    console.log('Criando estrutura de pastas e arquivos...');
    const pastaRaiz = await pastaFactory.save({
      titulo: 'Meus Documentos',
      avaliador: outroAvaliador,
    });
    const pastaAvaliacoes = await pastaFactory.save({
      titulo: 'Avaliações Salvas',
      avaliador: outroAvaliador,
      pai: pastaRaiz,
    });
    await arquivoFactory.saveMany(5, {
      avaliador: outroAvaliador,
      pai: pastaRaiz,
    });
    await arquivoFactory.saveMany(3, {
      avaliador: outroAvaliador,
      pai: pastaAvaliacoes,
    });

    console.log('\n Seeding completo executado com sucesso!');
  }
}

const run = async () => {
  await AppDataSource.initialize();
  try {
    await runSeeder(AppDataSource, MainSeeder);
    console.log('Execução do seeder finalizada.');
  } catch (error) {
    console.error(' Erro durante a execução do seeder:', error);
  } finally {
    await AppDataSource.destroy();
  }
};

if (require.main === module) {
  void run();
}
