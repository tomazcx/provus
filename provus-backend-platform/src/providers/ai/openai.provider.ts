import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AbstractAiProvider } from './interface/ai-provider.abstract';

@Injectable()
export class OpenAiProvider extends AbstractAiProvider {
  private client: OpenAI;
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor() {
    super();
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateText(
    prompt: string,
    jsonMode: boolean = false,
  ): Promise<string> {
    this.logger.log('Chamando OpenAI (Fallback)...');

    const completion = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      response_format: jsonMode ? { type: 'json_object' } : { type: 'text' },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('OpenAI retornou conteúdo vazio');

    return content;
  }
}
