import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as libre from 'libreoffice-convert';
import { promisify } from 'util';

@Injectable()
export class FileConverterProvider {
  private readonly logger = new Logger(FileConverterProvider.name);
  private readonly convertAsync = promisify(libre.convert);

  isConvertible(mimeType: string): boolean {
    const convertibleMimes = [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain', // .txt
      'application/rtf', // .rtf
      'application/vnd.oasis.opendocument.text', // .odt
      'application/vnd.oasis.opendocument.presentation', // .odp
    ];
    return convertibleMimes.includes(mimeType);
  }

  async convertToPdf(
    fileBuffer: Buffer,
    inputExtension: string,
  ): Promise<Buffer> {
    try {
      this.logger.log(
        `Iniciando conversão de arquivo .${inputExtension} para PDF...`,
      );

      const pdfBuffer = await this.convertAsync(fileBuffer, '.pdf', undefined);

      this.logger.log('Conversão concluída com sucesso.');
      return pdfBuffer;
    } catch (error) {
      this.logger.error('Erro ao converter arquivo para PDF:', error);
      throw new InternalServerErrorException(
        'Falha ao processar o arquivo para formato seguro (PDF).',
      );
    }
  }
}
