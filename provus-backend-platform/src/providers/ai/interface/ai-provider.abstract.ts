export abstract class AbstractAiProvider {
  abstract generateText(prompt: string, jsonMode?: boolean): Promise<string>;
}
