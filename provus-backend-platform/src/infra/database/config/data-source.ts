import { config } from 'dotenv'
import { DataSource } from 'typeorm'

config()
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.MIGRATE_DATABASE_URL,
  migrations: [__dirname + '/migrations/*.ts'],
})
