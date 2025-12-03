import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { Env } from 'src/shared/env';
import { AbstractAiProvider } from './interface/ai-provider.abstract';

@Injectable()
export class GroqProvider extends AbstractAiProvider {
  private client: OpenAI;
  private readonly logger = new Logger(GroqProvider.name);

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: Env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generateText(
    prompt: string,
    jsonMode: boolean = false,
  ): Promise<string> {
    this.logger.log('Chamando Groq (Llama-3) [Fallback]...');

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: jsonMode
              ? 'Você é um assistente especialista em educação. Você DEVE responder APENAS com um JSON válido, sem markdown, sem explicações adicionais.'
              : 'Você é um assistente especialista em educação.',
          },
          { role: 'user', content: prompt },
        ],
        model: Env.GROQ_MODEL,

        response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
        temperature: 0.5,
      });

      const content = completion.choices[0].message.content;

      if (!content) {
        throw new Error('Groq retornou conteúdo vazio.');
      }

      return content;
    } catch (error) {
      this.logger.error('Erro na chamada Groq:', error);
      throw error;
    }
  }
}
