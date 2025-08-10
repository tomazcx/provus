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

  static get JWT_SECRET(): string {
    return process.env.JWT_SECRET || '';
  }

  static get JWT_EXPIRES_IN(): string {
    return process.env.JWT_EXPIRES_IN || '';
  }

  static get JWT_AUDIENCE(): string {
    return process.env.JWT_AUDIENCE || '';
  }

  static get FRONTEND_URL(): string {
    return process.env.FRONTEND_URL || '';
  }

  static get SMTP_MAIL_FROM(): string {
    return process.env.SMTP_MAIL_FROM || '';
  }

  static get SMTP_HOST(): string {
    return process.env.SMTP_HOST || '';
  }

  static get SMTP_PORT(): number {
    return Number(process.env.SMTP_PORT) || 587;
  }

  static get SMTP_USER(): string {
    return process.env.SMTP_USER || '';
  }

  static get SMTP_PASS(): string {
    return process.env.SMTP_PASS || '';
  }
}
