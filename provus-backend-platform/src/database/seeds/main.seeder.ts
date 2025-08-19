import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager, runSeeder } from 'typeorm-extension';
import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import TipoItemEnum from 'src/domain/enums/tipo-item.enum';
import { ArquivoModel } from '../config/models/arquivo.model';
import { EstudanteModel } from '../config/models/estudante.model';
import { AlternativaModel } from '../config/models/alternativa.model';
import { AplicacaoModel } from '../config/models/aplicacao.model';
import { AvaliacaoModel } from '../config/models/avaliacao.model';
import { AvaliadorModel } from '../config/models/avaliador.model';
import { ConfiguracaoAvaliacaoModel } from '../config/models/configuracao-avaliacao.model';
import { ConfiguracoesGeraisModel } from '../config/models/configuracoes-gerais.model';
import { ConfiguracoesSegurancaModel } from '../config/models/configuracoes-seguranca.model';
import { ItemSistemaArquivosModel } from '../config/models/item-sistema-arquivos.model';
import { QuestaoModel } from '../config/models/questao.model';
import { QuestoesAvaliacoesModel } from '../config/models/questoes-avaliacoes.model';
import { SubmissaoModel } from '../config/models/submissao.model';

export default class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const itemRepo = dataSource.getRepository(ItemSistemaArquivosModel);
    const questaoRepo = dataSource.getRepository(QuestaoModel);
    const avaliacaoRepo = dataSource.getRepository(AvaliacaoModel);
    const arquivoRepo = dataSource.getRepository(ArquivoModel);
    const questoesAvaliacoesRepository = dataSource.getRepository(
      QuestoesAvaliacoesModel,
    );
    const configAvaliacaoRepo = dataSource.getRepository(
      ConfiguracaoAvaliacaoModel,
    );

    const avaliadorFactory = factoryManager.get(AvaliadorModel);
    const alternativaFactory = factoryManager.get(AlternativaModel);
    const aplicacaoFactory = factoryManager.get(AplicacaoModel);
    const submissaoFactory = factoryManager.get(SubmissaoModel);
    const estudanteFactory = factoryManager.get(EstudanteModel);
    const questaoFactory = factoryManager.get(QuestaoModel);
    const avaliacaoFactory = factoryManager.get(AvaliacaoModel);
    const arquivoFactory = factoryManager.get(ArquivoModel);
    const configGeraisFactory = factoryManager.get(ConfiguracoesGeraisModel);
    const configSegurancaFactory = factoryManager.get(
      ConfiguracoesSegurancaModel,
    );

    // =========================================================================
    // 1. CRIAÇÃO DE AVALIADORES
    // =========================================================================
    console.log('Criando 2 avaliadores...');
    const [avaliadorPrincipal, outroAvaliador] =
      await avaliadorFactory.saveMany(2);

    // =========================================================================
    // 2. CRIAÇÃO DE UM "BANCO DE QUESTÕES" COM ALTERNATIVAS
    // =========================================================================
    console.log('Criando um banco de 20 questões...');
    const bancoDeQuestoes: QuestaoModel[] = [];
    for (let i = 0; i < 20; i++) {
      const itemBase = itemRepo.create({
        titulo: faker.lorem.sentence(5),
        avaliador: avaliadorPrincipal,
        tipo: TipoItemEnum.QUESTAO,
      });
      await itemRepo.save(itemBase);

      const questaoEspecifica = await questaoFactory.make({ id: itemBase.id });
      await questaoRepo.save(questaoEspecifica);

      const questaoCompleta = {
        ...itemBase,
        ...questaoEspecifica,
      } as QuestaoModel;
      bancoDeQuestoes.push(questaoCompleta);
    }

    console.log('Adicionando alternativas para cada questão...');
    for (const questao of bancoDeQuestoes) {
      await alternativaFactory.saveMany(4, {
        isCorreto: false,
        questao: questao,
      });
      await alternativaFactory.save({ isCorreto: true, questao: questao });
    }

    // =========================================================================
    // 3. CRIAÇÃO DE UMA AVALIAÇÃO PRINCIPAL E ASSOCIAÇÃO DAS QUESTÕES
    // =========================================================================
    console.log('Criando configurações...');
    const configGerais = await configGeraisFactory.save();
    const configSeguranca = await configSegurancaFactory.save();
    const novaConfigAvaliacao = configAvaliacaoRepo.create({
      configuracoesGerais: configGerais,
      configuracoesSeguranca: configSeguranca,
    });
    await configAvaliacaoRepo.save(novaConfigAvaliacao);

    console.log('Criando a avaliação principal...');
    const avaliacaoItemBase = itemRepo.create({
      titulo: 'Avaliação de Conhecimentos Gerais 2025',
      avaliador: avaliadorPrincipal,
      tipo: TipoItemEnum.AVALIACAO,
    });
    await itemRepo.save(avaliacaoItemBase);

    const avaliacaoEspecifica = await avaliacaoFactory.make({
      id: avaliacaoItemBase.id,
      configuracaoAvaliacao: novaConfigAvaliacao,
    });
    await avaliacaoRepo.save(avaliacaoEspecifica);
    const avaliacaoPrincipal = {
      ...avaliacaoItemBase,
      ...avaliacaoEspecifica,
    } as AvaliacaoModel;

    console.log('Associando 10 questões à avaliação principal...');
    const questoesDaAvaliacao = faker.helpers.arrayElements(
      bancoDeQuestoes,
      10,
    );
    for (const [index, questao] of questoesDaAvaliacao.entries()) {
      const questaoAvaliacao = questoesAvaliacoesRepository.create({
        avaliacaoId: avaliacaoPrincipal.id,
        questaoId: questao.id,
        ordem: index + 1,
        pontuacao: 10,
      });
      await questoesAvaliacoesRepository.save(questaoAvaliacao);
    }

    // =========================================================================
    // 4. CRIAÇÃO DE APLICAÇÕES E SUBMISSÕES
    // =========================================================================
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

    // =========================================================================
    // 5. CRIAÇÃO DE PASTAS E ARQUIVOS
    // =========================================================================
    console.log('Criando estrutura de pastas e arquivos...');
    const pastaRaiz = itemRepo.create({
      titulo: 'Meus Documentos',
      avaliador: outroAvaliador,
      tipo: TipoItemEnum.PASTA,
    });
    await itemRepo.save(pastaRaiz);

    const pastaAvaliacoes = itemRepo.create({
      titulo: 'Avaliações Salvas',
      avaliador: outroAvaliador,
      pai: pastaRaiz,
      tipo: TipoItemEnum.PASTA,
    });
    await itemRepo.save(pastaAvaliacoes);

    console.log('Criando arquivos...');
    for (let i = 0; i < 5; i++) {
      const arqItemBase = itemRepo.create({
        titulo: faker.system.fileName(),
        avaliador: outroAvaliador,
        pai: pastaRaiz,
        tipo: TipoItemEnum.ARQUIVO,
      });
      await itemRepo.save(arqItemBase);

      const arqEspecifico = await arquivoFactory.make({ id: arqItemBase.id });
      await arquivoRepo.save(arqEspecifico);
    }
    for (let i = 0; i < 3; i++) {
      const arqItemBase = itemRepo.create({
        titulo: faker.system.fileName(),
        avaliador: outroAvaliador,
        pai: pastaAvaliacoes,
        tipo: TipoItemEnum.ARQUIVO,
      });
      await itemRepo.save(arqItemBase);

      const arqEspecifico = await arquivoFactory.make({ id: arqItemBase.id });
      await arquivoRepo.save(arqEspecifico);
    }

    console.log('\nSeeding completo executado com sucesso!');
  }
}

const run = async () => {
  await AppDataSource.initialize();
  try {
    await runSeeder(AppDataSource, MainSeeder);
    console.log('Execução do seeder finalizada.');
  } catch (error) {
    console.error('Erro durante a execução do seeder:', error);
  } finally {
    await AppDataSource.destroy();
  }
};

if (require.main === module) {
  void run();
}
