import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

console.log('O __dirname do data-source.ts é:', __dirname); // <-- ADICIONE ISSO

config();

export const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  url: process.env.MIGRATE_DATABASE_URL,
  entities: [__dirname + '/models/**/index{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  seeds: [__dirname + '/../seeds/**/*{.ts,.js}'],
  factories: [__dirname + '/../factories/**/*{.ts,.js}'],
  synchronize: false,
};

export const AppDataSource = new DataSource(options);
