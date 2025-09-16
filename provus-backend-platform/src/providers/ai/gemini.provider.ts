import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { Env } from 'src/shared/env';
import { AbstractAiProvider } from './interface/ai-provider.abstract';

@Injectable()
export default class GeminiProvider extends AbstractAiProvider {
  private readonly model: string = Env.GEMINI_MODEL;
  private ai: GoogleGenAI;

  constructor() {
    super();
    this.ai = new GoogleGenAI({});
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
    });

    const text = response.text;
    return text;
  }
}
