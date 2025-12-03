import { Injectable, Logger } from '@nestjs/common';
import { AbstractAiProvider } from './interface/ai-provider.abstract';
import GeminiProvider from './gemini.provider';
import { OpenAiProvider } from './openai.provider';
import { GroqProvider } from './groq.provider';
@Injectable()
export class ResilientAiProvider extends AbstractAiProvider {
  private readonly logger = new Logger(ResilientAiProvider.name);

  constructor(
    private readonly primary: GeminiProvider,
    private readonly secondary: OpenAiProvider,
    private readonly terciary: GroqProvider,
  ) {
    super();
  }

  async generateText(
    prompt: string,
    jsonMode: boolean = false,
  ): Promise<string> {
    try {
      return await this.primary.generateText(prompt, jsonMode);
    } catch (error) {
      this.logger.warn(
        `Falha no provedor primário (Gemini). Tentando fallback... Erro: ${error.message}`,
      );

      try {
        return await this.secondary.generateText(prompt, jsonMode);
      } catch (secondaryError) {
        this.logger.warn(
          `Falha no provedor secundário (OpenAI). Tentando fallback... Erro: ${secondaryError.message}`,
        );

        try {
          return await this.terciary.generateText(prompt, jsonMode);
        } catch (terciaryError) {
          this.logger.warn(
            `Falha no provedor terciário (Groq). Tentando fallback... Erro: ${terciaryError.message}`,
          );

          this.logger.error(
            `Falha crítica: Ambos os provedores falharam.`,
            terciaryError,
          );
          throw terciaryError;
        }
      }
    }
  }
}
