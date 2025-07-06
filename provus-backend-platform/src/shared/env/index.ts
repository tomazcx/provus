import 'dotenv/config';

export class Env {
  static get APP_NAME(): string {
    return process.env.APP_NAME || '';
  }

  static get APP_DESCRIPTION(): string {
    return process.env.APP_DESCRIPTION || '';
  }

  static get APP_VERSION(): string {
    return process.env.APP_VERSION || '';
  }

  static get ENVIRONMENT(): string {
    return process.env.ENVIRONMENT || '';
  }

  static get PORT(): number {
    return Number(process.env.PORT) || 8000;
  }

  static get DATABASE_URL(): string {
    return process.env.DATABASE_URL || '';
  }

  static get MIGRATE_DATABASE_URL(): string {
    return process.env.MIGRATE_DATABASE_URL || '';
  }

  static get HASH_SALT(): number {
    return Number(process.env.HASH_SALT) || 10;
  }

  static get OPENAI_API_KEY(): string {
    return process.env.OPENAI_API_KEY || '';
  }

  static get DEFAULT_OPENAI_MODEL(): string {
    return process.env.DEFAULT_OPENAI_MODEL || '';
  }
}