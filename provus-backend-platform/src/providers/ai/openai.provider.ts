import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Env } from 'src/shared/env';
import { AbstractAiProvider } from './interface/ai-provider.abstract';

@Injectable()
export class OpenAiProvider extends AbstractAiProvider {
  private client: OpenAI;
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor() {
    super();
    if (!Env.OPENAI_API_KEY) {
      this.logger.warn(
        'OPENAI_API_KEY não configurada. Fallback falhará se acionado.',
      );
    }
    this.client = new OpenAI({ apiKey: Env.OPENAI_API_KEY });
  }

  async generateText(
    prompt: string,
    jsonMode: boolean = false,
  ): Promise<string> {
    this.logger.log('Chamando OpenAI (GPT-4o-mini)...');

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: jsonMode
              ? 'Você é um assistente especialista em educação. Responda estritamente em JSON válido.'
              : 'Você é um assistente especialista em educação.',
          },
          { role: 'user', content: prompt },
        ],
        model: Env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.5,
        response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
      });

      const message = completion.choices[0].message;

      if (message.refusal) {
        this.logger.error(`OpenAI recusou a geração: ${message.refusal}`);
        throw new Error(`OpenAI Recusal: ${message.refusal}`);
      }

      const content = message.content;

      if (!content) {
        this.logger.error(
          'OpenAI retornou conteúdo null/vazio. Full Response:',
          JSON.stringify(completion),
        );
        throw new Error('OpenAI retornou conteúdo vazio.');
      }

      return content;
    } catch (error) {
      this.logger.error('Erro na chamada OpenAI:', error);
      throw error;
    }
  }
}
