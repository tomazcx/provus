import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { Env } from 'src/shared/env';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

@Injectable()
export class StorageProvider {
  private readonly logger = new Logger(StorageProvider.name);
  private client: S3Client;
  private readonly bucket: string;

  constructor() {
    if (!Env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL é obrigatório');
    }
    if (!Env.SUPABASE_ACCESS_KEY) {
      throw new Error('SUPABASE_ACCESS_KEY é obrigatório');
    }
    if (!Env.SUPABASE_SECRET_ACCESS_KEY) {
      throw new Error('SUPABASE_SECRET_ACCESS_KEY é obrigatório');
    }
    if (!Env.SUPABASE_BUCKET) {
      throw new Error('SUPABASE_BUCKET é obrigatório');
    }

    this.client = new S3Client({
      forcePathStyle: true,
      region: 'sa-east-1',
      endpoint: Env.SUPABASE_URL + '/v1/s3',
      credentials: {
        accessKeyId: Env.SUPABASE_ACCESS_KEY,
        secretAccessKey: Env.SUPABASE_SECRET_ACCESS_KEY,
      },
    });

    this.bucket = Env.SUPABASE_BUCKET;
  }

  async uploadFile(
    file: Buffer,
    path: string,
    options?: {
      contentType?: string;
    },
  ): Promise<UploadResult> {
    try {
      if (file.length === 0) {
        return {
          success: false,
          error: 'Arquivo está vazio',
        };
      }

      const sanitizedPath = path.replace(/[^a-zA-Z0-9._/-]/g, '_');

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: sanitizedPath,
        Body: file,
        ContentType: options?.contentType || 'application/octet-stream',
      });

      await this.client.send(command);

      const publicUrl = `${Env.SUPABASE_URL}/v1/object/public/${this.bucket}/${sanitizedPath}`;

      return {
        success: true,
        path: sanitizedPath,
        url: publicUrl,
      };
    } catch (error) {
      this.logger.error(`Erro inesperado no upload: ${error.message}`);
      this.logger.error(`Stack trace:`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteFile(url: string): Promise<DeleteResult> {
    try {
      this.logger.debug(`Iniciando deleção: ${url}`);
      this.logger.debug(`Bucket: ${this.bucket}`);

      const path = url.split('/').pop();

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: path,
      });

      await this.client.send(command);

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Erro inesperado na deleção: ${error.message}`);
      this.logger.error(`Stack trace:`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  getPublicUrl(path: string): string {
    return `${Env.SUPABASE_URL}/v1/object/public/${this.bucket}/${path}`;
  }
}
