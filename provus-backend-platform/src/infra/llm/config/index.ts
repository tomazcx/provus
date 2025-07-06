import { OpenAI } from 'openai';
import { Env } from 'src/shared/env';

export const openai = new OpenAI({
  apiKey: Env.OPENAI_API_KEY,
});
