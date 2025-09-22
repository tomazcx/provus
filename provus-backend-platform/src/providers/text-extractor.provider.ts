import { Injectable, BadRequestException } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

@Injectable()
export class TextExtractorService {
  async extractTextFromFile(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    switch (mimeType) {
      case 'application/pdf':
        try {
          const data = await pdfParse(fileBuffer);
          return data.text;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          throw new Error(`Falha ao processar o PDF: ${errorMessage}`);
        }

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        try {
          const { value } = await mammoth.extractRawText({
            buffer: fileBuffer,
          });
          return value;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          throw new Error(`Falha ao processar o DOCX: ${errorMessage}`);
        }

      case 'text/plain':
        return fileBuffer.toString('utf-8');

      default:
        throw new BadRequestException(
          `Tipo de arquivo não suportado: ${mimeType}`,
        );
    }
  }
}
